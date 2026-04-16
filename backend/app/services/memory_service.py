"""
memory_service.py
-----------------
Manages per-user emotional memory: recording interaction snapshots,
building rolling summaries, and surfacing context for downstream
response generation.

Dependencies:
  - app.repositories.emotional_memory_repository.EmotionalMemoryRepository
  - app.services.safety_guardrails_service.SafetyAssessment
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Final

from app.repositories.emotional_memory_repository import EmotionalMemoryRepository
from app.services.safety_guardrails_service import SafetyAssessment


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_MAX_SNAPSHOTS:      Final[int] = 12   # rolling window kept in storage
_RECENT_STATE_COUNT: Final[int] = 5    # how many recent states to surface
_TOP_THEMES_COUNT:   Final[int] = 4    # max recurring themes to surface
_TOP_STATES_COUNT:   Final[int] = 3    # dominant states used in summary line
_MESSAGE_EXCERPT_LEN: Final[int] = 180 # chars stored per snapshot

_DEFAULT_RISK_LEVEL:   Final[str] = "unknown"
_DEFAULT_PATTERN_TEXT: Final[str] = "No emotional history yet."

# Support-theme  ->  emotional state label (evaluated in order)
_THEME_STATE_MAP: Final[list[tuple[str, str]]] = [
    ("sleep_exhaustion",              "exhausted"),
    ("emotional_overload",            "overwhelmed"),
    ("academic_or_workload_pressure", "pressured"),
]

# Substring  ->  emotional state label (checked against both primary & tertiary)
_LABEL_STATE_MAP: Final[list[tuple[str, str]]] = [
    ("anx",     "anxious"),
    ("sad",     "low_mood"),
    ("depress", "low_mood"),
]

_FALLBACK_STATE: Final[str] = "general_support"


# ---------------------------------------------------------------------------
# Public types
# ---------------------------------------------------------------------------

@dataclass(frozen=True, slots=True)
class EmotionalMemoryContext:
    """Read-only snapshot of a user's aggregated emotional history."""

    recent_emotional_states: list[str] = field(default_factory=list)
    recurring_themes:        list[str] = field(default_factory=list)
    last_risk_level:         str       = _DEFAULT_RISK_LEVEL
    user_pattern_summary:    str       = _DEFAULT_PATTERN_TEXT


# ---------------------------------------------------------------------------
# Internal helpers  (module-level pure functions — easy to unit-test)
# ---------------------------------------------------------------------------

def _infer_emotional_state(
    primary_label:    str,
    tertiary_label:   str,
    safety_assessment: SafetyAssessment,
) -> str:
    """
    Derive a single emotional-state label from classifier output and
    the safety assessment.

    Priority order:
      1. Crisis flag (urgent help needed).
      2. Named support themes (sleep, overload, pressure…).
      3. Substring match against tertiary label, then primary label.
      4. Fallback → "general_support".
    """
    if safety_assessment.needs_urgent_help:
        return "crisis"

    for theme, state in _THEME_STATE_MAP:
        if theme in safety_assessment.support_themes:
            return state

    for label in (tertiary_label.lower(), primary_label.lower()):
        # Skip pure greeting labels — they carry no emotional signal
        if "greet" in label:
            continue
        for substring, state in _LABEL_STATE_MAP:
            if substring in label:
                return state

    return _FALLBACK_STATE


def _build_summary(snapshots: list[dict]) -> dict:
    """
    Aggregate a list of interaction snapshots into a compact summary dict.

    Returns a dict with keys:
      recent_emotional_states, recurring_themes,
      last_risk_level, user_pattern_summary.
    """
    if not snapshots:
        return {
            "recent_emotional_states": [],
            "recurring_themes":        [],
            "last_risk_level":         _DEFAULT_RISK_LEVEL,
            "user_pattern_summary":    _DEFAULT_PATTERN_TEXT,
        }

    state_counts: dict[str, int] = {}
    theme_counts: dict[str, int] = {}

    for snap in snapshots:
        state = snap.get("emotional_state", _FALLBACK_STATE)
        state_counts[state] = state_counts.get(state, 0) + 1
        for theme in snap.get("support_themes", []):
            theme_counts[theme] = theme_counts.get(theme, 0) + 1

    dominant_states  = _top_keys(state_counts, _TOP_STATES_COUNT)
    recurring_themes = _top_keys(theme_counts, _TOP_THEMES_COUNT)
    recent_states    = [
        s.get("emotional_state", _FALLBACK_STATE)
        for s in snapshots[-_RECENT_STATE_COUNT:]
    ]
    last_risk_level  = snapshots[-1].get("risk_level", _DEFAULT_RISK_LEVEL)

    themes_text = ", ".join(recurring_themes) or "general support"
    summary_line = (
        f"Recent pattern: user has often shown {', '.join(dominant_states)} states. "
        f"Recurring themes include {themes_text}. "
        f"Latest known risk level is {last_risk_level}."
    )

    return {
        "recent_emotional_states": recent_states,
        "recurring_themes":        recurring_themes,
        "last_risk_level":         last_risk_level,
        "user_pattern_summary":    summary_line,
    }


def _top_keys(counts: dict[str, int], n: int) -> list[str]:
    """Return the top-*n* keys from a frequency dict, highest first."""
    return [k for k, _ in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:n]]


def _context_from_summary(summary: dict) -> EmotionalMemoryContext:
    """Construct an :class:`EmotionalMemoryContext` from a summary dict."""
    return EmotionalMemoryContext(
        recent_emotional_states=summary.get("recent_emotional_states", []),
        recurring_themes=summary.get("recurring_themes", []),
        last_risk_level=summary.get("last_risk_level", _DEFAULT_RISK_LEVEL),
        user_pattern_summary=summary.get("user_pattern_summary", _DEFAULT_PATTERN_TEXT),
    )


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class MemoryService:
    """
    Stateless service for reading and updating per-user emotional memory.

    All methods are static; the class is a namespace, not an instance.
    Heavy logic lives in module-level helpers so it can be tested in
    isolation without instantiating the service or mocking the repository.
    """

    # ------------------------------------------------------------------
    # Read
    # ------------------------------------------------------------------

    @staticmethod
    def get_memory_context(user_id: str) -> EmotionalMemoryContext:
        """
        Fetch the current emotional memory context for *user_id*.

        Returns a context with empty / default values when no history exists.
        """
        document = EmotionalMemoryRepository.find_by_user_id(user_id)
        if not document:
            return EmotionalMemoryContext()

        return _context_from_summary(document.get("summary", {}))

    # ------------------------------------------------------------------
    # Write
    # ------------------------------------------------------------------

    @staticmethod
    def record_interaction(
        *,
        user_id:              str,
        conversation_id:      str,
        message:              str,
        primary_prediction:   dict,
        secondary_prediction: dict,
        tertiary_prediction:  dict,
        safety_assessment:    SafetyAssessment,
    ) -> EmotionalMemoryContext:
        """
        Append an interaction snapshot to the user's memory and rebuild
        the rolling summary.

        Only the most recent :data:`_MAX_SNAPSHOTS` snapshots are kept.
        Returns the updated :class:`EmotionalMemoryContext`.

        Parameters
        ----------
        user_id:
            Stable identifier for the user.
        conversation_id:
            ID of the current conversation session.
        message:
            Raw user message (truncated to :data:`_MESSAGE_EXCERPT_LEN` chars).
        primary_prediction / secondary_prediction / tertiary_prediction:
            Classifier output dicts, each expected to contain at least a
            ``"label"`` key.
        safety_assessment:
            Result from the safety guardrails service.
        """
        existing        = EmotionalMemoryRepository.find_by_user_id(user_id) or {}
        recent_snapshots = existing.get("recent_snapshots", [])

        emotional_state = _infer_emotional_state(
            primary_label=primary_prediction["label"],
            tertiary_label=tertiary_prediction["label"],
            safety_assessment=safety_assessment,
        )

        snapshot: dict = {
            "conversation_id": conversation_id,
            "message_excerpt": message[:_MESSAGE_EXCERPT_LEN],
            "emotional_state": emotional_state,
            "primary_label":   primary_prediction["label"],
            "secondary_label": secondary_prediction["label"],
            "tertiary_label":  tertiary_prediction["label"],
            "risk_level":      safety_assessment.risk_level,
            "support_themes":  safety_assessment.support_themes,
            "created_at":      datetime.now(timezone.utc),
        }

        all_snapshots = [*recent_snapshots, snapshot][-_MAX_SNAPSHOTS:]
        summary       = _build_summary(all_snapshots)

        EmotionalMemoryRepository.upsert_user_memory(
            user_id=user_id,
            snapshot=snapshot,
            summary=summary,
        )

        return _context_from_summary(summary)