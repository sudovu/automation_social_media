# Platform Integrations & API Limitations Guide

Social Automation Hub strictly adheres to official social platform developer policies. We never use unofficial scraping or bot harnesses that violate platform terms of service.

Below is the definitive capability matrix and configuration guide for each supported platform.

---

## 1. Facebook (Meta Graph API)
- **Supported Features**: Page feed posting, images, video uploads, carousel, comment reading and replies, Page Messenger inbox conversations, Page Insights.
- **Unsupported by API**: Feed polls (deprecated on Pages API).
- **Required Permissions**: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `pages_messaging`, `read_insights`.
- **Auth Type**: OAuth 2.0 User & Page Access Tokens.

---

## 2. Instagram (Instagram Graph API)
- **Account Requirement**: Instagram Professional (Business or Creator) connected to a Facebook Page.
- **Supported Features**: Photos, Reels/Video, Carousels, Comments management, Instagram Direct Messaging (via Messenger API for Instagram), Insights.
- **Unsupported by API**: Text-only feed posts (Instagram requires an image or video asset for all published feed media).
- **Required Permissions**: `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`, `instagram_manage_insights`.

---

## 3. X / Twitter (X API v2)
- **Supported Features**: Text tweets (280 characters), Native Polls (2 to 4 options), Image & Video attachments, Mentions stream, Direct Messages v2, Tweet public metrics.
- **Unsupported by API**: Carousels (multiple images up to 4 are supported instead).
- **Required Permissions**: `tweet.read`, `tweet.write`, `users.read`, `dm.read`, `dm.write`.
- **Auth Type**: OAuth 2.0 Authorization Code with PKCE.

---

## 4. LinkedIn (LinkedIn Community Management & Share API)
- **Supported Features**: Organization and member posts, Single/multi-image posts, Document/PDF carousels, Article links, Video uploads, Post comments, Page analytics.
- **Unsupported by API**: 1-on-1 Direct Messaging is restricted by LinkedIn Partner access policy.
- **Required Permissions**: `openid`, `profile`, `w_member_social`, `r_organization_social`, `w_organization_social`.

---

## 5. YouTube (YouTube Data API v3 & Analytics)
- **Supported Features**: Video publishing (metadata, tags, privacy), Community comment thread replies, Channel analytics.
- **Unsupported by API**: Direct Messaging (YouTube does not provide a direct messaging API); Text-only posts on video timeline.
- **Required Permissions**: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.force-ssl`.

---

## 6. TikTok (TikTok Content Posting API & Display API)
- **Supported Features**: Direct video upload and publishing, video engagement metrics, comment management.
- **Unsupported by API**: Direct messaging (not available for third-party developer integrations).
- **Required Permissions**: `user.info.basic`, `video.publish`, `video.upload`, `video.list`.

---

## 7. Telegram (Telegram Bot API)
- **Supported Features**: Channel broadcasts, Group and Direct Bot messages, Native Polls, Photos, Videos, Voice notes, Webhook updates.
- **Auth Type**: Bot Token (from `@BotFather`).
- **Required Permissions**: Bot must be an administrator in the target broadcast channel.

---

## 8. WhatsApp Business (WhatsApp Cloud API / Meta)
- **Supported Features**: 1-on-1 Customer service conversations, Pre-approved Message Templates, Quick-reply buttons, Inbound webhook webhooks.
- **Unsupported by API**: Public wall or social timeline posting (WhatsApp is a messaging platform, not a social feed).
- **Required Permissions**: `whatsapp_business_messaging`, `whatsapp_business_management`.

---

## 9. Reddit (Reddit API & OAuth2)
- **Supported Features**: Subreddit text submissions, Link posts, Image posts, Subreddit Polls, Comment reading and replies, Direct Private Messages (PMs), Karma analytics.
- **Required Permissions**: `submit`, `read`, `privatemessages`, `identity`.

---

## 10. Pinterest (Pinterest API v5)
- **Supported Features**: Pin creation with image/video assets, Pin boards listing, Pin analytics (saves, impressions, outbound clicks).
- **Unsupported by API**: Text-only pins; 1-on-1 direct messaging.
- **Required Permissions**: `boards:read`, `pins:read`, `pins:write`, `user_accounts:read`.

---

## 11. Threads (Threads API by Meta)
- **Supported Features**: Text posts (up to 500 characters), Image and Video posts, Link attachments, Reply management on own threads, Post metrics.
- **Unsupported by API**: Direct messaging; Interactive polls.
- **Required Permissions**: `threads_basic`, `threads_content_publish`, `threads_read_replies`, `threads_manage_replies`.
