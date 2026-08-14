import asyncio
import os
import random
import bcrypt
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from app import models
from app.database import Base, engine, SessionLocal

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_db():
    print("Starting database seed...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.User).first():
        print("Database already seeded. Skipping...")
        db.close()
        return

    # Categories
    categories = [
        {"name": "Mobile Phone", "avg_weight_kg": 0.2},
        {"name": "Laptop", "avg_weight_kg": 2.5},
        {"name": "Battery", "avg_weight_kg": 0.5},
        {"name": "CRT Monitor", "avg_weight_kg": 15.0},
        {"name": "Appliance", "avg_weight_kg": 10.0},
        {"name": "Cables & Accessories", "avg_weight_kg": 0.3},
    ]
    db_categories = []
    for cat in categories:
        db_cat = models.Category(name=cat["name"], avg_weight_kg=cat["avg_weight_kg"])
        db.add(db_cat)
        db_categories.append(db_cat)
    db.commit()

    # Users
    reporter = models.User(
        name="John Reporter", 
        email="reporter@ecoloop.com", 
        password_hash=get_password_hash("password123"), 
        role=models.RoleEnum.reporter
    )
    agent = models.User(
        name="Alice Agent", 
        email="agent@ecoloop.com", 
        password_hash=get_password_hash("password123"), 
        role=models.RoleEnum.agent
    )
    admin = models.User(
        name="Admin Boss", 
        email="admin@ecoloop.com", 
        password_hash=get_password_hash("admin123"), 
        role=models.RoleEnum.admin
    )
    
    db.add(reporter)
    db.add(agent)
    db.add(admin)
    db.commit()

    # Requests
    statuses = [models.StatusEnum.pending, models.StatusEnum.assigned, models.StatusEnum.collected, models.StatusEnum.refurbished, models.StatusEnum.recycled, models.StatusEnum.closed]
    conditions = [models.ConditionEnum.working, models.ConditionEnum.broken, models.ConditionEnum.unknown]

    for i in range(40):
        status = random.choice(statuses)
        request = models.CollectionRequest(
            reporter_id=reporter.id,
            agent_id=agent.id if status != models.StatusEnum.pending else None,
            pickup_address=f"{random.randint(100, 999)} E-waste Street, City",
            status=status,
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
        )
        if status in [models.StatusEnum.collected, models.StatusEnum.refurbished, models.StatusEnum.recycled, models.StatusEnum.closed]:
            request.completed_at = request.created_at + timedelta(days=random.randint(1, 5))
            
        db.add(request)
        db.commit()
        db.refresh(request)

        # Items for this request
        num_items = random.randint(1, 3)
        for _ in range(num_items):
            cat = random.choice(db_categories)
            item = models.EWasteItem(
                request_id=request.id,
                category_id=cat.id,
                description=f"Used {cat.name}",
                quantity=random.randint(1, 5),
                condition=random.choice(conditions)
            )
            db.add(item)
        
        # History
        history = models.StatusHistory(
            request_id=request.id,
            status=status,
            changed_by_id=reporter.id,
            timestamp=request.created_at
        )
        db.add(history)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
