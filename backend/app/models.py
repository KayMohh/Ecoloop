from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from .database import Base

class RoleEnum(str, enum.Enum):
    reporter = "reporter"
    agent = "agent"
    admin = "admin"

class StatusEnum(str, enum.Enum):
    pending = "pending"
    assigned = "assigned"
    collected = "collected"
    refurbished = "refurbished"
    recycled = "recycled"
    closed = "closed"

class ConditionEnum(str, enum.Enum):
    working = "working"
    broken = "broken"
    unknown = "unknown"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.reporter)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    requests_reported = relationship("CollectionRequest", back_populates="reporter", foreign_keys="[CollectionRequest.reporter_id]")
    requests_assigned = relationship("CollectionRequest", back_populates="agent", foreign_keys="[CollectionRequest.agent_id]")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    avg_weight_kg = Column(Float)

class EWasteItem(Base):
    __tablename__ = "e_waste_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    description = Column(Text, nullable=True)
    quantity = Column(Integer, default=1)
    condition = Column(Enum(ConditionEnum), default=ConditionEnum.unknown)
    estimated_weight_kg = Column(Float, nullable=True)
    request_id = Column(Integer, ForeignKey("collection_requests.id"))

    category = relationship("Category")
    request = relationship("CollectionRequest", back_populates="items")

class CollectionRequest(Base):
    __tablename__ = "collection_requests"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    pickup_address = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    reporter = relationship("User", back_populates="requests_reported", foreign_keys=[reporter_id])
    agent = relationship("User", back_populates="requests_assigned", foreign_keys=[agent_id])
    items = relationship("EWasteItem", back_populates="request", cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="request", cascade="all, delete-orphan")

class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("collection_requests.id"))
    status = Column(Enum(StatusEnum))
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    request = relationship("CollectionRequest", back_populates="status_history")
    changed_by = relationship("User")
