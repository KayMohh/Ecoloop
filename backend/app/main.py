from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, categories, requests, dashboard

app = FastAPI(title="EcoLoop API", description="E-waste collection tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(requests.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoLoop API"}
