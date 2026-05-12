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
