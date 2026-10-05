import json
import httpx
from typing import Dict, Any, List, Optional
from app.ai.base import (
    BaseAIProvider,
    GeneratedPostVariants,
    RepurposedContent,
    ConversationAnalysis
)
from app.ai.mock_provider import MockAIProvider

class GeminiAIProvider(BaseAIProvider):
    """
    Google Gemini API provider integration.
    Falls back gracefully to MockAIProvider if no API key is provided.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback = MockAIProvider()

    async def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        if not self.api_key:
            return None
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
        except Exception:
            pass
        return None

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 500) -> str:
        res = await self._call_gemini(prompt, system_instruction=system_prompt)
        return res if res else await self.fallback.generate_text(prompt, system_prompt, max_tokens)

    async def summarize(self, text: str, max_words: int = 100) -> str:
        prompt = f"Summarize the following text in under {max_words} words:\n\n{text}"
        res = await self._call_gemini(prompt)
        return res if res else await self.fallback.summarize(text, max_words)

    async def classify(self, text: str, categories: List[str]) -> str:
        prompt = f"Classify the following text into one of these categories: {', '.join(categories)}.\nRespond with ONLY the chosen category name.\n\nText: {text}"
        res = await self._call_gemini(prompt)
        if res and res.strip() in categories:
            return res.strip()
        return await self.fallback.classify(text, categories)

    async def generate_reply(
        self,
        message: str,
        context: Optional[str] = None,
        tone: str = "professional"
    ) -> str:
        prompt = f"Generate a {tone} customer response for a social media message.\nMessage: '{message}'\nContext: {context or 'None'}\nRespond with just the reply text."
        res = await self._call_gemini(prompt)
        return res if res else await self.fallback.generate_reply(message, context, tone)

    async def generate_post(
        self,
        topic_or_idea: str,
        tone: str = "engaging",
        platforms: Optional[List[str]] = None
    ) -> GeneratedPostVariants:
        prompt = (
            f"Given the idea: '{topic_or_idea}', generate tailored posts for Facebook, Instagram, Twitter, LinkedIn, and Telegram.\n"
            f"Return a strict JSON object with keys: facebook, instagram, twitter, linkedin, telegram, hashtags (list)."
        )
        res = await self._call_gemini(prompt)
        if res:
            try:
                # Extract JSON if fenced
                clean = res.replace("```json", "").replace("```", "").strip()
                data = json.loads(clean)
                return GeneratedPostVariants(
                    general=topic_or_idea,
                    facebook=data.get("facebook"),
                    instagram=data.get("instagram"),
                    twitter=data.get("twitter"),
                    linkedin=data.get("linkedin"),
                    telegram=data.get("telegram"),
                    hashtags=data.get("hashtags", [])
                )
            except Exception:
                pass
        return await self.fallback.generate_post(topic_or_idea, tone, platforms)

    async def rewrite_post(
        self,
        content: str,
        instruction: str = "rewrite"
    ) -> str:
        prompt = f"Instruction: {instruction}. Post content to modify: '{content}'. Return only the rewritten post."
        res = await self._call_gemini(prompt)
        return res if res else await self.fallback.rewrite_post(content, instruction)

    async def repurpose_content(
        self,
        source_text: str,
        source_type: str = "article"
    ) -> RepurposedContent:
        return await self.fallback.repurpose_content(source_text, source_type)

    async def analyze_conversation(
        self,
        messages: List[Dict[str, str]]
    ) -> ConversationAnalysis:
        return await self.fallback.analyze_conversation(messages)

    async def analyze_sentiment(self, text: str) -> str:
        return await self.fallback.analyze_sentiment(text)

    async def translate(self, text: str, target_language: str) -> str:
        prompt = f"Translate the following text into {target_language}. Return only the translation:\n\n{text}"
        res = await self._call_gemini(prompt)
        return res if res else await self.fallback.translate(text, target_language)
