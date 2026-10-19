# PennyWise — Student Expense Tracker

PennyWise is a full-stack student expense tracker. Users can create an account, record income and expenses, review and filter transaction history, manage a monthly spending budget, and view a current-month category breakdown.

## Features

- Registration, login, logout, protected dashboard, and session restoration.
- Income and expense transaction creation, editing, and deletion.
- Transaction history with type/category filters and title/category search.
- Dashboard cards for all-time balance and current-month income and expenses.
- Monthly budget display, editing, remaining amount, and spending progress.
- Current-month expense category chart.
- User-owned transaction access enforced by the backend.

## Prerequisites

| Tool | Version / requirement |
| --- | --- |
| Node.js | 20 LTS or later |
| npm | 10 or later |
| MongoDB Atlas | An Atlas account and a cluster accessible from your development machine |
| Git | Required to clone the repository |

## Project structure

```text
PennyWise/
├── PROJECT_BLUEPRINT.md
├── README.md
├── client/   # React + Vite frontend
└── server/   # Express API and MongoDB/Mongoose backend
```

## Installation and environment setup

Run these steps from the repository root unless a command says otherwise. The client and server have separate package manifests and dependencies.

### 1. Clone the repository

```powershell
git clone <your-repository-url>
Set-Location PennyWise
```

### 2. Configure MongoDB Atlas

1. Create or select an Atlas project and create a cluster.
2. In **Database Access**, create a database user and record its username and password securely.
3. In **Network Access**, allow the IP address of the machine running the backend. Avoid broad public access where possible.
4. Select **Connect → Drivers** for the cluster and copy the MongoDB connection string.
5. In the connection string, replace the Atlas username, password, and database name placeholders with your own values. Keep the URI private.

Atlas credentials and the connection string belong only in the local server environment file; do not put them in source code or share them publicly.

### 3. Configure and install the backend

From the repository root:

```powershell
Set-Location server
Copy-Item .env.example .env
```

Edit `server/.env` locally and set `MONGO_URI` to your Atlas connection string and `JWT_SECRET` to a long, random secret. `PORT` defaults to `5000`; `NODE_ENV` can be set to `development`. Never commit or publish this file. The checked-in `.env.example` files are templates only.

Install the backend packages while still in the `server` directory:

```powershell
npm install
```

### 4. Configure and install the frontend

Return to the repository root, then copy the frontend template:

```powershell
Set-Location ..
Set-Location client
Copy-Item .env.example .env
```

The example sets `VITE_API_URL` to the local backend API (`http://localhost:5000/api`). Keep that value for local development, or change it to the deployed API URL when configuring a deployment. Vite exposes `VITE_` variables to browser code, so do not put secrets in client environment variables.

Install the frontend packages while still in the `client` directory:

```powershell
npm install
```

## Run the applications

Start the server and client in **separate terminal windows**. In each terminal, begin from the repository root.

### Terminal 1 — backend

```powershell
Set-Location server
npm run dev
```

The API listens on `http://localhost:5000` by default. The server connects to MongoDB before it starts listening. Check its health endpoint at `http://localhost:5000/api/health`.

### Terminal 2 — frontend

```powershell
Set-Location client
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. Sign up or sign in to reach the protected dashboard.

## Build the frontend

From the repository root:

```powershell
Set-Location client
npm run build
```

The production bundle is written to `client/dist/`. `npm run preview` from the client directory serves the built frontend locally for a preview.

## API routes

All routes are under `/api`. The authentication middleware protects transaction and budget routes.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server health check |
| POST | `/api/auth/register` | Register and return an authenticated session |
| POST | `/api/auth/login` | Log in and return an authenticated session |
| GET | `/api/auth/me` | Return the authenticated user's profile |
| GET | `/api/transactions` | List the authenticated user's transactions; optional `type` and `category` query filters |
| POST | `/api/transactions` | Create an income or expense transaction |
| GET | `/api/transactions/summary` | Return all-time totals and current-month summary/category breakdown |
| PUT | `/api/transactions/budget` | Set the authenticated user's `monthlyBudget` |
| PUT | `/api/transactions/:id` | Update a transaction owned by the authenticated user |
| DELETE | `/api/transactions/:id` | Delete a transaction owned by the authenticated user |

Transaction amounts are positive INR values. Categories are validated against the selected transaction type. The dashboard performs title/category text search in the client; the backend list API supports the `type` and `category` filters shown above.

## Development scripts and tests

- Client: `npm run dev`, `npm run build`, `npm run preview`.
- Server: `npm run dev`, `npm start`.
- There is currently no automated test script or checked-in test suite. The production frontend build is the available build verification; backend behavior should be verified against a development database, not production data.

## Technology stack

- **Frontend:** React 18, Vite 5, React Router DOM 6, Axios, Recharts, Lucide React.
- **Backend:** Node.js, Express 4, JavaScript ES modules.
- **Database:** MongoDB Atlas, Mongoose 8.
- **Authentication:** JWT and bcryptjs.
