# Social Automation Hub — System Architecture

## Overview
**Social Automation Hub** is an enterprise-grade, multi-platform social media scheduling, automated customer inbox, and workflow automation engine designed to operate directly from a single centralized dashboard.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     React + TypeScript Frontend                         │
│   (Dashboard, Accounts, Posts, Queue, Calendar, Inbox, Rules, Studio)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST API (JSON / Bearer JWT)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    FastAPI Core Application Engine                      │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Auth & Users │  │ Posts & DMs  │  │ Visual Rules │  │ AI Provider │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Background Scheduler Engine                    │  │
│  │     (Flexible Cron, Queue Ordering, Retries, Exponential Backoff) │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │               Social Media Connector Registry (Plugins)           │  │
│  │ Facebook  Instagram  X/Twitter  LinkedIn  YouTube  TikTok        │  │
│  │ Telegram  WhatsApp   Reddit     Pinterest Threads                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────┐                           ┌──────────────────────┐
│  Relational Storage  │                           │    Media Storage     │
│ PostgreSQL / SQLite  │                           │   (SHA-256 Dedupe)   │
│ (Encrypted at Rest)  │                           │                      │
└──────────────────────┘                           └──────────────────────┘
```

## Architectural Highlights
1. **Connector Plugin Pattern**:
   The application never directly couples core business logic to external social platform quirks. Every platform inherits from `SocialConnector` and publishes its official capabilities (`ConnectorCapabilities`). New platforms are plugged in with zero rewrites to existing models.

2. **Official API & Policy Adherence**:
   - Zero unauthorized scraping or unofficial private APIs.
   - Strictly enforces platform limitations (e.g., text-only posts on Instagram/Pinterest/YouTube raise explicit `UnsupportedFeatureError`).
   - Clearly notifies users whenever a feature is restricted by platform policy.

3. **Multi-Channel Publishing & Content Queue**:
   - Immediate publishing across multiple channels simultaneously.
   - Idempotency key tracking to guarantee accidental duplicate posts never execute.
   - Flexible scheduling: one-time, daily, twice-daily, weekly, monthly, custom interval, or custom cron expressions.
   - Automated Content Queue with drag-and-drop reordering, pausing, and skipping.

4. **Intelligent Inbound Workflow & Anti-Spam Guardrails**:
   - Unified Inbox for Direct Messages and Public Comments.
   - Business hours check (`is_within_business_hours()`) for automated off-hours replies.
   - Anti-spam safeguard counters (`check_rate_limit()`): Maximum messages per hour, post-per-day ceilings, and cooldown timers.
   - Loop-prevention to halt bot-to-bot recursion.

5. **AI Content Studio & Assistance**:
   - 1 Idea → Multi-Platform copy generation (Facebook, Instagram, LinkedIn, X, Telegram).
   - Content repurposing (Article/Transcript → Social snippets + Quotes + Summaries).
   - Modes: `APPROVAL_REQUIRED` (default human-in-the-loop), `SUGGEST_ONLY`, `AUTO_SEND`, and `OFF`.
   - Security sanitizer to neutralize shell command injections or escape sequences.

6. **Emergency Controls**:
   - Prominent Master Switch: `PAUSE ALL`, `RESUME ALL`, and `STOP ALL AUTOMATIONS` across both UI and API.
