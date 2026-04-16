from dataclasses import dataclass


@dataclass
class SafetyAssessment:
    risk_level: str
    needs_urgent_help: bool
    support_themes: list[str]


class SafetyGuardrailsService:
    crisis_terms = {
        "suicide",
        "kill myself",
        "self-harm",
        "want to die",
        "end my life",
        "hurt myself",
        "marna",
        "mar na",
        "jeena nahi",
        "jeevan khatam",
        "maraycha",
        "jiv dya",
    }
    stress_terms = {
        "stress",
        "stressed",
        "anxious",
        "overwhelmed",
        "panic",
        "hackathon",
        "exam",
        "deadline",
        "project",
        "college",
        "sleep",
        "didn't sleep",
        "not sleep",
        "all night",
    }

    @classmethod
    def assess(cls, message: str) -> SafetyAssessment:
        lower_message = message.lower()

        if any(term in lower_message for term in cls.crisis_terms):
            return SafetyAssessment(
                risk_level="high",
                needs_urgent_help=True,
                support_themes=["crisis_support", "urgent_safety"],
            )

        detected_stress_themes = [term for term in cls.stress_terms if term in lower_message]
        if detected_stress_themes:
            themes = []
            if any(term in lower_message for term in ["sleep", "not sleep", "all night", "didn't sleep"]):
                themes.append("sleep_exhaustion")
            if any(term in lower_message for term in ["hackathon", "exam", "deadline", "project", "college"]):
                themes.append("academic_or_workload_pressure")
            if any(term in lower_message for term in ["stress", "stressed", "anxious", "overwhelmed", "panic"]):
                themes.append("emotional_overload")

            return SafetyAssessment(
                risk_level="medium",
                needs_urgent_help=False,
                support_themes=themes or ["stress_support"],
            )

        return SafetyAssessment(
            risk_level="low",
            needs_urgent_help=False,
            support_themes=["general_support"],
        )
