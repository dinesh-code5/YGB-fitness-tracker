# 💪 YGB — Your Gym Buddy

A full-stack fitness application built to help beginners track workouts, follow personalized training splits, manage Indian-focused diet plans, and visualize progress.

---

## 🏗 Deployment Architecture

The application is architected for a distributed, modern web environment:

*   **Frontend**: Hosted on [Vercel](https://vercel.com/) (React/Vite).
*   **Backend**: Hosted on [Render](https://render.com/) (Node.js/Express).
*   **Database**: Managed by [Neon](https://neon.tech/) (PostgreSQL).

---

## ⚡ Deployment Instructions

### 1. Database (Neon)
1.  Create a project on [Neon](https://console.neon.tech/).
2.  Obtain your **Postgres Connection String**.
3.  Add your Render Backend's IP address (or `0.0.0.0/0`) to the Neon IP Allowlist.

### 2. Backend (Render)
1.  Create a "New Web Service" on Render.
2.  Point to your GitHub repository.
3.  **Root Directory**: `backend`
4.  **Build Command**: `npm install`
5.  **Start Command**: `node server.js`
6.  **Environment Variables**:
    *   `DATABASE_URL`: Your Neon connection string.
    *   `JWT_SECRET`: A secure, random string.
    *   `CLIENT_URL`: The URL of your Vercel frontend (e.g., `https://ygb-frontend.vercel.app`).
7.  After deployment, note the **Render API URL** (e.g., `https://ygb-api.onrender.com`).

### 3. Frontend (Vercel)
1.  Import your project from GitHub.
2.  **Root Directory**: `frontend`
3.  **Environment Variables**:
    *   `REACT_APP_API_URL`: Your Render Backend URL.
4.  Deploy.

---

## 🗂 Project Structure

```
ygb/
├── backend/
│   ├── config/             # DB connection (Neon/Postgres)
│   ├── controllers/        # Request handling logic
│   ├── models/             # Database schemas
│   └── server.js           # API entry point
└── frontend/
    ├── src/
    │   ├── components/     # UI components (RestTimer, Navbar, etc)
    │   ├── context/        # Global state (Auth, Theme)
    │   ├── pages/          # Application views
    │   └── utils/          # API helpers
```

---

## 🛠 Local Development

### Prerequisites
- Node.js v18+
- npm

### 1. Backend Setup
```bash
cd backend
npm install
# Set DATABASE_URL and JWT_SECRET in .env
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Ensure VITE_API_URL points to localhost:5000 in .env
npm run dev
```

---

## 🔌 Core Features

*   **Workout Logger**: Real-time logging with an integrated rest timer.
*   **Progress Tracking**: Visual data via Chart.js bar and line charts.
*   **Personalized Planning**: Automated PPL (Push/Pull/Legs) split generation.
*   **Diet Management**: BMR/TDEE calculation with Indian food options.

---

## 📊 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React, Tailwind CSS |
| **Charts** | Chart.js |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL (Neon) |
| **Hosting** | Vercel (Frontend), Render (Backend) |
