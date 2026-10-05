import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Bot, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
  Flame,
  Radio,
  Sliders,
  AlertTriangle
} from 'lucide-react';

interface PlatformGuide {
  id: string;
  name: string;
  color: string;
  badge: string;
  authType: string;
  permissions: string[];
  supportedAutomation: string[];
  unsupportedNotice: string;
  stepByStep: string[];
  webhookEvent: string;
  samplePayload: string;
}

export const DevelopmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'automation-guide' | 'cloud-deployment' | 'api-architecture' | 'safeguards'>('automation-guide');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const platformGuides: Record<string, PlatformGuide> = {
    facebook: {
      id: 'facebook',
      name: 'Facebook Pages',
      color: '#1877F2',
      badge: 'Meta Graph API v19.0',
      authType: 'OAuth 2.0 (Page Access Token)',
      permissions: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'pages_messaging', 'read_insights'],
      supportedAutomation: [
        'Automated feed publishing (text, single/multi image, video, link, carousel)',
        'Server-side scheduled publishing via scheduled_publish_time',
        'Direct Message auto-replies (within Meta 24-hr messaging window)',
        'Comment auto-moderation & instant replies',
        'Hourly background telemetry & Page insights sync'
      ],
      unsupportedNotice: 'Personal profiles and feed polls are strictly deprecated/unsupported by Meta official API. Only Pages are supported.',
      stepByStep: [
        '1. Go to developers.facebook.com and create a Business App with "Facebook Login for Business".',
        '2. Add permissions: pages_show_list, pages_manage_posts, pages_read_engagement, pages_messaging, read_insights.',
        '3. In Graph API Explorer, select your Page and generate a Never-Expiring Page Access Token.',
        '4. In Social Automation Hub -> Accounts, click "Connect Account" and input the Page ID and Token.',
        '5. Set up an Automation Rule: Trigger = "new_comment" or "new_message", Action = "ai_reply".'
      ],
      webhookEvent: 'feed, mention, conversations, messages',
      samplePayload: `POST /api/v1/posts
{
  "title": "Weekly Product Update",
  "content": "Discover what is new in Social Automation Hub this week! 🚀",
  "post_type": "IMAGE",
  "platforms": ["facebook"],
  "status": "scheduled",
  "scheduled_for": "2026-10-10T14:00:00Z"
}`
    },
    instagram: {
      id: 'instagram',
      name: 'Instagram Professional',
      color: '#E4405F',
      badge: 'Instagram Graph API',
      authType: 'Facebook Page Linked OAuth',
      permissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments', 'instagram_manage_messages', 'instagram_manage_insights'],
      supportedAutomation: [
        'Automated Feed Photos, Carousel containers, and Reels video publishing',
        'Automated comment replies and sentiment-based moderation',
        'Instagram Direct Messaging automated replies via Messenger API',
        'Story engagement & Reel performance tracking'
      ],
      unsupportedNotice: 'Text-only posts are unsupported by Instagram API. An image or video asset is mandatory for every published post.',
      stepByStep: [
        '1. Convert your Instagram account to a Professional (Business/Creator) account.',
        '2. Link the Instagram account to a Facebook Page in Meta Business Suite.',
        '3. In developers.facebook.com, request "instagram_content_publish" and "instagram_manage_comments".',
        '4. Connect via Social Automation Hub Accounts screen using the linked Page token.',
        '5. Create an automated Carousel or Reel scheduled post in Posts & Queue.'
      ],
      webhookEvent: 'comments, mentions, messages',
      samplePayload: `POST /api/v1/posts
{
  "content": "Summer vibes with our new creator lineup! 📸 #creators #lifestyle",
  "post_type": "CAROUSEL",
  "platforms": ["instagram"],
  "media_urls": ["https://cdn.example.com/img1.jpg", "https://cdn.example.com/img2.jpg"]
}`
    },
    twitter: {
      id: 'twitter',
      name: 'X / Twitter',
      color: '#000000',
      badge: 'X API v2',
      authType: 'OAuth 2.0 Authorization Code with PKCE',
      permissions: ['tweet.read', 'tweet.write', 'users.read', 'dm.read', 'dm.write'],
      supportedAutomation: [
        'Automated single tweets and thread publication',
        'Native 4-option Polls with duration tracking',
        'Mention monitoring stream with automated keyword triage',
        'Direct Message automated routing and customer support replies',
        'Public impressions, retweets, and quote-tweet metric polling'
      ],
      unsupportedNotice: 'Instagram-style carousels are not supported. Up to 4 image attachments are supported per Tweet.',
      stepByStep: [
        '1. Create a Project and App in developer.x.com with Free, Basic, or Pro tier.',
        '2. Configure User Authentication Settings: OAuth 2.0, Web App, with PKCE.',
        '3. Add Callback URL: http://localhost:8000/api/v1/auth/callback/twitter.',
        '4. Save Client ID and Client Secret in Hub Settings -> Accounts.',
        '5. Set up an Automation Rule: Trigger = "new_mention" with keyword filter "#help" -> AI Reply.'
      ],
      webhookEvent: 'tweet_create_events, direct_message_events',
      samplePayload: `POST /api/v1/posts
{
  "content": "What is your favorite automation feature in Social Automation Hub?",
  "post_type": "POLL",
  "platforms": ["twitter"],
  "poll_options": ["AI Post Composer", "Unified Inbox", "Smart Calendar", "Webhook Rules"]
}`
    },
    linkedin: {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0A66C2',
      badge: 'Community Management API v2',
      authType: 'OAuth 2.0 (w_member_social & w_organization_social)',
      permissions: ['openid', 'profile', 'w_member_social', 'r_organization_social', 'w_organization_social'],
      supportedAutomation: [
        'Company Page and Personal Profile professional updates',
        'Document / PDF slide carousels and rich link previews',
        'Multi-image attachments and high-resolution video uploads',
        'Page comment tracking and automated first-comment engagement',
        'Company page followers, clicks, and engagement telemetry'
      ],
      unsupportedNotice: 'Member-to-member 1-on-1 Direct Messaging is restricted by LinkedIn Partner access policy.',
      stepByStep: [
        '1. Create an App in linkedin.com/developers and request the "Share on LinkedIn" product.',
        '2. For Company Pages, verify ownership of the Organization.',
        '3. Configure OAuth 2.0 Redirect URL and exchange token in Hub Accounts.',
        '4. Schedule automated B2B articles using the Hub AI Assistant with tone = "PROFESSIONAL".'
      ],
      webhookEvent: 'organization_share_events',
      samplePayload: `POST /api/v1/posts
{
  "content": "Excited to share our insights on scaling distributed social automation backends with Python & FastAPI. Read the full case study below:",
  "link_url": "https://example.com/blog/scaling-social-backends",
  "platforms": ["linkedin"]
}`
    },
    telegram: {
      id: 'telegram',
      name: 'Telegram Channels & Bots',
      color: '#229ED9',
      badge: 'Telegram Bot API',
      authType: 'Bot Token (via @BotFather)',
      permissions: ['Administrator in target Channel / Group'],
      supportedAutomation: [
        'Instant multi-channel broadcasts with Markdown/HTML formatting',
        'Native interactive Polls with anonymous or regular voting',
        'Direct customer bot conversations with automated NLP responses',
        'High-capacity photo, audio, and video distribution'
      ],
      unsupportedNotice: 'Telegram bots can only post to channels where they have been explicitly added as Administrator with "Post Messages" permission.',
      stepByStep: [
        '1. Open Telegram, chat with @BotFather, and run /newbot to create your bot.',
        '2. Copy the HTTP API Bot Token provided by @BotFather.',
        '3. Create a public or private Telegram Channel, then add your bot as an Administrator.',
        '4. In Social Automation Hub -> Accounts, select Telegram and enter your Bot Token and Channel Username (e.g., @mychannel).',
        '5. Test automated instant broadcast via Posts & Queue.'
      ],
      webhookEvent: 'message, channel_post, callback_query',
      samplePayload: `POST /api/v1/posts
{
  "content": "🚨 *Breaking Announcement*\\n\\nVersion 2.0 of our platform is now live! Check your dashboard.",
  "post_type": "TEXT",
  "platforms": ["telegram"]
}`
    },
    whatsapp: {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      color: '#25D366',
      badge: 'WhatsApp Cloud API',
      authType: 'System User Permanent Access Token',
      permissions: ['whatsapp_business_messaging', 'whatsapp_business_management'],
      supportedAutomation: [
        'Automated 24/7 customer service replies within customer care window',
        'Pre-approved utility and marketing template message notifications',
        'Unified Inbox live agent escalations with audit logs',
        'Away / offline instant responder during non-business hours'
      ],
      unsupportedNotice: 'Public broadcast feed posts do not exist on WhatsApp. Only conversational messaging and template notifications are supported.',
      stepByStep: [
        '1. Set up a Meta Business Account and create a WhatsApp Business Platform App.',
        '2. Add a registered phone number and generate a System User Access Token.',
        '3. Copy your Phone Number ID and Token into Social Automation Hub Accounts.',
        '4. Set up an Automation Rule: Trigger = "new_message", Action = "away_reply" for off-hours.'
      ],
      webhookEvent: 'messages, message_deliveries',
      samplePayload: `POST /api/v1/inbox/conversations/{id}/messages
{
  "content": "Thank you for reaching out! Our team is currently offline, but we will respond first thing at 9:00 AM."
}`
    },
    youtube: {
      id: 'youtube',
      name: 'YouTube',
      color: '#FF0000',
      badge: 'YouTube Data API v3',
      authType: 'Google OAuth 2.0',
      permissions: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.force-ssl'],
      supportedAutomation: [
        'Automated video upload with scheduled release times and custom thumbnails',
        'Community video comment thread replies and moderation',
        'Channel view, subscriber count, and watch-time telemetry collection'
      ],
      unsupportedNotice: 'Direct 1-on-1 private messaging is not available on YouTube API. Only video publishing and public comments are supported.',
      stepByStep: [
        '1. Create a Google Cloud Project and enable "YouTube Data API v3".',
        '2. Configure OAuth 2.0 Credentials with redirect URI.',
        '3. Authorize channel access and store tokens in Hub Accounts.',
        '4. Queue scheduled video releases via Posts & Queue.'
      ],
      webhookEvent: 'push_subscriptions (PubSubHubbub)',
      samplePayload: `POST /api/v1/posts
{
  "title": "Social Media Automation Masterclass 2026",
  "content": "Full walkthrough of multi-platform scheduling and AI triggers.",
  "post_type": "VIDEO",
  "platforms": ["youtube"],
  "media_urls": ["https://storage.googleapis.com/bucket/video.mp4"]
}`
    },
    tiktok: {
      id: 'tiktok',
      name: 'TikTok',
      color: '#00F2FE',
      badge: 'Content Posting API v2',
      authType: 'TikTok for Developers OAuth 2.0',
      permissions: ['user.info.basic', 'video.publish', 'video.upload', 'video.list'],
      supportedAutomation: [
        'Direct short video upload & publishing to TikTok creators and brands',
        'Scheduled TikTok video releases',
        'Video view, comment, and like engagement metrics collection'
      ],
      unsupportedNotice: 'Direct messaging and text-only feed posts are not supported by the official TikTok Content Posting API.',
      stepByStep: [
        '1. Register a TikTok Developer App at developers.tiktok.com.',
        '2. Apply for "Content Posting API" and "Direct Video Post" permissions.',
        '3. Authenticate creator account in Social Automation Hub.',
        '4. Upload short video MP4 asset in Media Library and schedule publication.'
      ],
      webhookEvent: 'video_status_change',
      samplePayload: `POST /api/v1/posts
{
  "title": "Behind the scenes at the tech studio #automation #tech #coding",
  "post_type": "VIDEO",
  "platforms": ["tiktok"],
  "media_urls": ["https://storage.googleapis.com/bucket/tiktok_short.mp4"]
}`
    },
    reddit: {
      id: 'reddit',
      name: 'Reddit',
      color: '#FF4500',
      badge: 'Reddit OAuth API',
      authType: 'Script App / Web App OAuth',
      permissions: ['submit', 'read', 'identity'],
      supportedAutomation: [
        'Automated text, link, and image submissions to target subreddits',
        'Subreddit flair tagging and title formatting',
        'Comment replies and community interaction tracking'
      ],
      unsupportedNotice: 'Mass automated direct messaging is prohibited by Reddit API terms to prevent spam. Hub respects cooldowns.',
      stepByStep: [
        '1. In reddit.com/prefs/apps, click "create another app" and select "script" or "web app".',
        '2. Copy Client ID and Client Secret.',
        '3. Enter credentials in Hub Accounts with target default subreddit (e.g. r/technology).',
        '4. Use AI Post Composer to generate community-tailored discussion starters.'
      ],
      webhookEvent: 'subreddit_rss_polling',
      samplePayload: `POST /api/v1/posts
{
  "title": "How we automated our multi-channel social workflow without breaking platform policies",
  "content": "Sharing our architectural blueprint using FastAPI, React, and modular connectors...",
  "platforms": ["reddit"]
}`
    },
    pinterest: {
      id: 'pinterest',
      name: 'Pinterest',
      color: '#E60023',
      badge: 'Pinterest API v5',
      authType: 'OAuth 2.0 with Scopes',
      permissions: ['boards:read', 'pins:read', 'pins:write'],
      supportedAutomation: [
        'Automated Pin creation with rich destination URLs and board assignments',
        'High-resolution visual content scheduling',
        'Pin impressions, saves, and outbound click analytics'
      ],
      unsupportedNotice: 'Pinterest does not support Direct Messaging or comment automation on third-party APIs.',
      stepByStep: [
        '1. Create a Pinterest Business Account at business.pinterest.com.',
        '2. Register an App on developers.pinterest.com and configure Redirect URI.',
        '3. Select the target Board ID in Hub Accounts.',
        '4. Schedule product visuals and infographics in the Hub Content Calendar.'
      ],
      webhookEvent: 'pin_engagement_event',
      samplePayload: `POST /api/v1/posts
{
  "title": "10 Minimalist Workspace Ideas for Software Engineers",
  "content": "Discover how ergonomic setups boost focus and productivity.",
  "link_url": "https://example.com/workspace-guide",
  "platforms": ["pinterest"],
  "media_urls": ["https://cdn.example.com/workspace.jpg"]
}`
    },
    threads: {
      id: 'threads',
      name: 'Meta Threads',
      color: '#101010',
      badge: 'Threads Graph API',
      authType: 'Threads API OAuth 2.0',
      permissions: ['threads_basic', 'threads_content_publish', 'threads_manage_insights'],
      supportedAutomation: [
        'Conversational text posts (up to 500 characters) and multi-image posts',
        'Scheduled Thread publishing via two-step container processing',
        'Thread engagement analytics (views, likes, replies, quotes)'
      ],
      unsupportedNotice: 'Direct 1-on-1 private messaging is not available on Threads API.',
      stepByStep: [
        '1. Set up a Meta App with the "Threads" use case in developers.facebook.com.',
        '2. Authenticate your Threads account.',
        '3. Create and schedule threads using the Post Composer.',
        '4. Track viral thread reach in the Hub Analytics screen.'
      ],
      webhookEvent: 'threads_reply_event',
      samplePayload: `POST /api/v1/posts
{
  "content": "Hot take: The best social media strategy is consistency and respecting your users' time. What do you think?",
  "platforms": ["threads"]
}`
    }
  };

  const curr = platformGuides[selectedPlatform] || platformGuides.facebook;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5" />
              <span>DEVELOPMENT & AUTOMATION MASTER GUIDE</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Developer Center & Automation Engine
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Step-by-step developer blueprints for automated social media handling across all 11 supported platforms. 
              Built on official APIs, strict rate limits, anti-loop safeguards, and cloud hosting.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/sudovu/automation_social_media"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-all shadow-md"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href="https://sudovu.github.io/automation_social_media/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mt-8 border-b border-slate-800/80 overflow-x-auto pb-px">
          {[
            { id: 'automation-guide', label: '11 Platform Guides', icon: BookOpen },
            { id: 'cloud-deployment', label: 'Cloud Deployment', icon: Globe },
            { id: 'api-architecture', label: 'API Architecture', icon: Cpu },
            { id: 'safeguards', label: 'Safety & Anti-Spam Rules', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-sky-500 text-sky-400 bg-slate-800/50'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: 11 PLATFORM AUTOMATION GUIDES */}
      {activeTab === 'automation-guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Platform Selector Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Select Platform</h2>
            <div className="space-y-1">
              {Object.keys(platformGuides).map((pKey) => {
                const p = platformGuides[pKey];
                const isSelected = selectedPlatform === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => setSelectedPlatform(pKey)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: p.color }} 
                      />
                      <span>{p.name}</span>
                    </div>
                    {isSelected && <ArrowRight className="w-4 h-4 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Detail Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Header Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
                    style={{ backgroundColor: curr.color }}
                  >
                    {curr.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <span>{curr.name}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                        {curr.badge}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Auth Protocol: <span className="text-slate-300 font-mono">{curr.authType}</span></p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Connector Active</span>
                  </span>
                </div>
              </div>

              {/* Supported Automation vs Unsupported */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Supported Automations</span>
                  </h3>
                  <ul className="space-y-2">
                    {curr.supportedAutomation.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Platform API Boundary</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                    {curr.unsupportedNotice}
                  </p>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Required OAuth Scopes:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {curr.permissions.map((p, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step by Step Execution Instructions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Step-by-Step Integration & Automation Walkthrough</span>
                </h3>
                <div className="space-y-2">
                  {curr.stepByStep.map((step, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-300 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample API Dispatch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Automated API Dispatch Payload</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(curr.samplePayload, 'payload')}
                    className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors"
                  >
                    {copiedId === 'payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'payload' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-sky-300 overflow-x-auto leading-relaxed">
                  {curr.samplePayload}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLOUD DEPLOYMENT BLUEPRINTS */}
      {activeTab === 'cloud-deployment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">GitHub Pages (Frontend)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated continuous deployment workflow pushes the production dashboard to GitHub Pages.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-purple-300">
              URL: https://sudovu.github.io/automation_social_media/
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
              <li>Pushed directly to GitHub Actions.</li>
              <li>Visible in the <strong>Deployments</strong> tab on GitHub.</li>
              <li>Runs entirely in the cloud with 100% uptime.</li>
            </ol>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Render 1-Click Cloud Blueprint</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uses the committed <code className="text-sky-300">render.yaml</code> to spin up FastAPI, PostgreSQL, and Background Worker.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-sky-300">
              dashboard.render.com &rarr; Blueprints &rarr; Connect Repo
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
              <li>Zero local computer needed.</li>
              <li>Runs cron schedules and token refreshes 24/7.</li>
              <li>Free-tier friendly out of the box.</li>
            </ol>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">GitHub Codespaces (Browser IDE)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configured via <code className="text-indigo-300">.devcontainer/devcontainer.json</code> for instant 1-click cloud workstation.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300">
              Code &rarr; Codespaces &rarr; Create codespace
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
              <li>Pre-installs Python 3.11 and Node.js.</li>
              <li>Auto-forwards API port 8000 and UI port 3000.</li>
              <li>Develop and debug from any device or tablet.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: API ARCHITECTURE */}
      {activeTab === 'api-architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Modular Connector Engine Architecture</h3>
              <p className="text-xs text-slate-400 mt-1">
                How connectors, workers, automation rules, and the AI studio communicate.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
              58 REST Endpoints / 11 Connectors
            </span>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4">
            <div className="text-sky-400 font-bold">┌─── INCOMING PLATFORM WEBHOOK / POLLER</div>
            <div className="pl-6 border-l-2 border-slate-800 space-y-2">
              <div>▼ <strong>Webhook Dispatcher</strong> &rarr; <code className="text-indigo-400">/api/v1/webhooks/&#123;platform&#125;</code> (Signature verified)</div>
              <div>▼ <strong>Conversation / Comment Ingest</strong> &rarr; Deduplication check against SHA-256 hash</div>
              <div>▼ <strong>Automation Rule Evaluator</strong> &rarr; WHEN-IF-THEN condition matching</div>
              <div>▼ <strong>Safeguard & Anti-Spam Check</strong> &rarr; Rate limit window, Cooldown buffer, Bot loop check</div>
              <div>▼ <strong>AI Reasoning & Studio</strong> &rarr; Gemini 1.5 Pro / Heuristic Mock NLP response generation</div>
              <div>▼ <strong>Connector Action Dispatch</strong> &rarr; <code className="text-emerald-400">SocialConnector.reply_to_comment()</code></div>
            </div>
            <div className="text-emerald-400 font-bold">└─── AUDIT LOG & HISTORICAL TELEMETRY RECORDED</div>
          </div>
        </div>
      )}

      {/* TAB 4: SAFETY & SAFEGUARDS */}
      {activeTab === 'safeguards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Anti-Spam & Loop Prevention</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Bot Loop Detection:</strong> Flags consecutive automated replies without incoming user responses to eliminate infinite bot-to-bot conversational loops.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Channel Cooldown Buffers:</strong> Enforces minimum 3-minute delays between automated replies to the same user or comment thread.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Platform API Rate Limiters:</strong> Tracks 200 calls/hr windows and backs off before hitting HTTP 429 penalties.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Emergency Killswitch</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In the event of unexpected platform API changes or incident response, the global killswitch halts all operations immediately:
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-rose-400">POST /api/v1/emergency/pause-all</div>
              <div className="text-slate-400">&rarr; Background worker freezes post processing</div>
              <div className="text-slate-400">&rarr; Auto-replies and webhook handlers switch to standby</div>
              <div className="text-emerald-400">POST /api/v1/emergency/resume-all</div>
              <div className="text-slate-400">&rarr; Resumes scheduled queue when cleared</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
