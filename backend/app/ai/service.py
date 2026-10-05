from typing import Optional, Dict, Any, List
from app.config import settings
from app.ai.base import (
    BaseAIProvider,
    GeneratedPostVariants,
    RepurposedContent,
    ConversationAnalysis
)
from app.ai.mock_provider import MockAIProvider
from app.ai.gemini_provider import GeminiAIProvider

class AIService:
    """
    Central AI orchestration service.
    Implements safety checks, approval policies, and provider switching.
    """

    def __init__(self):
        self._provider = self._init_provider()

    def _init_provider(self) -> BaseAIProvider:
        provider_name = settings.AI_PROVIDER.lower()
        if provider_name == "gemini" and settings.AI_API_KEY:
            return GeminiAIProvider(api_key=settings.AI_API_KEY, model_name=settings.AI_MODEL_NAME)
        # Default / fallback to MockAIProvider
        return MockAIProvider()

    def set_provider(self, provider: BaseAIProvider) -> None:
        self._provider = provider

    @property
    def provider(self) -> BaseAIProvider:
        return self._provider

    def sanitize_output(self, text: str) -> str:
        """Safety check: Never allow AI output to trigger shell injections or unwanted escape sequences."""
        disallowed_prefixes = ["rm -rf", "sudo ", "cmd.exe", "powershell ", "sh -c", "eval("]
        for pattern in disallowed_prefixes:
            if pattern in text:
                text = text.replace(pattern, "[BLOCKED_COMMAND]")
        return text

    async def generate_post(self, topic: str, tone: str = "engaging", platforms: Optional[List[str]] = None) -> GeneratedPostVariants:
        variants = await self._provider.generate_post(topic, tone, platforms)
        variants.general = self.sanitize_output(variants.general)
        if variants.facebook: variants.facebook = self.sanitize_output(variants.facebook)
        if variants.instagram: variants.instagram = self.sanitize_output(variants.instagram)
        if variants.twitter: variants.twitter = self.sanitize_output(variants.twitter)
        if variants.linkedin: variants.linkedin = self.sanitize_output(variants.linkedin)
        if variants.telegram: variants.telegram = self.sanitize_output(variants.telegram)
        return variants

    async def rewrite_post(self, content: str, instruction: str = "rewrite") -> str:
        res = await self._provider.rewrite_post(content, instruction)
        return self.sanitize_output(res)

    async def generate_reply(
        self,
        message: str,
        context: Optional[str] = None,
        tone: str = "professional",
        mode: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates reply according to configured mode:
        AUTO_SEND, APPROVAL_REQUIRED, SUGGEST_ONLY, OFF.
        """
        current_mode = mode or settings.AI_DEFAULT_MODE

        if current_mode == "OFF":
            return {"reply": None, "mode": "OFF", "status": "disabled"}

        reply_text = await self._provider.generate_reply(message, context, tone)
        reply_text = self.sanitize_output(reply_text)

        requires_approval = (current_mode == "APPROVAL_REQUIRED")
        suggest_only = (current_mode == "SUGGEST_ONLY")
        can_auto_send = (current_mode == "AUTO_SEND")

        return {
            "reply": reply_text,
            "mode": current_mode,
            "requires_approval": requires_approval,
            "can_auto_send": can_auto_send,
            "suggest_only": suggest_only,
            "status": "ready"
        }

    async def summarize_conversation(self, messages: List[Dict[str, str]]) -> ConversationAnalysis:
        return await self._provider.analyze_conversation(messages)

    async def repurpose(self, text: str, source_type: str = "article") -> RepurposedContent:
        return await self._provider.repurpose_content(text, source_type)

    async def analyze_sentiment(self, text: str) -> str:
        return await self._provider.analyze_sentiment(text)

ai_service = AIService()
