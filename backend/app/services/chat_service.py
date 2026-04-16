from functools import lru_cache
import logging
import re

from app.core.config import settings
from app.schemas.chat import ChatResponse, ModelPrediction
from app.schemas.conversation import ConversationCreate, ConversationMessageCreate
from app.services.classifier_service import (
    get_binary_classifier,
    get_primary_classifier,
    get_tertiary_classifier,
)
from app.services.conversation_service import ConversationService
from app.services.language_service import LanguageService
from app.services.llm_service import get_llm_service
from app.services.memory_service import MemoryService
from app.services.prompt_builder_service import PromptBuilderService
from app.services.safety_guardrails_service import SafetyAssessment, SafetyGuardrailsService


logger = logging.getLogger("chat_service")


class ChatService:
    ROUTE_CONFIDENCE_THRESHOLD = 0.75
    HISTORY_WINDOW = 6
    GREETING_PATTERN = re.compile(
        r"^\s*(hi+|hii+|hiii+|hello+|hey+|heyy+|hola|namaste|namaskar)\s*[!.?]*\s*$",
        re.IGNORECASE,
    )

    def __init__(self) -> None:
        self.primary_classifier = get_primary_classifier()
        self.binary_classifier = get_binary_classifier()
        self.tertiary_classifier = get_tertiary_classifier()
        self.llm_service = get_llm_service()
        self.language_service = LanguageService()
        self.memory_service = MemoryService()
        self.prompt_builder = PromptBuilderService()
        self.safety_guardrails = SafetyGuardrailsService()

    @staticmethod
    def route_message(message: str, pkl_confidence: float, safety_result: SafetyAssessment) -> str:
        del message
        if safety_result.needs_urgent_help:
            return "rule_based_crisis"
        if settings.has_valid_mistral_api_key:
            return "llm"
        if pkl_confidence >= ChatService.ROUTE_CONFIDENCE_THRESHOLD:
            return "pkl_model"
        return "llm"

    @staticmethod
    def normalize_output(reply: str, source: str, language: str) -> dict[str, str]:
        return {"reply": reply, "source": source, "language": language}

    @classmethod
    def is_greeting(cls, message: str) -> bool:
        return bool(cls.GREETING_PATTERN.match(message.strip()))

    def generate_reply(self, user_id: str, message: str, conversation_id: str | None = None) -> ChatResponse:
        language_context = self.language_service.build_context(message)
        safety_assessment = self.safety_guardrails.assess(message)
        primary_prediction = self.primary_classifier.predict(message)
        secondary_prediction = self.binary_classifier.predict(message)
        tertiary_prediction = self.tertiary_classifier.predict(message)
        memory_context = self.memory_service.get_memory_context(user_id)

        route = self.route_message(message, primary_prediction["confidence"], safety_assessment)
        logger.info(
            "[CHAT ROUTE] language=%s route=%s user=%s",
            language_context.detected_language,
            route,
            user_id,
        )

        if conversation_id is None:
            conversation = ConversationService.create_for_user(user_id, ConversationCreate(title="New Chat"))
            conversation_id = conversation.id
            conversation_history = ""
        else:
            conversation = ConversationService.get_for_user(user_id, conversation_id)
            conversation_history = self._build_conversation_history(conversation.messages)

        ConversationService.add_message_for_user(
            user_id,
            conversation_id,
            ConversationMessageCreate(role="user", content=message, is_streaming=False),
            metadata={
                "detected_language": language_context.detected_language,
                "language_style": language_context.language_style,
                "route": route,
            },
        )

        if route == "rule_based_crisis":
            reply = self._generate_crisis_reply(language_context.detected_language)
            source = "rule_based"
            model_used = "rule_based_crisis"
            used_fallback = False
        elif route == "pkl_model":
            reply = self._generate_pkl_reply(
                language=language_context.detected_language,
                message=message,
                primary_prediction=primary_prediction,
                tertiary_prediction=tertiary_prediction,
                safety_assessment=safety_assessment,
            )
            source = "pkl_model"
            model_used = "pkl_model"
            used_fallback = False
        else:
            reply, source, model_used, used_fallback = self._generate_llm_reply(
                message=message,
                language=language_context.detected_language,
                language_style=language_context.language_style,
                primary_prediction=primary_prediction,
                secondary_prediction=secondary_prediction,
                tertiary_prediction=tertiary_prediction,
                safety_assessment=safety_assessment,
                memory_context=memory_context,
                conversation_history=conversation_history,
            )

        normalized_output = self.normalize_output(
            reply=reply,
            source=source,
            language=language_context.detected_language,
        )
        logger.info("[CHAT MODEL] source=%s model=%s", normalized_output["source"], model_used)

        updated_memory = self.memory_service.record_interaction(
            user_id=user_id,
            conversation_id=conversation_id,
            message=message,
            primary_prediction=primary_prediction,
            secondary_prediction=secondary_prediction,
            tertiary_prediction=tertiary_prediction,
            safety_assessment=safety_assessment,
        )
        conversation = ConversationService.add_message_for_user(
            user_id,
            conversation_id,
            ConversationMessageCreate(role="assistant", content=normalized_output["reply"], is_streaming=False),
            metadata={
                "primary_prediction": primary_prediction,
                "secondary_prediction": secondary_prediction,
                "tertiary_prediction": tertiary_prediction,
                "risk_level": safety_assessment.risk_level,
                "support_themes": safety_assessment.support_themes,
                "memory_summary": updated_memory.user_pattern_summary,
                "detected_language": language_context.detected_language,
                "language_style": language_context.language_style,
                "source": normalized_output["source"],
                "route": route,
                "model_used": model_used,
                "used_fallback": used_fallback,
            },
        )

        return ChatResponse(
            reply=normalized_output["reply"],
            answer=normalized_output["reply"],
            source=normalized_output["source"],
            language=normalized_output["language"],
            detected_language=language_context.detected_language,
            language_style=language_context.language_style,
            primary_prediction=ModelPrediction(**primary_prediction),
            secondary_prediction=ModelPrediction(**secondary_prediction),
            tertiary_prediction=ModelPrediction(**tertiary_prediction),
            model_used=model_used,
            used_fallback=used_fallback,
            conversation=conversation,
        )

    def _generate_llm_reply(
        self,
        *,
        message: str,
        language: str,
        language_style: str,
        primary_prediction: dict,
        secondary_prediction: dict,
        tertiary_prediction: dict,
        safety_assessment: SafetyAssessment,
        memory_context,
        conversation_history: str,
    ) -> tuple[str, str, str, bool]:
        prompt = self.prompt_builder.build_prompt()
        prompt_variables = {
            "message": message,
            "detected_language": language,
            "language_style": language_style,
            "primary_label": primary_prediction["label"],
            "primary_confidence": primary_prediction["confidence"],
            "secondary_label": secondary_prediction["label"],
            "secondary_confidence": secondary_prediction["confidence"],
            "tertiary_label": tertiary_prediction["label"],
            "tertiary_confidence": tertiary_prediction["confidence"],
            "risk_level": safety_assessment.risk_level,
            "needs_urgent_help": safety_assessment.needs_urgent_help,
            "support_themes": ", ".join(safety_assessment.support_themes),
            "recent_emotional_states": ", ".join(memory_context.recent_emotional_states) or "none",
            "recurring_emotional_themes": ", ".join(memory_context.recurring_themes) or "none",
            "memory_last_risk_level": memory_context.last_risk_level,
            "user_pattern_summary": memory_context.user_pattern_summary,
            "conversation_history": conversation_history or "No previous conversation in this session.",
        }

        if not settings.has_valid_mistral_api_key:
            reply = self._generate_pkl_reply(
                language=language,
                message=message,
                primary_prediction=primary_prediction,
                tertiary_prediction=tertiary_prediction,
                safety_assessment=safety_assessment,
            )
            return reply, "pkl_model", "pkl_model", True

        try:
            reply = self.llm_service.generate(prompt, prompt_variables)
            reply = self.language_service.ensure_language(reply, language)
            if reply.strip():
                return reply, "llm", settings.llm_model_name, False
        except Exception as exc:
            logger.warning("LLM reply generation failed, using fallback: %s", exc)

        reply = self._generate_pkl_reply(
            language=language,
            message=message,
            primary_prediction=primary_prediction,
            tertiary_prediction=tertiary_prediction,
            safety_assessment=safety_assessment,
        )
        return reply, "pkl_model", "pkl_model", True

    @classmethod
    def _build_conversation_history(cls, messages) -> str:
        recent_messages = messages[-cls.HISTORY_WINDOW:]
        history_lines = [f"{item.role}: {item.content}" for item in recent_messages if item.content.strip()]
        return "\n".join(history_lines)

    def _generate_crisis_reply(self, language: str) -> str:
        templates = {
            "english": self._format_reply(
                "This sounds like an immediate safety situation.",
                [
                    "Call your local emergency number right now or go to the nearest emergency room.",
                    "Call or message a trusted person and ask them to stay with you.",
                    "Move away from anything you could use to hurt yourself.",
                ],
                "You do not need to handle this alone right now. Immediate human support matters most.",
                [
                    "Call emergency services now.",
                    "Message one trusted person to stay with you.",
                    "Go to the nearest hospital or emergency room.",
                ],
            ),
            "hindi": self._format_reply(
                "Yeh turant suraksha wali sthiti lag rahi hai.",
                [
                    "Abhi apne local emergency number par call kijiye ya nearest emergency room jaiye.",
                    "Kisi trusted insaan ko abhi call ya message kijiye aur unse apne saath rehne ko kahiye.",
                    "Jo cheezen nuksan pahuncha sakti hain unse abhi door ho jaiye.",
                ],
                "Aapko yeh akela sambhalna nahi hai. Is waqt turant insani madad sabse zaroori hai.",
                [
                    "Emergency services ko abhi call kijiye.",
                    "Ek trusted insaan ko message kijiye.",
                    "Nearest hospital ya emergency room jaiye.",
                ],
            ),
            "hinglish": self._format_reply(
                "Yeh abhi immediate safety wali situation lag rahi hai.",
                [
                    "Abhi local emergency number call karo ya nearest emergency room chale jao.",
                    "Kisi trusted person ko abhi message ya call karo aur bolo ki woh tumhare saath rahe.",
                    "Jo cheezein tumhe harm kar sakti hain unse abhi door ho jao.",
                ],
                "Tumhe yeh akela handle nahi karna hai. Is waqt real human support sabse important hai.",
                [
                    "Emergency services ko abhi call karo.",
                    "Ek trusted person ko abhi message karo.",
                    "Nearest hospital ya emergency room jao.",
                ],
            ),
            "marathi": self._format_reply(
                "Hi turat surakshechi sthiti diste aahe.",
                [
                    "Ata local emergency number var call kara kiwa nearest emergency room madhye ja.",
                    "Konya trusted vyaktila ata call kiwa message kara ani tyanna tumchya sobat rahayla sanga.",
                    "Jya goshti nuksan karu shaktat tyanchyapasun ata door ja.",
                ],
                "He ata ektyane sambhalayache nahi. Ata turat manavi madat far mahatvachi aahe.",
                [
                    "Ata emergency services la call kara.",
                    "Eka trusted vyaktila message kara.",
                    "Nearest hospital kiwa emergency room madhye ja.",
                ],
            ),
        }
        return templates.get(language, templates["english"])

    def _generate_pkl_reply(
        self,
        *,
        language: str,
        message: str,
        primary_prediction: dict,
        tertiary_prediction: dict,
        safety_assessment: SafetyAssessment,
    ) -> str:
        lower_message = message.lower()
        label_text = f"{primary_prediction['label']} {tertiary_prediction['label']}".lower()
        if self.is_greeting(message):
            return self._template_pack(language, "greeting")
        if "sleep_exhaustion" in safety_assessment.support_themes and "academic_or_workload_pressure" in safety_assessment.support_themes:
            return self._template_pack(language, "hackathon")
        if any(term in label_text for term in ["sad", "depress", "hopeless", "low"]):
            return self._template_pack(language, "low_mood")
        if any(term in lower_message for term in ["hackathon", "deadline", "exam", "project"]):
            return self._template_pack(language, "hackathon")
        if "emotional_overload" in safety_assessment.support_themes:
            return self._template_pack(language, "stress")
        return self._template_pack(language, "general")

    def _template_pack(self, language: str, template_name: str) -> str:
        templates = {
            "english": {
                "greeting": self._format_reply("Hi, it is nice to hear from you.", ["Tell me what is on your mind today.", "If you want, share one problem you want help with.", "You can also ask for a plan, calming help, or just talk."], "We can take this one small step at a time.", ["Tell me how you are feeling right now.", "Share one thing you want help with today.", "Ask me to help you make a simple plan."]),
                "hackathon": self._format_reply("It makes sense that tomorrow feels overwhelming when you still have work left.", ["Pick one minimum demo feature and finish only that tonight.", "Work in one 25-minute block, then take a 5-minute reset.", "Drink water and close unrelated tabs before you continue."], "You do not need a perfect project tonight. You only need one stable next step.", ["Write the one feature you will finish tonight.", "Start one 25-minute work block now.", "Come back and tell me what you completed."]),
                "low_mood": self._format_reply("This sounds emotionally heavy and draining right now.", ["Drink some water and eat something small if you have not eaten.", "Do one tiny task only, even if it is just washing your face.", "Sit near a person, window, or light instead of staying isolated."], "You do not need to solve your whole life tonight. Small movement still counts.", ["Tell me what feels most useless right now.", "Pick one tiny task for the next 10 minutes.", "Tell one trusted person that today feels hard."]),
                "stress": self._format_reply("It sounds like your mind is overloaded right now.", ["Take 3 slow breaths and loosen your shoulders.", "Drink water and step away from the screen for 2 minutes.", "Choose one small task instead of thinking about everything at once."], "Panic usually gets smaller when the next step gets simpler.", ["Tell me the one problem you want to solve first.", "Do a 2-minute pause and come back.", "List the next single task in one line."]),
                "general": self._format_reply("It sounds like things feel heavy right now.", ["Pause for a minute and slow your breathing down.", "Drink some water and sit somewhere a little calmer.", "Pick one small thing you can do in the next 10 minutes."], "You do not need to fix everything right now. One small step is enough for this moment.", ["Tell me what is feeling heaviest right now.", "Pick one manageable task for the next 10 minutes.", "Ask me to help you break this down simply."]),
            },
            "hindi": {
                "greeting": self._format_reply("Namaste, aapse baat karke achha laga.", ["Aaj aapke mann mein jo hai woh bataiye.", "Agar chahein to ek problem batayiye jismein madad chahiye.", "Chahein to plan, shaant hone ki madad, ya seedhi baat kar sakte hain."], "Hum isko aaraam se ek ek kadam mein le sakte hain.", ["Batayiye abhi aap kaisa mehsoos kar rahe hain.", "Aaj kis ek cheez mein madad chahiye woh batayiye.", "Mujhse kahiye ki main ek simple plan bana doon."]),
                "hackathon": self._format_reply("Kal ka din bhaari lagna swabhavik hai jab kaam abhi baaki ho.", ["Aaj raat sirf ek chhota hissa chuniye aur usi ko poora kijiye.", "25 minute ka ek dhyan wala daur lijiye, phir 5 minute ka chhota break lijiye.", "Paani pijiye aur bekaar tabs bandh karke hi kaam shuru kijiye."], "Aaj raat poora kaam behtareen banana zaruri nahi hai. Sirf ek pakka agla kadam zaroori hai.", ["Likhiye ki aaj raat kaunsa ek hissa poora karna hai.", "Abhi ek 25 minute ka daur shuru kijiye.", "Mujhe batayiye ki aapne kya poora kiya."]),
                "low_mood": self._format_reply("Yeh abhi dil par bhaari aur thakane wala lag raha hai.", ["Thoda paani pijiye aur kuch halka khaiye agar aapne nahi khaya hai.", "Sirf ek bahut chhota kaam kijiye, chahe bas muh dho lena ho.", "Akele band mat rahiye, kisi roshni ya kisi insaan ke paas baith jaiye."], "Aaj raat poori zindagi samajhna zaroori nahi hai. Chhota sa hilaav bhi maayne rakhta hai.", ["Batayiye abhi sabse bekaar kya lag raha hai.", "Agale 10 minute ke liye ek chhota kaam chuniye.", "Kisi trusted insaan ko batayiye ki aaj din bhaari lag raha hai."]),
                "stress": self._format_reply("Aisa lag raha hai ki dimaag par bahut zyada bojh hai.", ["3 dheemi saanse lijiye aur kandhe dheele chhodiye.", "Paani pijiye aur 2 minute ke liye screen se hat jaiye.", "Sab kuch ek saath sochne ke bajay sirf ek chhota kaam chuniye."], "Jab agla kadam chhota hota hai tab ghabrahat dheere dheere kam hoti hai.", ["Batayiye pehla kaunsa masla suljhana hai.", "2 minute ka pause lijiye aur phir wapas aaiye.", "Agla ek kaam ek line mein likhiye."]),
                "general": self._format_reply("Lagta hai ki sab kuch abhi bhaari mehsoos ho raha hai.", ["Ek minute rukkar saans ko dheema kijiye.", "Thoda paani pijiye aur thodi shaant jagah par baithiye.", "Agale 10 minute mein hone wala ek chhota kaam chuniye."], "Aapko abhi sab kuch theek karna nahi hai. Is pal ke liye ek chhota kadam kaafi hai.", ["Batayiye abhi sabse bhaari kya lag raha hai.", "Agale 10 minute ke liye ek sambhalne layak kaam chuniye.", "Mujhse kahiye ki main isko chhote kadamon mein tod doon."]),
            },
            "hinglish": {
                "greeting": self._format_reply("Hi, tumse baat karke achha laga.", ["Jo bhi tumhare mind mein hai woh batao.", "Agar chaho to ek problem share karo jisme help chahiye.", "Chahe to plan, calm hone ki help, ya normal baat bhi kar sakte ho."], "Hum isko aaram se ek ek step mein le sakte hain.", ["Batao abhi tum kaisa feel kar rahe ho.", "Aaj kis ek cheez mein help chahiye woh bolo.", "Mujhse bolo ki main ek simple plan bana doon."]),
                "hackathon": self._format_reply("Kal ka hackathon heavy lagna bilkul normal hai jab kaam abhi baaki ho.", ["Aaj raat sirf ek minimum demo feature choose karo aur usi par kaam karo.", "25 minute ka focused block lagao, phir 5 minute ka short break lo.", "Paani piyo aur saare unrelated tabs band karo."], "Aaj perfect project nahi chahiye. Bas ek stable next step chahiye.", ["Likho ki aaj raat kaunsa ek feature finish karna hai.", "Abhi ek 25 minute ka work block start karo.", "Mujhe batao ki us block ke baad kya complete hua."]),
                "low_mood": self._format_reply("Yeh abhi kaafi heavy aur draining feel ho raha hai.", ["Paani piyo aur kuch halka khao agar abhi tak nahi khaya.", "Sirf ek tiny task karo, chahe bas face wash hi kyu na ho.", "Bilkul isolated mat raho, kisi light ya kisi insaan ke paas baitho."], "Aaj raat poori life figure out karni zaroori nahi hai. Small movement bhi count karta hai.", ["Mujhe batao abhi sabse bekaar kya lag raha hai.", "Next 10 minutes ke liye ek tiny task choose karo.", "Ek trusted person ko batao ki aaj din tough lag raha hai."]),
                "stress": self._format_reply("Lag raha hai ki dimaag abhi overload mode mein hai.", ["3 slow breaths lo aur shoulders relax karo.", "Paani piyo aur 2 minute ke liye screen se hat jao.", "Sab kuch ek saath mat pakdo, sirf ek small next task choose karo."], "Jab next step simple hota hai tab panic thoda kam padta hai.", ["Mujhe batao pehla problem kaunsa solve karna hai.", "2 minute ka pause lo aur phir wapas aao.", "Agla ek task ek line mein likho."]),
                "general": self._format_reply("Lag raha hai ki cheezein abhi kaafi heavy feel ho rahi hain.", ["Ek minute rukkar breathing slow karo.", "Thoda paani piyo aur thodi calmer jagah par baitho.", "Next 10 minutes ke liye ek small task choose karo."], "Tumhe abhi sab kuch solve nahi karna hai. Is moment ke liye ek chhota step enough hai.", ["Mujhe batao abhi sabse heavy kya lag raha hai.", "Next 10 minutes ke liye ek manageable task pick karo.", "Bolo to main isko simple steps mein break kar doon."]),
            },
            "marathi": {
                "greeting": self._format_reply("Namaskar, tumchashi bolun changle vatle.", ["Aaj tumchya manat kay aahe te sanga.", "Hav asel tar ek problem sanga jithe madat pahije.", "Plan, shaant honyachi madat, kiwa simple bolne pan chalu shakto."], "Aapan he araamat ek ek kadamane gheu shakto.", ["Ata tumhala kase vatat aahe te sanga.", "Aaj kontya ek goshtit madat pahije te sanga.", "Mala sanga ki mi ek simple plan tayar karu ka."]),
                "hackathon": self._format_reply("Udyacha hackathon jhad vatane swabhavik aahe jevha kaam ajun rahile aahe.", ["Aaj ratri fakta ek chhota bhaag niva ani toch poora kara.", "25 minute ekagrate ne kaam kara ani mag 5 minute chhota vishranti ghya.", "Pani pya ani nako aslele tabs band kara."], "Aaj ratri sarvottam prakalp lagat nahi. Fakta ek pakka pudhcha kadam purto aahe.", ["Aaj ratri konta ek bhaag poora karaycha te liha.", "Ata ek 25 minute cha daur suru kara.", "Tyachyanantar kay poora zala te mala sanga."]),
                "low_mood": self._format_reply("He atta khup jhad ani draining vatat aahe.", ["Pani pya ani kahi halka kha jar ajun khalle nasel.", "Fakta ek chhota task kara, jase ki tond dhun ghene.", "Purn ektyane basu naka, light kiva konachyatari javal basa."], "Aaj ratri sampurn jeevan samjun ghyaychi garaj nahi. Chhota halchal suddha mahatvachi aahe.", ["Ata sarvat vyartha kay vatat aahe te sanga.", "Pudchya 10 minute sathi ek chhota task niva.", "Eka trusted vyaktila sanga ki aaj divas jhad aahe."]),
                "stress": self._format_reply("Vatate ki atta dimagavar khup load aahe.", ["3 halke shwas ghya ani kandhe relax kara.", "Pani pya ani 2 minute screen pasun door ja.", "Sagla ekatra vicharu naka, fakta ek chhota pudhcha kaam niva."], "Jevha pudhcha kadam sopa asto tevha ghabar thodi kami hote.", ["Pahila prashna konta sambhalaycha te sanga.", "2 minute cha thamba ghya ani parat ya.", "Pudhcha ek kaam eka line madhye liha."]),
                "general": self._format_reply("Vatate ki atta sagla jhad disat aahe.", ["Ek minute thamba ani shwas halke kara.", "Pani pya ani thodi shaant jagi basa.", "Pudchya 10 minute sathi ek chhota kaam niva."], "Ata sagla solve karaychi garaj nahi. Ya velesathi ek chhota kadam puresa aahe.", ["Ata sarvat jhad kay vatat aahe te sanga.", "Pudchya 10 minute sathi ek sambhalta yeil ase kaam niva.", "Mala sanga ani mi he chhote tappyanmadhe todto."]),
            },
        }
        return templates.get(language, templates["english"])[template_name]

    @staticmethod
    def _format_reply(acknowledgement: str, actions: list[str], grounding: str, next_steps: list[str]) -> str:
        bullet_block = "\n".join(f"- {action}" for action in actions[:4])
        next_steps_block = "\n".join(f"{index}. {step}" for index, step in enumerate(next_steps[:3], start=1))
        return f"[1] {acknowledgement}\n\n[2]\n{bullet_block}\n\n[3] {grounding}\n\n[4]\n{next_steps_block}"


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService()
