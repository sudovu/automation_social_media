from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class GeneratedPostVariants(BaseModel):
    general: str
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    telegram: Optional[str] = None
    hashtags: List[str] = Field(default_factory=list)

class RepurposedContent(BaseModel):
    summary: str
    key_takeaways: List[str] = Field(default_factory=list)
    social_posts: List[str] = Field(default_factory=list)
    quotes: List[str] = Field(default_factory=list)

class ConversationAnalysis(BaseModel):
    summary: str
    customer_wants: str
    customer_asked: str
    current_status: str
    suggested_action: str
    sentiment: str # positive, neutral, negative
    urgency: str # low, medium, high

class BaseAIProvider(ABC):
    """Abstract interface for all AI backends."""

    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 500) -> str:
        """General text generation."""
        pass

    @abstractmethod
    async def summarize(self, text: str, max_words: int = 100) -> str:
        """Summarize long-form text."""
        pass

    @abstractmethod
    async def classify(self, text: str, categories: List[str]) -> str:
        """Classify incoming content into one of the provided categories."""
        pass

    @abstractmethod
    async def generate_reply(
        self,
        message: str,
        context: Optional[str] = None,
        tone: str = "professional"
    ) -> str:
        """Generate a contextual customer reply."""
        pass

    @abstractmethod
    async def generate_post(
        self,
        topic_or_idea: str,
        tone: str = "engaging",
        platforms: Optional[List[str]] = None
    ) -> GeneratedPostVariants:
        """Generate platform-specific adapted post variants from a single core idea."""
        pass

    @abstractmethod
    async def rewrite_post(
        self,
        content: str,
        instruction: str = "rewrite", # rewrite, shorten, expand, professional, casual, persuasive
    ) -> str:
        """Rewrite, shorten, expand, or adjust tone of an existing post."""
        pass

    @abstractmethod
    async def repurpose_content(
        self,
        source_text: str,
        source_type: str = "article" # article, video_transcript, blog, podcast
    ) -> RepurposedContent:
        """Repurpose long-form content into multiple social assets."""
        pass

    @abstractmethod
    async def analyze_conversation(
        self,
        messages: List[Dict[str, str]]
    ) -> ConversationAnalysis:
        """Analyze a conversation thread to produce a structured summary and action plan."""
        pass

    @abstractmethod
    async def analyze_sentiment(self, text: str) -> str:
        """Classify sentiment as positive, neutral, or negative."""
        pass

    @abstractmethod
    async def translate(self, text: str, target_language: str) -> str:
        """Translate text into a target language."""
        pass
