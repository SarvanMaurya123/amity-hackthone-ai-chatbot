"""
language_service.py
-------------------
Production-grade language detection, style classification, and translation
for multilingual text (English, Hindi, Hinglish, Marathi).

Optional dependencies (gracefully degraded when absent):
  - langdetect      : statistical language detection fallback
  - deep-translator : Google Translate wrapper
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Final

# ---------------------------------------------------------------------------
# Optional dependency shims
# ---------------------------------------------------------------------------

try:
    from langdetect import DetectorFactory, LangDetectException, detect as _langdetect_detect
    DetectorFactory.seed = 0  # deterministic results
    _langdetect_available = True
except ImportError:
    LangDetectException = Exception          # type: ignore[misc,assignment]
    _langdetect_detect = None                # type: ignore[assignment]
    _langdetect_available = False

try:
    from deep_translator import GoogleTranslator as _GoogleTranslator
    _deep_translator_available = True
except ImportError:
    _GoogleTranslator = None                 # type: ignore[assignment,misc]
    _deep_translator_available = False


# ---------------------------------------------------------------------------
# Public types
# ---------------------------------------------------------------------------

Language = str   # "english" | "hindi" | "hinglish" | "marathi"
Style    = str   # "formal"  | "informal" | "mixed"


@dataclass(frozen=True, slots=True)
class LanguageContext:
    """Immutable result of language + style analysis for a piece of text."""
    detected_language: Language
    language_style: Style


# ---------------------------------------------------------------------------
# Internal constants  (module-level so they are compiled once)
# ---------------------------------------------------------------------------

_RE_TOKENS:     Final = re.compile(r"[A-Za-z']+|[\u0900-\u097F]+")
_RE_DEVANAGARI: Final = re.compile(r"[\u0900-\u097F]")
_RE_ENGLISH_KW: Final = re.compile(
    r"\b(i|am|feel|stressed|anxious|sad|help|please|what|can|do|very|tomorrow|life)\b",
    re.IGNORECASE,
)

_ROMANIZED_HINDI: Final[frozenset[str]] = frozenset({
    "mujhe", "bahut", "kya", "karu", "nahi", "nhi", "hai", "ho",
    "raha", "rahi", "yaar", "kaise", "abhi", "aaj", "kal",
    "mera", "meri", "mere", "dil", "mann", "tension", "sahi",
    "mood", "mar", "marna", "jeena", "zindagi", "lag", "lagta",
    "lagti", "aisa", "kyu",
})

_ROMANIZED_MARATHI: Final[frozenset[str]] = frozenset({
    "mala", "majha", "majhi", "khup", "kay", "ahe", "aahe",
    "nako", "vatte", "vattay", "karaycha", "maze", "mazya",
    "jiv", "jagnyacha", "bhiti", "aala", "ala", "tr", "me",
    "karu", "sang",
})

_INFORMAL_MARKERS: Final[frozenset[str]] = frozenset({
    "yaar", "bro", "dude", "pls", "plz", "idk", "lol",
    "kya", "karu", "na", "yr",
})

_FORMAL_MARKERS: Final[frozenset[str]] = frozenset({
    "please", "kindly", "would", "could", "kripya",
})

# Canonical label normalisation — maps every known alias to a stable name
_LANG_NORMALISE: Final[dict[str, Language]] = {
    "en": "english",  "eng": "english",  "english": "english",
    "hi": "hindi",    "hin": "hindi",    "hindi":   "hindi",
    "hinglish": "hinglish",              "mixed":   "hinglish",
    "mr": "marathi",  "mar": "marathi",  "marathi": "marathi",
}

# Maps canonical language name -> BCP-47 code used by Google Translate
_LANG_TO_TRANSLATE_CODE: Final[dict[Language, str]] = {
    "english": "en",
    "hindi":   "hi",
    "marathi": "mr",
    # english / hinglish -> translation not required
}


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class LanguageService:
    """
    Detects language and writing style for short, user-generated texts
    in English, Hindi, Hinglish, and Marathi.  Optionally translates
    text into a target language via Google Translate.

    All public methods are stateless; the class holds no mutable state,
    making it safe to share a single instance across threads.
    """

    # ------------------------------------------------------------------
    # Language detection
    # ------------------------------------------------------------------

    def detect_language(self, text: str) -> Language:
        """
        Return the canonical language label for *text*.

        Detection order:
          1. Marathi keyword heuristic (highest specificity).
          2. Hinglish heuristic (mixed Devanagari/Latin or Hindi+English keywords).
          3. Pure Hindi heuristic (Devanagari script or Hindi keyword density).
          4. Statistical fallback via langdetect (if installed).
          5. Default -> "english".
        """
        normalised = text.strip().lower()
        if not normalised:
            return "english"

        tokens = _RE_TOKENS.findall(normalised)
        if not tokens:
            return "english"

        has_devanagari = bool(_RE_DEVANAGARI.search(normalised))
        english_hits   = len(_RE_ENGLISH_KW.findall(normalised))
        hindi_hits     = sum(1 for t in tokens if t in _ROMANIZED_HINDI)
        marathi_hits   = sum(1 for t in tokens if t in _ROMANIZED_MARATHI)

        if marathi_hits >= 2 and marathi_hits >= hindi_hits:
            return "marathi"

        if (hindi_hits >= 1 and english_hits >= 2) \
                or (has_devanagari and english_hits > 0) \
                or (hindi_hits > 0 and english_hits > 0):
            return "hinglish"

        if has_devanagari or hindi_hits >= 2:
            return "hindi"

        if _langdetect_available:
            try:
                label = _langdetect_detect(normalised)   # type: ignore[misc]
                return self.normalise_language(label)
            except LangDetectException:
                pass

        return "english"

    # ------------------------------------------------------------------
    # Style detection
    # ------------------------------------------------------------------

    def detect_style(self, text: str) -> Style:
        """
        Classify the writing style of *text* as "informal", "formal", or "mixed".

        Classification is keyword-based and intentionally lightweight;
        it is accurate enough for downstream prompt-style selection.
        """
        normalised = text.strip().lower()
        if not normalised:
            return "formal"

        has_informal = any(m in normalised for m in _INFORMAL_MARKERS)
        has_formal   = any(m in normalised for m in _FORMAL_MARKERS)

        if has_informal and has_formal:
            return "mixed"
        if has_informal:
            return "informal"
        return "formal"

    # ------------------------------------------------------------------
    # Combined context builder  (primary entry-point)
    # ------------------------------------------------------------------

    def build_context(self, text: str) -> LanguageContext:
        """
        Analyse *text* and return a :class:`LanguageContext`.

        Hinglish is always treated as at least "mixed" style because
        code-switching inherently implies informal register blending.
        """
        language = self.detect_language(text)
        style    = self.detect_style(text)

        if language == "hinglish" and style == "formal":
            style = "mixed"

        return LanguageContext(detected_language=language, language_style=style)

    # ------------------------------------------------------------------
    # Translation helpers
    # ------------------------------------------------------------------

    def ensure_language(self, text: str, target_language: str) -> str:
        """
        Return *text* guaranteed to be in *target_language*.

        If *text* is already in the target language, the original string
        is returned unchanged. Hinglish is not machine-translated because
        preserving natural code-switching requires model generation.
        Otherwise a Google Translate call is attempted; on failure the
        original text is returned.
        """
        target = self.normalise_language(target_language)

        if target == "hinglish":
            return text

        if self.detect_language(text) == target:
            return text

        return self.translate_text(text, target) or text

    def translate_text(self, text: str, target_language: str) -> str | None:
        """
        Translate *text* to *target_language* via Google Translate.

        Returns the translated string, or ``None`` if deep-translator is
        not installed, the target language is unsupported, or the API call
        fails for any reason.
        """
        if not _deep_translator_available:
            return None

        target_code = _LANG_TO_TRANSLATE_CODE.get(
            self.normalise_language(target_language)
        )
        if target_code is None:
            return None

        try:
            return _GoogleTranslator(source="auto", target=target_code).translate(text)
        except Exception:  # noqa: BLE001 — translation errors are non-fatal
            return None

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------

    @staticmethod
    def normalise_language(label: str) -> Language:
        """
        Map any known language label or BCP-47 code to a canonical name.

        Unknown labels fall back to ``"english"``.

        Examples::

            normalise_language("hi")        # -> "hindi"
            normalise_language("Hinglish")  # -> "hinglish"
            normalise_language("unknown")   # -> "english"
        """
        return _LANG_NORMALISE.get(label.strip().lower(), "english")

    # Backward-compatible alias (original spelling used in your codebase)
    normalize_language = normalise_language
