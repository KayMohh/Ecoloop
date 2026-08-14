from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import schemas, models, auth
from ..database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: models.User = Depends(auth.require_role([models.RoleEnum.admin])),
    db: Session = Depends(get_db)
):
    # Total collected devices (quantity sum) for collected/refurbished/recycled
    total_collected_query = db.query(func.sum(models.EWasteItem.quantity)).join(models.CollectionRequest).filter(
        models.CollectionRequest.status.in_([
            models.StatusEnum.collected,
            models.StatusEnum.refurbished,
            models.StatusEnum.recycled
        ])
    ).scalar() or 0

    refurbished_count = db.query(func.sum(models.EWasteItem.quantity)).join(models.CollectionRequest).filter(
        models.CollectionRequest.status == models.StatusEnum.refurbished
    ).scalar() or 0

    recycled_count = db.query(func.sum(models.EWasteItem.quantity)).join(models.CollectionRequest).filter(
        models.CollectionRequest.status == models.StatusEnum.recycled
    ).scalar() or 0

    total_resolved = refurbished_count + recycled_count
    refurbished_percentage = (refurbished_count / total_resolved * 100) if total_resolved > 0 else 0
    recycled_percentage = (recycled_count / total_resolved * 100) if total_resolved > 0 else 0

    # Estimated waste diverted: sum of (item.quantity * category.avg_weight) OR item.estimated_weight_kg
    # For simplicity, we use category.avg_weight_kg * item.quantity for items in collected/refurbished/recycled states
    waste_diverted = db.query(
        func.sum(models.EWasteItem.quantity * models.Category.avg_weight_kg)
    ).join(models.CollectionRequest).join(models.Category).filter(
        models.CollectionRequest.status.in_([
            models.StatusEnum.collected,
            models.StatusEnum.refurbished,
            models.StatusEnum.recycled
        ])
    ).scalar() or 0.0

    return schemas.DashboardStats(
        total_collected=total_collected_query,
        refurbished_count=refurbished_count,
        recycled_count=recycled_count,
        refurbished_percentage=refurbished_percentage,
        recycled_percentage=recycled_percentage,
        estimated_waste_diverted_kg=waste_diverted
    )
