import React from 'react';
import { 
  Send, 
  Clock, 
  MessageSquare, 
  MessageCircle, 
  Users, 
  Eye, 
  Activity, 
  AlertTriangle,
  Plus,
  Share2,
  Calendar,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  onNavigate: (tab: string) => void;
  onOpenCreatePost: () => void;
  onOpenConnectAccount: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onNavigate,
  onOpenCreatePost,
  onOpenConnectAccount
}) => {
  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Loading dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  const { kpis, accounts, next_scheduled_posts, recent_errors } = stats;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Social Command Center</h2>
          <p className="text-sm text-slate-400">
            Real-time multi-platform monitoring, scheduling, and autonomous workflow engine.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenConnectAccount}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>Connect Account</span>
          </button>
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* KPI Statistic Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Posts</span>
            <Send className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.todays_posts}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Published across channels</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Posts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.scheduled_posts}</div>
          <span className="text-[11px] text-slate-400 font-medium">In automated queue</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Messages / Inquiries</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.unread_messages}</div>
          <span className="text-[11px] text-sky-400 font-medium">Unified Inbox pending</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reach</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.total_reach.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 font-medium">+14.2% this week</span>
        </div>
      </div>

      {/* Connected Accounts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white">Connected Social Accounts</h3>
          </div>
          <button
            onClick={() => onNavigate('accounts')}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
          >
            <span>Manage All Channels</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div 
              key={acc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {acc.avatar_url ? (
                    <img src={acc.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold uppercase text-sm border border-slate-700">
                      {acc.platform.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white capitalize">{acc.account_name}</h4>
                    <span className="text-xs text-slate-400 capitalize">{acc.platform}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Connected</span>
                </div>
              </div>

              {/* Account Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-950/60 rounded-lg text-center border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Followers</div>
                  <div className="text-xs font-bold text-white">{acc.followers.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Eng. Rate</div>
                  <div className="text-xs font-bold text-sky-400">{acc.engagement_rate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Token</div>
                  <div className="text-xs font-bold text-emerald-400">{acc.token_status}</div>
                </div>
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Pending msgs: <strong className="text-slate-200">{acc.pending_messages}</strong></span>
                <span>Scheduled: <strong className="text-slate-200">{acc.scheduled_posts}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Next Scheduled Posts & Error Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Scheduled Posts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Next Scheduled Posts</h3>
            </div>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Open Calendar
            </button>
          </div>

          <div className="space-y-2.5">
            {next_scheduled_posts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-lg border border-slate-800">
                No scheduled posts in queue. Click "Create Post" to schedule one.
              </div>
            ) : (
              next_scheduled_posts.map((post) => (
                <div key={post.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">{post.title}</p>
                    <div className="flex items-center space-x-2">
                      {post.platforms.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-amber-400 font-medium block">
                      {new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(post.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Errors & Safeguard Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Alerts & Safeguards</h3>
            </div>
            <button 
              onClick={() => onNavigate('automations')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              View Automation Runs
            </button>
          </div>

          <div className="space-y-2.5">
            {recent_errors.length === 0 ? (
              <div className="p-6 text-center text-emerald-400 text-xs bg-slate-950/40 rounded-lg border border-slate-800 flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>All systems healthy. No failed automations in the last 24 hours.</span>
              </div>
            ) : (
              recent_errors.map((err) => (
                <div key={err.id} className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-300">{err.rule_name || 'Automation Step'}</span>
                    <span className="text-[10px] text-red-400 uppercase font-mono">{err.platform}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{err.error_message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
