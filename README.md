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
│   │   │  ├── analytics_service.py
│   │   │  ├── forecast_service.py
│   │   │  ├── anomaly_service.py
│   │   │  ├── upload_service.py
│   │   │  └── chatbot_service.py
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
│   └── .env.example
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
│
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── docker-compose.yml
├── .env.example
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

# ML Training

```bash
cd ml
python train_categorizer.py
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
```

---

# Future Improvements

- OpenAI API integration
- Budget planner
- OCR statement extraction
- Advanced forecasting
- Real-time alerts

---