export interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  status: string;
  timezone: string;
  connected_at: string;
  last_sync?: string;
  metadata: {
    avatar_url?: string;
    followers_count?: number;
    display_name?: string;
  };
}

export interface PlatformCapability {
  platform: string;
  display_name: string;
  color: string;
  category: string;
  auth_type: string;
  capabilities: {
    publishing: boolean;
    scheduled_publishing: boolean;
    messaging: boolean;
    comments: boolean;
    mentions: boolean;
    analytics: boolean;
    media_upload: boolean;
    polls: boolean;
    carousels: boolean;
    supported_post_types: string[];
  };
  unsupported_features: string[];
  required_permissions: string[];
  rate_limits: Record<string, any>;
}

export interface PostVariant {
  id: string;
  platform: string;
  adapted_content: string;
  status: string;
  external_post_id?: string;
  error_message?: string;
  published_at?: string;
}

export interface Post {
  id: string;
  title?: string;
  content: string;
  post_type: string;
  platforms: string[];
  media_urls: string[];
  poll_options: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'pending_approval';
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  variants: PostVariant[];
}

export interface QueueItem {
  id: string;
  post_id: string;
  queue_order: number;
  status: string;
  scheduled_slot?: string;
  published_at?: string;
  post?: Post;
}

export interface RecurringSchedule {
  id: string;
  title: string;
  content_template: string;
  post_type: string;
  platforms: string[];
  schedule_type: string;
  cron_expression?: string;
  days_of_week: string[];
  times_of_day: string[];
  timezone: string;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  account_id: string;
  platform: string;
  participant_id: string;
  participant_name: string;
  status: 'unread' | 'read' | 'waiting' | 'replied' | 'escalated' | 'closed';
  last_message_at: string;
  summary?: string;
  customer_wants?: string;
  customer_asked?: string;
  suggested_action?: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  account_id: string;
  platform: string;
  sender_id: string;
  sender_name: string;
  direction: 'incoming' | 'outgoing';
  content: string;
  status: string;
  is_auto_reply?: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  account_id: string;
  platform: string;
  post_id?: string;
  author_name: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'pending' | 'replied' | 'hidden' | 'flagged';
  reply_content?: string;
  replied_at?: string;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  conditions: any[];
  actions: any[];
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
}

export interface DashboardStats {
  kpis: {
    todays_posts: number;
    scheduled_posts: number;
    unread_messages: number;
    pending_comments: number;
    total_followers: number;
    total_reach: number;
    total_engagement: number;
    failed_automations: number;
  };
  accounts: Array<{
    id: string;
    platform: string;
    account_name: string;
    account_id: string;
    status: string;
    token_status: string;
    last_sync?: string;
    followers: number;
    pending_messages: number;
    pending_comments: number;
    scheduled_posts: number;
    failed_posts: number;
    engagement_rate: string;
    avatar_url?: string;
  }>;
  next_scheduled_posts: Array<{
    id: string;
    title: string;
    platforms: string[];
    scheduled_at: string;
  }>;
  recent_errors: Array<{
    id: string;
    rule_name: string;
    platform: string;
    error_message: string;
    executed_at: string;
  }>;
}

export interface ReportItem {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  title: string;
  summary: string;
  top_post: any;
  metrics: Record<string, any>;
  ai_insights?: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  platform: string;
  content: string;
  hashtags: string[];
  cta?: string;
  variables: string[];
  created_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  folder: string;
  tags: string[];
  created_at: string;
}
