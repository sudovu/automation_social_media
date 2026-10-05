import re
from typing import Dict, Any, List, Optional
from app.ai.base import (
    BaseAIProvider,
    GeneratedPostVariants,
    RepurposedContent,
    ConversationAnalysis
)

class MockAIProvider(BaseAIProvider):
    """
    Intelligent local fallback provider.
    Generates realistic, platform-adapted responses, summaries, and sentiment analysis
    without needing an external paid API key or network connection.
    """

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 500) -> str:
        return f"💡 AI Generated Insight:\n\n{prompt.strip().capitalize()} — By optimizing workflows and leveraging intelligent automation, modern teams can save 15+ hours weekly while maintaining consistent brand presence."

    async def summarize(self, text: str, max_words: int = 100) -> str:
        clean_text = " ".join(text.split()[:max_words])
        return f"Executive Summary: {clean_text}... (Key focus: automation efficiency, channel expansion, and responsive customer engagement)."

    async def classify(self, text: str, categories: List[str]) -> str:
        lower = text.lower()
        for cat in categories:
            if cat.lower() in lower:
                return cat
        if any(w in lower for w in ["price", "cost", "quote", "rate", "$", "how much"]):
            for cat in categories:
                if "price" in cat.lower() or "sales" in cat.lower() or "billing" in cat.lower():
                    return cat
        if any(w in lower for w in ["support", "help", "bug", "broken", "issue", "error"]):
            for cat in categories:
                if "support" in cat.lower() or "issue" in cat.lower():
                    return cat
        return categories[0] if categories else "general"

    async def generate_reply(
        self,
        message: str,
        context: Optional[str] = None,
        tone: str = "professional"
    ) -> str:
        lower = message.lower()
        if "price" in lower or "cost" in lower or "how much" in lower:
            return "Thank you for inquiring about our pricing! Our plans are flexible for businesses of all sizes. You can view full plan tiers on our website or reply with your team size for a tailored estimate."
        if "demo" in lower or "call" in lower:
            return "We would love to show you a live walkthrough! You can select a convenient slot on our calendar or reply with your availability this week."
        if "help" in lower or "support" in lower:
            return "Hello! Thank you for reaching out to support. Please provide details regarding your inquiry or account ID, and our team will assist you shortly."
        return f"Hello! Thank you for contacting us regarding '{message[:50]}...'. Our team has received your message and is reviewing the details to assist you as quickly as possible."

    async def generate_post(
        self,
        topic_or_idea: str,
        tone: str = "engaging",
        platforms: Optional[List[str]] = None
    ) -> GeneratedPostVariants:
        base_idea = topic_or_idea.strip()
        tags = ["#Productivity", "#SocialMediaAutomation", "#GrowthStrategy", "#TechInnovation"]

        fb = f"🚀 {base_idea}\n\nAutomating your social operations doesn't mean losing authenticity. It means having the freedom to focus on what matters most: connecting with your community.\n\n👉 What systems are you upgrading this quarter? Share below!\n\n" + " ".join(tags[:3])
        ig = f"✨ Transform your daily workflow: {base_idea}\n\nSave hours every week with automated scheduling, unified inboxes, and instant auto-replies. Double tap if you're ready to scale your channels! 📲\n.\n.\n" + " ".join(tags)
        x = f"Struggling with multi-platform posting? 💡\n\n{base_idea[:160]}\n\nConsistent distribution + smart auto-replies = effortless growth. 📈 #Automation #Tech"
        li = f"Reflecting on scalable digital strategy: {base_idea}\n\nIn 2026, the highest leverage teams aren't working more hours—they're implementing better systems. By automating cross-channel posting and centralizing inbox workflows, organizations maintain high response velocity with zero burnout.\n\nHow is your organization approaching automation this year?\n\n#Leadership #SocialAutomation #BusinessGrowth"
        tg = f"⚡️ Quick Update:\n\n{base_idea}\n\nKey advantages:\n• Unified scheduling\n• Intelligent keyword replies\n• Real-time analytics\n\nStay tuned for more updates! 🔥"

        return GeneratedPostVariants(
            general=f"{base_idea}\n\nConsistency is key to sustainable audience growth.",
            facebook=fb,
            instagram=ig,
            twitter=x,
            linkedin=li,
            telegram=tg,
            hashtags=tags
        )

    async def rewrite_post(
        self,
        content: str,
        instruction: str = "rewrite"
    ) -> str:
        inst = instruction.lower()
        if "shorten" in inst:
            words = content.split()
            shortened = " ".join(words[:min(len(words), 25)])
            return f"{shortened} 🚀"
        if "expand" in inst:
            return f"{content.strip()}\n\nHere is why this matters: consistency compounds over time, and automated systems ensure your message reaches your audience at peak engagement windows every single day."
        if "professional" in inst:
            return f"Key perspective on digital execution: {content.strip()} Implementing structured workflows ensures reliable delivery and enhanced brand credibility."
        if "casual" in inst:
            return f"Honestly loving this: {content.strip()} What do you all think? Let me know in the comments! 👇"
        return f"✨ Refreshed version: {content.strip()}\n\nKeep iterating, keep growing! #Strategy"

    async def repurpose_content(
        self,
        source_text: str,
        source_type: str = "article"
    ) -> RepurposedContent:
        summary = f"Summary of {source_type}: " + " ".join(source_text.split()[:40]) + "..."
        takeaways = [
            "Automation scales consistent publishing without increasing headcount.",
            "Unified inboxes reduce customer response time from hours to minutes.",
            "Cross-platform adaptation outperforms duplicate posting across channels."
        ]
        posts = [
            f"1/3 Key takeaway from our latest {source_type}: Automation enables sustainable brand consistency across every network.",
            f"2/3 Why speed matters: Customers expect near-instant responses. Automated keyword replies maintain satisfaction 24/7.",
            f"3/3 Final insight: Don't cross-post identically. Adapt your tone and media to match each platform's community expectations."
        ]
        quotes = [
            f"\"{source_text.strip()[:80]}...\"",
            "\"Scalable systems create space for high-impact creative work.\""
        ]
        return RepurposedContent(
            summary=summary,
            key_takeaways=takeaways,
            social_posts=posts,
            quotes=quotes
        )

    async def analyze_conversation(
        self,
        messages: List[Dict[str, str]]
    ) -> ConversationAnalysis:
        full_text = " ".join([m.get("content", "") for m in messages]).lower()
        
        # Determine intent
        if "price" in full_text or "cost" in full_text or "quote" in full_text:
            wants = "Pricing and subscription package details"
            asked = "Pricing tiers, discounts, or contract terms"
            action = "Send official pricing sheet or link to plans page"
        elif "demo" in full_text or "call" in full_text:
            wants = "Product demonstration or scheduled consultation"
            asked = "Meeting availability and demo link"
            action = "Share booking calendar link and confirm time zone"
        else:
            wants = "General product information and onboarding assistance"
            asked = "How the automation system connects with their accounts"
            action = "Follow up with onboarding guide and account setup steps"

        sentiment = "neutral"
        if any(w in full_text for w in ["thank", "great", "awesome", "perfect", "good", "love"]):
            sentiment = "positive"
        elif any(w in full_text for w in ["angry", "bad", "slow", "broken", "fail", "terrible", "cancel"]):
            sentiment = "negative"

        return ConversationAnalysis(
            summary=f"Customer inquiring regarding {wants.lower()}. Last message received recently.",
            customer_wants=wants,
            customer_asked=asked,
            current_status="Waiting for response",
            suggested_action=action,
            sentiment=sentiment,
            urgency="high" if "urgent" in full_text or sentiment == "negative" else "medium"
        )

    async def analyze_sentiment(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ["love", "great", "excellent", "awesome", "helpful", "amazing", "good"]):
            return "positive"
        if any(w in lower for w in ["bad", "terrible", "worst", "broken", "hate", "scam", "useless"]):
            return "negative"
        return "neutral"

    async def translate(self, text: str, target_language: str) -> str:
        return f"[{target_language.upper()}] {text}"
