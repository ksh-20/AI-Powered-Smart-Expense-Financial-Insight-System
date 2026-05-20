# AI Powered Smart Expense & Financial Insight System

## Features

- AI Expense Categorization
- Financial Forecasting
- Spending Anomaly Detection
- AI Financial Assistant
- JWT Authentication
- CSV/PDF Statement Upload
- Analytics Dashboard
- Recharts Visualization
- PostgreSQL Integration
- Dockerized Deployment

---

# Tech Stack

## Frontend
- React + Vite
- TailwindCSS
- Axios
- Recharts

## Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Auth

## AI/ML
- Scikit-learn
- Statsmodels
- IsolationForest
- Gemini API

---

# Folder Structure
```bash
ai-finance-system/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── middleware.py
│   │   ├── security.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── expense.py
│   │   │   ├── forecast.py
│   │   │   ├── anomaly.py
│   │   │   ├── statement.py
│   │   │   ├── recommendation.py
│   │   │   └── chatbot.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── expense.py
│   │   │   ├── analytics.py
│   │   │   └── chatbot.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── expenses.py
│   │   │   ├── analytics.py
│   │   │   ├── forecast.py
│   │   │   ├── anomaly.py
│   │   │   ├── upload.py
│   │   │   ├── insights.py
│   │   │   ├── chatbot.py
│   │   │   └── profile.py
│   │   ├── services/
│   │   │   ├── expense_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── forecast_service.py
│   │   │   ├── anomaly_service.py
│   │   │   ├── upload_service.py
│   │   │   └── chatbot_service.py
│   │   ├── ai/
│   │   │   ├── categorizer.py
│   │   │   ├── predictor.py
│   │   │   ├── anomaly_detector.py
│   │   │   ├── recommender.py
│   │   │   └── chatbot_engine.py
│   │   └── utils/
│   │       ├── parser.py
│   │       └── helpers.py
│   │
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── routes/ProtectedRoute.jsx
│   │   ├── layouts/MainLayout.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ExpenseTable.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── Chatbot.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Forecast.jsx
│   │   │   ├── Anomalies.jsx
│   │   │   ├── Insights.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Assistant.jsx
│   │   └── styles/index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
│
├── ml/
│   ├── train_categorizer.py
│   ├── train_forecast.py
│   ├── train_anomaly.py
│   ├── sample_data/
│   │   └── expenses.csv
│   └── saved_models/
│       └── categorizer.pkl
│
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── docker-compose.yml
├── .env
└── README.md

```

---

# Setup

## Clone

```bash
git clone <repo>
cd ai-finance-system
```

---

# Models Training
```bash
cd ml
python train_categorizer.py
```

---

# Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Docker Setup

```bash
docker-compose up --build
```

---

# Database Setup

1. Install PostgreSQL

Download and install.

During installation:
Username: postgres
Password: <password of choice>
Port: 5432

Also install:
pgAdmin
Command Line Tools

2. Verify PostgreSQL Installation
Open terminal / PowerShell:
``` bash
psql --version
```

Expected:
psql (PostgreSQL) 18.x

3. Start PostgreSQL Service
Windows Open Services.
Find postgresql-x64-16 and Ensure status is Running.

4. Login to PostgreSQL
Open PowerShell:
``` bash
psql -U postgres
```

Enter password.
You should see:
postgres=#

5. Create Database
Inside PostgreSQL shell:
``` bash
CREATE DATABASE finance_ai;
```

Verify:
``` bash
\l
```

You should see: finance_ai

Exit:
``` bash
\q
```

6. Create Root .env
// FILE: .env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_ai
SECRET_KEY=super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

7. Create Backend .env
// FILE: backend/.env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_ai
SECRET_KEY=super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

8. Create Python Virtual Environment
From project root:
``` bash
cd backend
``` 

Create venv:
``` bash
python -m venv venv
``` 

Activate:
Windows
``` bash
venv\Scripts\activate
```

9. Install Backend Dependencies
pip install -r requirements.txt

10. Run Backend
Inside backend folder:
``` bash
uvicorn app.main:app --reload
```

Expected:
``` bash
Uvicorn running on http://127.0.0.1:8000
```

11. Verify Tables Were Created
Open pgAdmin OR psql:
``` bash
psql -U postgres
```

Connect:
``` bash
\c finance_ai
```

Show tables:
``` bash
\dt
```

Expected:
users
expenses
forecasts
anomalies
uploaded_statements
recommendations
chatbot_history

12. Test API
Open browser:
http://127.0.0.1:8000/docs
You should see FastAPI Swagger UI.

13. Test Signup
Use:
POST /api/auth/signup

Example:

{
  "name":"Kshitij",
  "email":"test@test.com",
  "password":"123456"
}

14. Verify User Saved
In PostgreSQL:
``` bash
SELECT * FROM users;
```

Expected:

 id |  name   |     email
----+---------+----------------
  1 | Kshitij | test@test.com

---

# Gemini API Setup

1. Get Gemini API
Go to Google AI Studio. Create an API Key in Free Tier. Copy the API Key.

2. In backend and root .env files, modify
``` bash
GEMINI_API_KEY=<paste the copied API Key here>
```

---

# API Summary

## Auth
- POST /api/auth/signup
- POST /api/auth/login

## Expenses
- GET /api/expenses
- POST /api/expenses

## Analytics
- GET /api/analytics

## Forecast
- GET /api/forecast

## Anomaly
- GET /api/anomaly

## Chatbot
- POST /api/chatbot

---

# Environment Variables

```env
DATABASE_URL=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
GEMINI_API_KEY=
```

---

# Future Improvements

- OpenAI API integration
- Budget planner
- OCR statement extraction
- Advanced forecasting
- Real-time alerts

---