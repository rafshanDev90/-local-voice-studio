AGENT_VOICE_MAP: dict[str, str] = {
    "agent_0": "af_bella",
    "agent_1": "af_heart",
    "agent_2": "af_nicole",
    "agent_3": "am_adam",
    "agent_4": "am_michael",
    "agent_5": "af_bella",
    "agent_6": "af_heart",
}

FALLBACK_VOICE = "af_nicole"

class VoiceRouter:
    def __init__(self):
        self._router = None
        self._available = False
        self._try_init_fugu()

    def _try_init_fugu(self):
        try:
            from OpenFugu.fugu_router import FuguRouter
            self._router = FuguRouter()
            self._router.self_test()
            self._available = True
        except Exception:
            self._available = False

    def route(self, text: str) -> str:
        if self._available and self._router:
            try:
                agent_id = self._router.route(text)
                return AGENT_VOICE_MAP.get(agent_id, FALLBACK_VOICE)
            except Exception:
                pass
        return self._keyword_fallback(text)

    def route_segments(self, segments: list[str]) -> list[tuple[str, str]]:
        return [(seg, self.route(seg)) for seg in segments]

    @staticmethod
    def _keyword_fallback(text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ["?", "why", "how", "what", "who", "where"]):
            return "af_bella"
        if any(w in lower for w in ["!", "urgent", "important", "warning"]):
            return "am_adam"
        if any(w in lower for w in ["once", "story", "once upon"]):
            return "af_heart"
        return FALLBACK_VOICE
