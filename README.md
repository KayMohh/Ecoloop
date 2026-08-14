# EcoLoop - E-Waste Collection Tracker

A full-stack web application to track e-waste collection requests.

## Architecture
- **Backend:** FastAPI, PostgreSQL, SQLAlchemy, Alembic.
- **Frontend:** React, Vite, Tailwind CSS, TypeScript, Recharts.

## Local Development

### Using Docker Compose
The easiest way to run the entire stack locally is with Docker:

```bash
docker compose up -d
```

This will spin up:
- PostgreSQL on port `5432`
- FastAPI Backend on port `8000`
- React Frontend on port `3000`

### Seed Data
To populate the database with realistic demo data, run:
```bash
cd backend
source venv/bin/activate
python seed.py
```
*(Note: If using Docker, you can run this script locally since the DB port is exposed, or run it inside the backend container).*

### Accessing the App
- **Frontend App:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:8000/docs
- **Default Users:** 
  - `reporter@ecoloop.com` / `password123`
  - `agent@ecoloop.com` / `password123`
  - `admin@ecoloop.com` / `admin123`
