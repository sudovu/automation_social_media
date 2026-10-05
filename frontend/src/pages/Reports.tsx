import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  Award, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { ReportItem } from '../types';
import { apiRequest } from '../api/client';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activeType, setActiveType] = useState<string>('all');

  useEffect(() => {
    apiRequest<ReportItem[]>('/reports').then(setReports).catch(console.error);
  }, []);

  const filtered = activeType === 'all' ? reports : reports.filter(r => r.report_type === activeType);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Automated Executive Briefings</h2>
          <p className="text-sm text-slate-400">
            Daily, weekly, and monthly performance synthesis with AI strategic recommendations.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold">
          {['all', 'daily', 'weekly', 'monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                activeType === t ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-6">
        {filtered.map((report) => (
          <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2 inline-block">
                  {report.report_type} Briefing
                </span>
                <h3 className="text-base font-bold text-white">{report.title}</h3>
                <span className="text-xs text-slate-500">
                  Generated on {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Summary Text */}
            <p className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {report.summary}
            </p>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(report.metrics).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 truncate">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">{String(val)}</div>
                </div>
              ))}
            </div>

            {/* Top Post Spotlight */}
            {report.top_post && report.top_post.title && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>Top Performing Asset ({report.top_post.platform})</span>
                </div>
                <p className="text-xs font-semibold text-white">{report.top_post.title}</p>
                <div className="flex items-center space-x-4 text-[11px] text-emerald-300">
                  <span>Engagement: <strong>{report.top_post.engagement_rate}</strong></span>
                  <span>Likes: <strong>{report.top_post.likes}</strong></span>
                  <span>Comments: <strong>{report.top_post.comments}</strong></span>
                </div>
              </div>
            )}

            {/* AI Strategic Recommendation */}
            {report.ai_insights && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center space-x-1.5 text-indigo-400 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Strategic AI Next Step</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{report.ai_insights}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
