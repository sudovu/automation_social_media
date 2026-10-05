import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.media_and_template import Template
from app.schemas import TemplateRequest
from app.api.auth import get_current_user

router = APIRouter(prefix="/templates", tags=["Templates"])

@router.get("")
async def list_templates(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Template).order_by(desc(Template.created_at))
    res = await db.execute(stmt)
    templates = res.scalars().all()

    if not templates:
        t1 = Template(
            name="Monday Motivation Template",
            platform="all",
            content="Start your week with purpose! 💡 {{thought}}\n\nFocus on progress, not perfection. #MondayMotivation #Leadership",
            hashtags_json=json.dumps(["#MondayMotivation", "#GrowthMindset", "#Leadership"]),
            cta="What is your top goal this week? Drop it below! 👇",
            variables_json=json.dumps(["{{thought}}"])
        )
        t2 = Template(
            name="Product Feature Spotlight",
            platform="all",
            content="Spotlight on: {{feature_name}} 🚀\n\n{{description}}\n\nTry it out today at {{website}}!",
            hashtags_json=json.dumps(["#NewFeature", "#Productivity", "#Tech"]),
            cta="Learn more at {{website}}",
            variables_json=json.dumps(["{{feature_name}}", "{{description}}", "{{website}}"])
        )
        db.add_all([t1, t2])
        await db.commit()
        templates = [t1, t2]

    return [
        {
            "id": t.id,
            "name": t.name,
            "platform": t.platform,
            "content": t.content,
            "hashtags": json.loads(t.hashtags_json or "[]"),
            "cta": t.cta,
            "variables": json.loads(t.variables_json or "[]"),
            "created_at": t.created_at
        }
        for t in templates
    ]

@router.post("")
async def create_template(
    req: TemplateRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    template = Template(
        name=req.name,
        platform=req.platform,
        content=req.content,
        hashtags_json=json.dumps(req.hashtags),
        cta=req.cta,
        variables_json=json.dumps(req.variables)
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return {"status": "created", "id": template.id}

@router.post("/{template_id}/render")
async def render_template(
    template_id: str,
    variables: Dict[str, str], # {"thought": "Small daily steps lead to massive results."}
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Template).where(Template.id == template_id)
    res = await db.execute(stmt)
    template = res.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    rendered = template.content
    for key, val in variables.items():
        placeholder = f"{{{{{key}}}}}"
        rendered = rendered.replace(placeholder, val)

    return {"rendered_content": rendered}

@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Template).where(Template.id == template_id)
    res = await db.execute(stmt)
    template = res.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    await db.delete(template)
    await db.commit()
    return {"status": "deleted"}
