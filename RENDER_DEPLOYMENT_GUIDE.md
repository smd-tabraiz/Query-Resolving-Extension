# Smart Browser Search Assistant - Render Deployment Guide 🚀

This guide provides step-by-step instructions for deploying the full-stack Smart Browser Search Assistant on [Render.com](https://render.com/).

## Important Prerequisites
- You need a **GitHub** account.
- You need a **Render** account.
- Push your entire `IIIT-DM-TASK-3` folder to a GitHub repository before starting.

---

## Part 1: Deploying the Backend (Web Service)

The backend handles the AI clusters, the database, the socket connection, and the secure APIs.

1. Log into your Render account and click **New > Web Service**.
2. Connect your GitHub account and select your repository.
3. Configure the Web Service:
   - **Name**: `search-assistant-api` (or your preferred name)
   - **Environment**: `Node`
   - **Root Directory**: `backend` *(Crucial! Render needs to know where the backend code lives)*
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free (or whichever you prefer)
4. Scroll down and click **Advanced** to add Environment Variables (`.env`):
   - `PORT` : `5000`
   - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` : (Skip these for SQLite default setup, or add them if using a managed MySQL database)
   - `JWT_SECRET` : `your-super-secret-production-key` (Make it strong!)
   - `GEMINI_API_KEY` : `your-google-gemini-key`
   - `OPENAI_API_KEY` : (Optional, if you want to use the legacy AI code)
   - `MAIL_HOST` : `smtp.sendgrid.net`
   - `MAIL_PORT` : `587`
   - `MAIL_USER` : `apikey`
   - `MAIL_PASS` : `your-sendgrid-password`
   - `MAIL_FROM` : `your-email@domain.com`
5. Click **Create Web Service**. 
6. Render will build and deploy your backend. **Copy the backend URL** (e.g., `https://search-assistant-api.onrender.com`) once it's live!

*Note for Free Tier: Because we are using an SQLite file (`database.sqlite`), Render's free tier will wipe the database every time the server spins down. For a persistent database on production, you should either attach a Render Disk (Paid) or change your database dialect to MySQL/Postgres using a free remote DB like Supabase/Aiven.*

---

## Part 2: Deploying the Frontend (Static Site)

The frontend is a lightweight React/Vite application.

1. Go back to the Render dashboard and click **New > Static Site**.
2. Select the same GitHub repository.
3. Configure the Static Site:
   - **Name**: `search-assistant-ui`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add Environment Variables:
   - Click **Advanced** and add an Environment Variable.
   - **Key**: `VITE_API_URL`
   - **Value**: Paste the URL of your deployed Backend Web Service from Part 1 *(e.g., `https://search-assistant-api.onrender.com`)*. Make sure there is no trailing slash (`/`) at the end!
5. Click **Create Static Site**.

---

## Part 3: Verify the Live Application

1. Click on the URL of your newly deployed Frontend Static Site.
2. The UI should load. Try registering a new test account and logging in.
3. Perform a few searches using the Search interface.
4. Navigate to the Admin Analytics panel to verify that the WebSocket connection is successful and the AI Intelligence Clusters are analyzing your new data correctly.

🎉 **Congratulations! Your Smart Browser Search Assistant is live!**
