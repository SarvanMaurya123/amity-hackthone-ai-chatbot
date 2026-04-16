from functools import lru_cache
import logging
import time

from langchain_mistralai.chat_models import ChatMistralAI

from app.core.config import settings


logger = logging.getLogger("llm_service")


class LLMService:
    def __init__(self) -> None:
        self.client = ChatMistralAI(
            model=settings.llm_model_name,
            api_key=settings.mistral_api_key,
            temperature=0.7,
            top_p=0.9,
        )

    def generate(self, prompt, variables: dict) -> str:
        start_time = time.time()

        try:
            chain = prompt | self.client
            response = chain.invoke(variables)

            output = response.content if hasattr(response, "content") else str(response)

            duration = round(time.time() - start_time, 3)

            logger.info(
                f"[LLM USED] model={settings.llm_model_name} "
                f"time={duration}s "
                f"input_keys={list(variables.keys())}"
            )

            return output

        except Exception as e:
            logger.error(f"[LLM ERROR] {str(e)}")
            raise


@lru_cache
def get_llm_service() -> LLMService:
    return LLMService()
