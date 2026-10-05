from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import AIGeneratePostRequest, AIRewriteRequest, AIRepurposeRequest
from app.ai.service import ai_service
from app.api.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/generate-post")
async def generate_post(
    req: AIGeneratePostRequest,
    user=Depends(get_current_user)
):
    variants = await ai_service.generate_post(req.idea, tone=req.tone, platforms=req.platforms)
    return variants.model_dump()

@router.post("/rewrite")
async def rewrite_post(
    req: AIRewriteRequest,
    user=Depends(get_current_user)
):
    result = await ai_service.rewrite_post(req.content, instruction=req.instruction)
    return {"rewritten": result, "instruction": req.instruction}

@router.post("/repurpose")
async def repurpose_content(
    req: AIRepurposeRequest,
    user=Depends(get_current_user)
):
    result = await ai_service.repurpose(req.source_text, source_type=req.source_type)
    return result.model_dump()

@router.post("/suggest-reply")
async def suggest_reply(
    message: str,
    context: Optional[str] = None,
    tone: str = "professional",
    user=Depends(get_current_user)
):
    result = await ai_service.generate_reply(message, context=context, tone=tone, mode="SUGGEST_ONLY")
    return result

@router.post("/sentiment")
async def analyze_sentiment(
    text: str,
    user=Depends(get_current_user)
):
    res = await ai_service.analyze_sentiment(text)
    return {"text": text, "sentiment": res}
