# Deployment Guide (Render + Vercel)

## 1. Backend & Database (Render)

1. Create a **PostgreSQL** instance on Render.
   - Note the **Internal Database URL** and **External Database URL**.

2. Create a **Web Service** on Render.
   - **Environment:** Docker (Render will detect the `backend/Dockerfile`).
   - **Root Directory:** `backend`
   - **Environment Variables:**
     - `DATABASE_URL`: Set to the Internal Database URL provided by Render.
     - `SECRET_KEY`: Generate a random secure string.
   
3. **Database Migrations:**
   - Once the Web Service is deployed, go to the Shell tab of the service in Render and run:
     ```bash
     alembic upgrade head
     python seed.py
     ```

## 2. Frontend (Vercel)

1. Connect your GitHub repository to Vercel.
2. Select the **EcoLoop** project.
3. Configure the Build Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**
   - `VITE_API_URL`: Set to the public URL of your Render Web Service (e.g., `https://ecoloop-backend.onrender.com`).
5. Click **Deploy**.

## CORS Configuration
Ensure that in `backend/app/main.py`, the `allow_origins` list includes your Vercel frontend URL, or keep it as `["*"]` for initial testing.
