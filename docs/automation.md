# Visual Automation & Rules Engine

## Mental Model: WHEN → IF → THEN

Social Automation Hub provides a clean, non-technical visual automation builder built on event-driven rules:

```
[ EVENT / TRIGGER ] ───▶ [ FILTER / CONDITIONS ] ───▶ [ ACTIONS / LOGS ]
  New incoming message      Contains "pricing"          Send instant pricing guide
  Outside business hours    Is weekend or >18:00        Send offline away responder
  New negative comment      Negative sentiment          Flag & alert customer support
```

---

## Supported Triggers (WHEN)
1. `new_message`: Incoming direct message on any connected channel.
2. `keyword_detected`: Inbound text matches specific trigger terms.
3. `business_hours_offline`: Inbound message received outside operating hours.
4. `new_comment`: Public comment left on any monitored post.
5. `scheduled_time`: Timed cron trigger for recurring posts.

---

## Condition Filters (IF)
- **Keyword matching modes**:
  - `contains`: Case-insensitive substring match.
  - `exact`: Exact text match.
  - `starts_with`: Message begins with keyword.
  - `regex`: Standard regular expression.
- **Platform filter**: Target specific platform or run across all connected channels.
- **Business hours condition**: Matches only when server time falls outside `BUSINESS_HOURS_START` and `BUSINESS_HOURS_END`.

---

## Actions (THEN)
- `send_reply`: Dispatches predefined response immediately.
- `offline_reply`: Sends polite business hours message and logs ticket.
- `ai_reply`: Generates contextual AI response according to configured mode (`APPROVAL_REQUIRED` creates notification for review).
- `send_notification`: Emits a high-priority in-app alert.

---

## Safeguards & Anti-Spam Protections
- **Rate Limit Window**: Enforces `MAX_MESSAGES_PER_HOUR` per account.
- **Bot Loop Blocker**: Automatically prevents automated replies to bot accounts or repeated identical incoming messages.
- **Master Killswitch**: Immediate `PAUSE ALL` / `STOP ALL AUTOMATIONS` freezes every queue and automated action instantly.
