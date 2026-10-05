# Social Automation Hub — Setup & Quickstart

## Prerequisites
- **Python**: 3.10+ (tested with Python 3.11 & 3.14)
- **Node.js**: v18+ (tested with Node.js v24)
- **Docker & Docker Compose** (Optional for containerized deployments)

---

## 1. Quickstart with Docker Compose (Recommended)
To start the entire platform with PostgreSQL, Redis, Backend, and Frontend:

```bash
# Clone the repository
git clone https://github.com/sudovu/automation_social_media.git
cd automation_social_media

# Configure environment variables
cp .env.example .env

# Run full stack in background
docker compose up -d
```

### Access URLs:
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 2. Local Development Setup (Without Docker)

### Backend Setup:
```bash
# From repository root
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup:
```bash
# From repository root in a separate terminal
cd frontend
npm install
npm run dev
```
The frontend dev server runs at [http://localhost:3000](http://localhost:3000) and automatically proxies `/api` calls to `http://localhost:8000`.

---

## 3. Running Automated Tests
```bash
# Run backend pytest suite (all 22 unit & integration tests)
cd backend
..\.venv\Scripts\pytest -v
```
All tests use an in-memory SQLite database and test connectors without requiring live third-party credentials.
