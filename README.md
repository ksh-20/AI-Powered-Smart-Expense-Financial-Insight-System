# FinAI — AI-Powered Smart Expense & Financial Insight System

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white" alt="Celery" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

---

## Overview

**FinAI** is an intelligent, full-stack personal finance and expense intelligence platform. It combines machine learning algorithms, time-series forecasting, multi-factor anomaly detection, automated receipt & statement OCR parsing, and conversational AI advisory to help users understand, optimize, and master their personal finances.

---

## Key Highlights & Features

### 🧠 AI & Intelligent Insights

- **Intelligent Expense Categorization**: Automated machine learning classifier assigns transactions into standardized financial buckets.
- **Dynamic Spending Forecast**: Predicts upcoming 90-day expenditures considering linear regression trend slopes, calendar month day variances (31 vs 30 vs 28 days), weekend velocity weighting, and seasonal shifts with confidence intervals.
- **Multi-Factor Anomaly Detection & XAI**: Flags suspicious and abnormal expenditures using IsolationForest & category baseline deviations, with on-demand NLP natural language diagnostic summaries.
- **Budget-Linked Financial Insights**: In-depth multi-paragraph advisory providing 50/30/20 allocation diagnostics, category overage freeze plans, daily spending allowance ceilings, and annual compounding projections.
- **AI Financial Assistant**: Real-time context-aware chat assistant that analyzes your live financial telemetry to answer budgeting, saving, and optimization questions.

### 📊 Deep Analytics & Visualization

- **Live Expenditure Telemetry**: Interactive donut share-of-wallet distribution, category benchmark comparisons, monthly trajectory area charts, day-of-week radar/bar rhythms, and cumulative S-curves.
- **Dynamic Timeframe Filtering**: Filter instantly by _All Time_, _This Month_, _Last 30 Days_, _Last 90 Days_, or _This Year_ with live recalculation and CSV export.

### 🎯 Budget Goals & Monitoring

- **Category-Level Ceilings**: Define monthly spending targets per category with color-coded consumption meters (_Safe_, _Warning &ge;70%_, _Exceeded &ge;100%_).
- **Synchronized Insights**: Budget overruns and near-limit thresholds directly inform the AI recommendation engine.

### 📄 Automated Statement & Receipt Ingestion

- **Multimodal OCR Extraction**: Upload bank statements or receipt images (PDF, PNG, JPG, CSV) for automated transaction ingestion and background processing via Celery and Redis.

### 🔐 Security & User Preferences

- **Enterprise-Grade Auth**: JWT-based authentication with bcrypt password hashing and protected routing.
- **Multi-Currency & Customization**: Support for INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), AUD (A$), and CAD (C$), with customizable date formats and budget limits.

---

## Tech Stack

| Layer              | Technologies                                                                |
| ------------------ | --------------------------------------------------------------------------- |
| **Frontend**       | React 18, Vite, Tailwind CSS, Recharts, Axios, React Router v6              |
| **Backend**        | FastAPI, SQLAlchemy ORM, Pydantic, Uvicorn, Celery, Redis                   |
| **Database**       | PostgreSQL 16+                                                              |
| **AI / ML**        | Scikit-learn, IsolationForest, Statsmodels, NLP Text Parsers, AI LLM Engine |
| **DevOps & Tools** | Docker, Docker Compose, Git, Alembic                                        |

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
│   |   ├── cache.py
│   │   ├── dependencies.py
│   |   ├── celery_app.py
│   |   ├── tasks.py
│   │   ├── middleware.py
│   │   ├── security.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   |   |   ├── budget_goal.py
│   |   |   ├── category_rule.py
│   |   |   ├── user_settings.py
│   │   │   ├── expense.py
│   │   │   ├── forecast.py
│   │   │   ├── anomaly.py
│   │   │   ├── statement.py
│   │   │   ├── recommendation.py
│   │   │   └── chatbot.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   |   |   ├── budget.py
│   |   |   ├── category.py
│   |   |   ├── settings.py
│   │   │   ├── expense.py
│   │   │   ├── analytics.py
│   │   │   └── chatbot.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   |   |   ├── budget.py
│   |   |   ├── categorize.py
│   |   |   ├── settings.py
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
│   |   |   ├── budget_service.py
│   |   |   ├── settings_service.py
│   │   │   ├── upload_service.py
│   │   │   └── chatbot_service.py
│   │   ├── ai/
│   │   │   ├── categorizer.py
│   │   │   ├── predictor.py
│   |   |   ├── ocr_parser.py
│   │   │   ├── anomaly_detector.py
│   │   │   ├── recommender.py
│   │   │   └── chatbot_engine.py
│   │   └── utils/
│   │       ├── parser.py
│   │       └── helpers.py
│   │
│   ├── uploads/
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/axios.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SettingsContext.jsx
│   │   ├── routes/ProtectedRoute.jsx
│   │   ├── layouts/MainLayout.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Card.jsx
│   |   |   ├── FormattedText.jsx
│   │   │   ├── ExpenseTable.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── Chatbot.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   |   |   ├── Budget.jsx
│   |   |   ├── Settings.jsx
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
├── .gitignore
└── README.md

```

---

## Getting Started & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ksh-20/AI-Powered-Smart-Expense-Financial-Insight-System.git
cd AI-Powered-Smart-Expense-Financial-Insight-System
```

---

### 2. Database Setup (PostgreSQL)

1. **Install PostgreSQL** and launch the service:
   - Default Port: `5432`
   - Default User: `postgres`

2. **Create the Database**:
   ```bash
   psql -U postgres
   ```
   Inside PostgreSQL shell:
   ```sql
   CREATE DATABASE finance_ai;
   \q
   ```

---

### 3. Environment Configuration

Create a `.env` file in the project root and in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_ai
SECRET_KEY=super_secret_jwt_key_change_me_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=YOUR_AI_API_KEY
```

> **AI API Key**: Obtain a free API Key from Google AI Studio and place it in the `GEMINI_API_KEY` field.

---

### 4. Backend Setup

```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend dev server
uvicorn app.main:app --reload --port 8000
```

- **Interactive API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 5. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install node dependencies
npm install

# Run Vite dev server
npm run dev
```

- **Application Web UI**: [http://localhost:5173](http://localhost:5173)

---

### 6. Background Workers & Redis (Optional / OCR Processing)

1. **Start Redis**:

   ```bash
   docker run -d --name expense-redis -p 6379:6379 redis:alpine
   ```

2. **Start Celery Worker**:
   ```bash
   cd backend
   celery -A app.celery_app:celery_app worker --loglevel=info --pool=solo
   ```

---

### 7. Full Stack with Docker Compose

To spin up the entire application stack (Backend, Frontend, PostgreSQL, Redis) with a single command:

```bash
docker-compose up --build
```

---

## Machine Learning Models Training

Train or re-train custom expense classifiers locally:

```bash
cd ml
python train_categorizer.py
```

---

## API Summary Reference

| Module             | Method   | Endpoint               | Description                                        |
| ------------------ | -------- | ---------------------- | -------------------------------------------------- |
| **Authentication** | `POST`   | `/api/auth/signup`     | Register a new user account                        |
|                    | `POST`   | `/api/auth/login`      | Authenticate & receive JWT bearer token            |
| **Expenses**       | `GET`    | `/api/expenses`        | Retrieve all user transactions                     |
|                    | `POST`   | `/api/expenses`        | Record a new expense with auto-categorization      |
|                    | `DELETE` | `/api/expenses/{id}`   | Delete an existing transaction                     |
| **Analytics**      | `GET`    | `/api/analytics`       | Telemetry KPIs, distribution, trajectory & rhythms |
| **Forecast**       | `GET`    | `/api/forecast`        | Dynamic 90-day time-series projections             |
| **Anomalies**      | `GET`    | `/api/anomaly`         | Detect outliers & baseline breaches                |
|                    | `POST`   | `/api/anomaly/explain` | NLP AI deep-dive explanation of flagged expense    |
| **Insights**       | `GET`    | `/api/insights`        | Budget-linked multi-factor actionable diagnostics  |
| **Budget Goals**   | `GET`    | `/api/budget/progress` | Real-time budget progress per category             |
|                    | `POST`   | `/api/budget/`         | Create or update category spending limits          |
| **AI Assistant**   | `POST`   | `/api/chatbot/`        | Conversational financial intelligence              |
| **Settings**       | `GET`    | `/api/settings`        | Retrieve user preferences & monthly budget         |
|                    | `PUT`    | `/api/settings`        | Update currency, theme, and budget thresholds      |

---

# Contributors

Thanks to [Arjun](https://github.com/arzzun05) and [Ansh](https://github.com/anshdhoka-cmyk) for their valuable contributions.

---
