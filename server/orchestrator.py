AGENT_VOICE_MAP: dict[str, str] = {
    "agent_0": "af_bella",
    "agent_1": "af_sarah",
    "agent_2": "af_nicole",
    "agent_3": "am_adam",
    "agent_4": "am_michael",
    "agent_5": "af_sky",
    "agent_6": "af_bella",
}

FALLBACK_VOICE = "af_nicole"

ROUTE_PROFILES: dict[str, tuple[float, float]] = {
    "af_bella": (1.08, 1.0),
    "am_adam": (0.92, 1.25),
    "af_sarah": (0.88, 0.85),
    "af_sky": (1.05, 1.1),
    "am_michael": (0.95, 1.0),
    "af_nicole": (1.0, 1.0),
}

class VoiceRouter:
    def route(self, text: str) -> tuple[str, float, float]:
        voice = self._keyword_fallback(text)
        speed, volume = ROUTE_PROFILES.get(voice, (1.0, 1.0))
        return (voice, speed, volume)

    def route_segments(self, segments: list[str]) -> list[tuple[str, float, float]]:
        return [self.route(seg) for seg in segments]

    @staticmethod
    def _keyword_fallback(text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ["?", "why", "how", "what", "who", "where"]):
            return "af_bella"
        if any(w in lower for w in ["!", "urgent", "important", "warning"]):
            return "am_adam"
        if any(w in lower for w in ["once", "story", "once upon"]):
            return "af_sarah"
        return FALLBACK_VOICE
