from __future__ import annotations

import re

# ── Symbol maps ──────────────────────────────────────────────────────────────

BIG_O = re.compile(r"\bO\(([^)]+)\)")

SYMBOLS: list[tuple[str, str]] = [
    (r"===", "strictly equals"),
    (r"!==", "does not equal"),
    (r"=>", "arrow"),
    (r"->", "arrow"),
    (r"\|\|", "or"),
    (r"&&", "and"),
    (r"\+\+", "plus plus"),
    (r"--", "minus minus"),
    (r">=", "greater than or equal"),
    (r"<=", "less than or equal"),
    (r"==", "equals"),
    (r"!=", "not equal"),
    (r"\*\*", "exponentiation"),
    (r"::", "colon colon"),
    (r"\?\?", "nullish coalescing"),
]

ABBREVIATIONS: list[tuple[str, str]] = [
    (r"\be\.g\b\.?", "for example"),
    (r"\bi\.e\b\.?", "that is"),
    (r"\bw\.r\.t\b\.?", "with respect to"),
    (r"\betc\b\.?", "etcetera"),
    (r"\bvs\b\.?", "versus"),
    (r"\bdept\b\.?", "department"),
    (r"\bapprox\b\.?", "approximately"),
    (r"\binfo\b", "information"),
    (r"\brepo\b", "repository"),
    (r"\brecv\b", "receive"),
]

SNAKE_CASE = re.compile(r"\b[a-z]+_[a-z]+\b")
CAMEL_CASE = re.compile(r"\b[a-z]+[A-Z][a-zA-Z]*\b")
UPPER_SNAKE = re.compile(r"\b[A-Z]+_[A-Z]+\b")
SCREAMING_SNAKE = re.compile(r"\b[A-Z][A-Z_]+[A-Z]\b")

FILE_EXT = re.compile(r"\b(\w+)\.(tsx?|jsx?|py|rs|go|rb|java|cpp|c|h|css|scss|json|md|yaml|toml|sql|sh)\b")

EMAIL = re.compile(r"\b([\w.]+)@([\w.]+)\.(\w+)\b")
URL = re.compile(r"\bhttps?://([\w./-]+)\b")


def contains_bangla(text: str) -> bool:
    return any(ord(c) in range(0x0980, 0x0A00) for c in text)


def normalize_big_o(text: str) -> str:
    def _replace(m: re.Match) -> str:
        inner = m.group(1).strip()
        return f"Oh of {inner}"
    return BIG_O.sub(_replace, text)


def normalize_symbols(text: str) -> str:
    for pattern, replacement in SYMBOLS:
        text = re.sub(pattern, replacement, text)
    return text


def normalize_abbreviations(text: str) -> str:
    for pattern, replacement in ABBREVIATIONS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def normalize_snake_case(text: str) -> str:
    def _replace(m: re.Match) -> str:
        return m.group(0).replace("_", " ")
    return SNAKE_CASE.sub(_replace, text)


def normalize_camel_case(text: str) -> str:
    def _replace(m: re.Match) -> str:
        word = m.group(0)
        return re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', word)
    return CAMEL_CASE.sub(_replace, text)


def normalize_file_extensions(text: str) -> str:
    def _replace(m: re.Match) -> str:
        name, ext = m.group(1), m.group(2)
        ext_spelled = " ".join(c.upper() for c in ext)
        return f"{name} dot {ext_spelled}"
    return FILE_EXT.sub(_replace, text)


def normalize_email(text: str) -> str:
    def _replace(m: re.Match) -> str:
        user, domain, tld = m.group(1), m.group(2), m.group(3)
        tld_spelled = tld.upper() if len(tld) <= 3 else tld
        if user.isalnum() and domain.isalnum() and tld.isalpha():
            return f"{user} at {domain} dot {tld_spelled}"
        return m.group(0)
    return EMAIL.sub(_replace, text)


# ── Prosody ──────────────────────────────────────────────────────────────────

TECHNICAL_TERMS = [
    r"\b[a-z_]+\(\)",
    r"\buseState\b",
    r"\buseEffect\b",
    r"\buseRef\b",
    r"\buseMemo\b",
    r"\buseCallback\b",
    r"\buseContext\b",
    r"\bcreateContext\b",
    r"\bcreateRef\b",
    r"\bforwardRef\b",
    r"\blazy\(\)\b",
    r"\bmemo\(\)\b",
    r"\bfunction\s+\w+",
    r"\bconst\s+\w+",
    r"\blet\s+\w+",
    r"\bvar\s+\w+",
    r"\bexport\s+default\b",
    r"\bexport\s+const\b",
    r"\bimport\s+\{",
    r"\bfrom\s+['\"]",
    r"\binterface\s+\w+",
    r"\btype\s+\w+",
    r"\basync\b",
    r"\bawait\b",
    r"\bPromise\b",
    r"\bclass\s+\w+",
    r"\bextends\b",
    r"\bimplements\b",
    r"\babstract\b",
    r"\bprivate\b",
    r"\bprotected\b",
    r"\bpublic\b",
    r"\bstatic\b",
    r"\breadonly\b",
    r"\btypeof\b",
    r"\binstanceof\b",
    r"\bnew\s+[A-Z]\w*",
    r"\bArray\b",
    r"\bObject\b",
    r"\bString\b",
    r"\bNumber\b",
    r"\bBoolean\b",
    r"\bnull\b",
    r"\bundefined\b",
    r"\bNaN\b",
]

TECH_RE = re.compile("|".join(TECHNICAL_TERMS), re.IGNORECASE)

PAREN_CONTENT = re.compile(r"\([^)]*\)")


def add_technical_prosody(text: str) -> str:
    """Wrap technical terms in [slow][loud] tags for clearer articulation."""
    result = []
    last_end = 0

    for m in TECH_RE.finditer(text):
        start = m.start()
        if start > last_end:
            result.append(text[last_end:start])
        result.append(f"[slow][loud]{m.group()}[/loud][/slow]")
        last_end = m.end()

    if last_end < len(text):
        result.append(text[last_end:])

    return "".join(result)


def add_paren_prosody(text: str) -> str:
    """Wrap parenthetical content in [soft] for a more natural reading."""
    return PAREN_CONTENT.sub(lambda m: f"[soft]{m.group()}[/soft]", text)


# ── Main entry ───────────────────────────────────────────────────────────────

def normalize_technical_text(text: str) -> str:
    """Full normalization pipeline for technical text."""
    if contains_bangla(text):
        return text

    text = normalize_big_o(text)
    text = normalize_symbols(text)
    text = normalize_abbreviations(text)
    text = normalize_snake_case(text)
    text = normalize_camel_case(text)
    text = normalize_file_extensions(text)
    text = normalize_email(text)

    return text


def enhance_prosody(text: str) -> str:
    if contains_bangla(text):
        return text
    text = add_paren_prosody(text)
    text = add_technical_prosody(text)
    return text
