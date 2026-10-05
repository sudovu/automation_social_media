import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MessageCircle, 
  Share2, 
  MousePointerClick,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../api/client';

export const AnalyticsPage: React.FC = () => {
  const [channelData, setChannelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/analytics/channel-performance')
      .then(setChannelData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalFollowers = channelData.reduce((acc, c) => acc + (c.followers || 0), 0);
  const totalReach = channelData.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalEngagement = channelData.reduce((acc, c) => acc + (c.engagement || 0), 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Cross-Platform Analytics</h2>
        <p className="text-sm text-slate-400">
          Aggregated performance telemetry, reach breakdown, and channel-by-channel metrics.
        </p>
      </div>

      {/* Aggregate KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Followers Across Networks</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-white">{totalFollowers.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">+8.5% audience expansion</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Monthly Impressions & Reach</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{totalReach.toLocaleString()}</div>
          <p className="text-[11px] text-sky-400 mt-1 font-medium">99.8% delivery reliability</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Aggregated Interactions</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{totalEngagement.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Likes, comments & shares</p>
        </div>
      </div>

      {/* Channel Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Channel Performance Breakdown</h3>
          <span className="text-xs text-slate-400">Live API Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Followers</th>
                <th className="py-3 px-4">Impressions</th>
                <th className="py-3 px-4">Reach</th>
                <th className="py-3 px-4">Engagement Rate</th>
                <th className="py-3 px-4">Likes</th>
                <th className="py-3 px-4">Comments</th>
                <th className="py-3 px-4">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {channelData.map((c) => (
                <tr key={c.platform} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3.5 px-4 font-bold capitalize text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span>{c.platform}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">{(c.followers || 0).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono">{(c.impressions || 0).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono">{(c.reach || 0).toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20">
                      {c.engagement_rate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{(c.likes || 0).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono">{(c.comments || 0).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono">{(c.clicks || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
