from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from .models import RoleEnum, StatusEnum, ConditionEnum

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[RoleEnum] = RoleEnum.reporter

class UserResponse(UserBase):
    id: int
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    avg_weight_kg: float

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# EWasteItem Schemas
class EWasteItemBase(BaseModel):
    category_id: int
    description: Optional[str] = None
    quantity: int = 1
    condition: ConditionEnum = ConditionEnum.unknown
    estimated_weight_kg: Optional[float] = None

class EWasteItemCreate(EWasteItemBase):
    pass

class EWasteItemResponse(EWasteItemBase):
    id: int
    request_id: int

    class Config:
        from_attributes = True

# Request Schemas
class CollectionRequestBase(BaseModel):
    pickup_address: str

class CollectionRequestCreate(CollectionRequestBase):
    items: List[EWasteItemCreate]

class CollectionRequestResponse(CollectionRequestBase):
    id: int
    reporter_id: int
    agent_id: Optional[int]
    status: StatusEnum
    created_at: datetime
    scheduled_at: Optional[datetime]
    completed_at: Optional[datetime]
    items: List[EWasteItemResponse]

    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_collected: int
    refurbished_count: int
    recycled_count: int
    refurbished_percentage: float
    recycled_percentage: float
    estimated_waste_diverted_kg: float
