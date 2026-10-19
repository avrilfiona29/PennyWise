# PennyWise — Student Expense Tracker

A full-stack personal finance application built with React + Vite (frontend) and Node.js + Express (backend), backed by MongoDB Atlas.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS or later |
| npm | 10 or later |
| MongoDB Atlas | Free tier cluster |

---

## Project Structure

```
PennyWise/
├── PROJECT_BLUEPRINT.md
├── README.md
├── .gitignore
├── client/               ← React + Vite frontend
│   ├── .env.example
│   ├── vite.config.js
│   └── src/
└── server/               ← Express backend
    ├── .env.example
    └── server.js
```

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd PennyWise
```

### 2. Configure the backend environment

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

```
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random string>
NODE_ENV=development
```

> **Never commit `.env` to Git.**

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure the frontend environment

```bash
cd ../client
cp .env.example .env
```

The default value `VITE_API_URL=http://localhost:5000/api` works for local development.

### 5. Install frontend dependencies

```bash
cd client
npm install
```

---

## Running the Applications

Open **two terminal windows**.

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

The server starts on **http://localhost:5000**.

Verify the health endpoint:

```bash
curl http://localhost:5000/api/health
# → {"status":"ok","message":"PennyWise server is running"}
```

### Terminal 2 — Frontend

```bash
cd client
npm run dev
```

The app opens on **http://localhost:5173**.

---

## Building for Production

```bash
cd client
npm run build
```

Static files are output to `client/dist/`.

---

## Available API Routes (current milestone)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health check |

More routes are added in M1 (auth) and M2 (transactions, dashboard, budget).

---

## Development Milestones

| Milestone | Status |
|-----------|--------|
| M0 — Foundation | ✅ Complete |
| M1 — Database & Auth | ⬜ Next |
| M2 — Backend Features | ⬜ Pending |
| M3 — Auth Frontend | ⬜ Pending |
| M4 — Dashboard | ⬜ Pending |
| M5 — Integration & Testing | ⬜ Pending |
| M6 — Portfolio Delivery | ⬜ Pending |

---

## Tech Stack

- **Frontend:** React 18, Vite 5, React Router DOM 6, Axios, Recharts, Lucide React
- **Backend:** Node.js, Express 4, ES Modules
- **Database:** MongoDB Atlas, Mongoose 8
- **Auth:** JWT, bcryptjs
