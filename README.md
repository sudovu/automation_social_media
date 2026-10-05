# SOCIAL AUTOMATION HUB

[![CI / Build & Test](https://github.com/sudovu/automation_social_media/actions/workflows/ci.yml/badge.svg)](https://github.com/sudovu/automation_social_media/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)

A centralized, enterprise-grade platform for managing, scheduling, monitoring, replying to, analyzing, and automating multiple social-media accounts from one intuitive dashboard.

---

## Key Highlights

- **Extensible Connector Architecture**: Adding another social platform requires simply implementing a `SocialConnector` plugin instead of rewriting the application.
- **100% Official API & Policy Adherence**: Strictly respects platform terms, rate limits, OAuth standards, and official API permissions. Unsupported platform features (e.g. text-only posts on Instagram/Pinterest/YouTube, direct messaging restrictions on LinkedIn/YouTube/TikTok/Threads) are explicitly marked rather than faked.
- **Master Safeguard Switch**: Emergency controls (`PAUSE ALL`, `RESUME ALL`, `STOP ALL AUTOMATIONS`, `DISCONNECT ACCOUNT`) are always accessible to freeze automated queues instantly.
- **Anti-Spam Safeguards**: Built-in maximum message/hour limits, daily post ceilings, cooldown buffers, and bot-to-bot recursion loop blocking.
- **Unified Omni-Channel Inbox**: Centralizes Direct Messages and Public Comments across channels with AI conversation summaries (Customer wants, Customer asked, Current status, Suggested action).
- **Visual No-Code Automation Builder**: Event-driven rules following the `WHEN (Trigger) → IF (Condition) → THEN (Action)` model.
- **AI Content Studio**: 1 core idea generates tailored copy for Facebook, Instagram, LinkedIn, X, and Telegram. Includes content repurposing (Article/Transcript → Social snippets + Quotes) and AI tone rewriter.
- **8-Step First-Run Onboarding Wizard**: Guides non-technical users through initial admin creation, timezones, AI engine, channels, business hours, and inaugural posts.

---

## Supported Social Platforms

| Platform | Official API | Publishing | Scheduling | Inbox | Comments | Analytics | Policy Notes |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Facebook** | Graph API v19.0 | ✅ | ✅ | ✅ | ✅ | ✅ | Page feed, photos, videos & insights |
| **Instagram** | Graph API | ✅ | ✅ | ✅ | ✅ | ✅ | Professional accounts; requires image/video |
| **X / Twitter** | API v2 | ✅ | Hub Engine | ✅ | ✅ | ✅ | Tweets, native polls, media & DMs |
| **LinkedIn** | Community Mgmt API | ✅ | Hub Engine | 🔒 | ✅ | ✅ | DM restricted by LinkedIn Partner access policy |
| **YouTube** | Data API v3 | ✅ | ✅ | ❌ | ✅ | ✅ | Video assets only; DM not supported by YouTube API |
| **TikTok** | Content Posting API | ✅ | Hub Engine | ❌ | ✅ | ✅ | Direct video uploads & video metrics |
| **Telegram** | Bot API | ✅ | Hub Engine | ✅ | ✅ | ✅ | Channel broadcast, polls, groups & webhooks |
| **WhatsApp** | Cloud API (Meta) | ❌ | ❌ | ✅ | ❌ | ✅ | Conversational customer messaging; no public feed |
| **Reddit** | OAuth2 API | ✅ | Hub Engine | ✅ | ✅ | ✅ | Subreddit links, text & polls; post karma metrics |
| **Pinterest** | API v5 | ✅ | Hub Engine | ❌ | ❌ | ✅ | Pin creation with images/videos; board analytics |
| **Threads** | Threads API (Meta) | ✅ | Hub Engine | ❌ | ✅ | ✅ | Text (up to 500 chars), image/video posts & replies |

---

## Architecture Overview

```
automation_social_media/
├── backend/
│   ├── app/
│   │   ├── api/            # REST API route handlers
│   │   ├── auth/           # JWT & password security
│   │   ├── connectors/     # Base connector interface & 11 platform plugins
│   │   ├── automation/     # Visual Automation Engine & anti-spam safeguards
│   │   ├── scheduler/      # Background cron scheduler & queue runner
│   │   ├── ai/             # Multi-provider AI abstraction (Mock & Gemini)
│   │   ├── models/         # SQLAlchemy 2.0 async database models
│   │   ├── schemas/        # Pydantic v2 validation contracts
│   │   ├── database.py     # Async database session & migration helpers
│   │   ├── security.py     # Fernet credential encryption at rest & PBKDF2
│   │   └── main.py         # Application entrypoint & lifespan manager
│   ├── tests/              # Comprehensive Pytest suite (22 tests)
│   ├── Dockerfile          # Backend container image
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Sidebar, Header & navigation
│   │   ├── pages/          # Dashboard, Accounts, Posts, Calendar, Inbox, Automations, AI, etc.
│   │   ├── api/            # Typed fetch client
│   │   └── types/          # TypeScript interface definitions
│   ├── Dockerfile          # Frontend production image
│   └── package.json        # Node dependencies & Vite config
│
├── docs/                   # Full documentation suite
│   ├── architecture.md
│   ├── setup.md
│   ├── integrations.md
│   ├── automation.md
│   └── security.md
│
├── docker-compose.yml      # Orchestrates PostgreSQL, Redis, Backend, Frontend
├── .env.example            # Environment variables template
├── .gitignore              # Strict secret and build artifact exclusion
├── LICENSE                 # MIT License
└── README.md
```

---

## Quickstart Guide

### Option 1: Docker Compose (1 Single Command)
```bash
# 1. Clone repository
git clone https://github.com/sudovu/automation_social_media.git
cd automation_social_media

# 2. Copy environment template
cp .env.example .env

# 3. Start full stack in background
docker compose up -d
```

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development (Without Docker)

#### Backend:
```bash
python -m venv .venv
.\.venv\Scripts\activate      # Windows (or: source .venv/bin/activate on Unix)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## Running Automated Tests

Run the backend Pytest suite:
```bash
cd backend
pytest -v
```
All 22 test cases pass cleanly without requiring live third-party credentials.

---

## Security Model

- **Tokens Encrypted at Rest**: Access and refresh tokens are encrypted using Fernet (AES-128-CBC + HMAC-SHA256).
- **Zero Committed Secrets**: `.env` and sensitive files are excluded via `.gitignore`.
- **Command Injection Prevention**: AI responses are sanitized to neutralize shell sequences.
- **SHA-256 File Deduplication**: Media library hashes uploaded assets to prevent redundant uploads.

---

## License

This project is licensed under the [MIT License](LICENSE).
