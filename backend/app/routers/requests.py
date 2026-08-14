from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from .. import schemas, models, auth
from ..database import get_db

router = APIRouter(prefix="/requests", tags=["requests"])

@router.post("/", response_model=schemas.CollectionRequestResponse)
def create_request(
    request: schemas.CollectionRequestCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != models.RoleEnum.reporter:
        raise HTTPException(status_code=403, detail="Only reporters can create requests")
        
    db_request = models.CollectionRequest(
        reporter_id=current_user.id,
        pickup_address=request.pickup_address,
        status=models.StatusEnum.pending
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    for item in request.items:
        db_item = models.EWasteItem(
            request_id=db_request.id,
            category_id=item.category_id,
            description=item.description,
            quantity=item.quantity,
            condition=item.condition,
            estimated_weight_kg=item.estimated_weight_kg
        )
        db.add(db_item)
        
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/", response_model=List[schemas.CollectionRequestResponse])
def get_requests(
    status: Optional[models.StatusEnum] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.CollectionRequest)
    
    if current_user.role == models.RoleEnum.reporter:
        query = query.filter(models.CollectionRequest.reporter_id == current_user.id)
    
    if status:
        query = query.filter(models.CollectionRequest.status == status)
        
    return query.all()

@router.patch("/{request_id}/assign", response_model=schemas.CollectionRequestResponse)
def assign_request(
    request_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != models.RoleEnum.agent:
        raise HTTPException(status_code=403, detail="Only agents can accept requests")
        
    db_request = db.query(models.CollectionRequest).filter(models.CollectionRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if db_request.status != models.StatusEnum.pending:
        raise HTTPException(status_code=400, detail="Request is not pending")
        
    db_request.agent_id = current_user.id
    db_request.status = models.StatusEnum.assigned
    
    # Optional: Log history
    history = models.StatusHistory(
        request_id=db_request.id,
        status=models.StatusEnum.assigned,
        changed_by_id=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.patch("/{request_id}/status", response_model=schemas.CollectionRequestResponse)
def update_request_status(
    request_id: int,
    new_status: models.StatusEnum,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [models.RoleEnum.agent, models.RoleEnum.admin]:
        raise HTTPException(status_code=403, detail="Not authorized to update status")
        
    db_request = db.query(models.CollectionRequest).filter(models.CollectionRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    db_request.status = new_status
    if new_status in [models.StatusEnum.collected, models.StatusEnum.refurbished, models.StatusEnum.recycled]:
        db_request.completed_at = datetime.now(timezone.utc)
        
    history = models.StatusHistory(
        request_id=db_request.id,
        status=new_status,
        changed_by_id=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(db_request)
    return db_request
