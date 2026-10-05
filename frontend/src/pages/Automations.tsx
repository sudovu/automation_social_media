import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  Trash2, 
  Clock, 
  ArrowRight,
  Shield,
  Layers,
  Activity
} from 'lucide-react';
import { AutomationRule } from '../types';
import { apiRequest } from '../api/client';

export const AutomationsPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'runs'>('rules');
  const [showBuilder, setShowBuilder] = useState(false);

  // New Rule Builder Form State
  const [ruleName, setRuleName] = useState('');
  const [triggerType, setTriggerType] = useState('keyword_detected');
  const [keyword, setKeyword] = useState('');
  const [matchType, setMatchType] = useState('contains');
  const [actionType, setActionType] = useState('send_reply');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, runData] = await Promise.all([
        apiRequest<AutomationRule[]>('/automations/rules'),
        apiRequest<any[]>('/automations/runs')
      ]);
      setRules(rData);
      setRuns(runData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRule = async (ruleId: string) => {
    try {
      await apiRequest(`/automations/rules/${ruleId}/toggle`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await apiRequest(`/automations/rules/${ruleId}`, { method: 'DELETE' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      alert('Please provide a rule name.');
      return;
    }

    const conditions = [];
    if (triggerType === 'keyword_detected' || keyword) {
      conditions.push({ type: 'keyword', keyword: keyword || 'price', match_type: matchType });
    }
    if (triggerType === 'business_hours_offline') {
      conditions.push({ type: 'business_hours_offline' });
    }

    const actions = [];
    if (actionType === 'send_reply') {
      actions.push({ type: 'send_reply', text: replyText || 'Thank you for reaching out!' });
    } else if (actionType === 'offline_reply') {
      actions.push({
        type: 'offline_reply',
        text: replyText || 'We are currently offline. We will reply during normal business hours.'
      });
    } else if (actionType === 'ai_reply') {
      actions.push({ type: 'ai_reply', tone: 'professional', mode: 'APPROVAL_REQUIRED' });
    }

    try {
      await apiRequest('/automations/rules', {
        method: 'POST',
        body: JSON.stringify({
          name: ruleName,
          trigger_type: triggerType,
          conditions,
          actions,
          is_active: true
        })
      });
      setShowBuilder(false);
      setRuleName('');
      setKeyword('');
      setReplyText('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Visual Automation Engine</h2>
          <p className="text-sm text-slate-400">
            Automate actions with no-code rules: WHEN (Event) → IF (Condition) → THEN (Action).
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'rules'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('runs')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'runs'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Execution History ({runs.length})
        </button>
      </div>

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white line-clamp-1">{rule.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rule.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {rule.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{rule.description || 'Autonomous rule execution.'}</p>

                  {/* Visual Flow Representation */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <span className="font-bold text-sky-400 uppercase text-[10px] w-12">WHEN</span>
                      <span className="text-slate-200 capitalize">{rule.trigger_type.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-300">
                      <span className="font-bold text-amber-400 uppercase text-[10px] w-12">IF</span>
                      <span className="text-slate-300 truncate">
                        {rule.conditions.length > 0
                          ? rule.conditions.map(c => c.keyword ? `Keyword: "${c.keyword}"` : c.type).join(', ')
                          : 'Always True'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-300">
                      <span className="font-bold text-emerald-400 uppercase text-[10px] w-12">THEN</span>
                      <span className="text-slate-200 capitalize">
                        {rule.actions.map(a => a.type.replace(/_/g, ' ')).join(' & ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Executed: <strong className="text-slate-200">{rule.execution_count} times</strong></span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors"
                      title={rule.is_active ? 'Pause Rule' : 'Activate Rule'}
                    >
                      {rule.is_active ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 hover:bg-slate-800 rounded text-red-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Runs Tab */}
      {activeTab === 'runs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
            Recent Automation Triggers & Results
          </div>
          <div className="divide-y divide-slate-800/80">
            {runs.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No automation logs yet.</p>
            ) : (
              runs.map((run) => (
                <div key={run.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-850">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{run.rule_name || 'Workflow Run'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">{run.trigger_event}</span>
                      {run.platform && <span className="text-[10px] text-sky-400 capitalize">{run.platform}</span>}
                    </div>
                    {run.error_message && (
                      <p className="text-[11px] text-red-400">{run.error_message}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      run.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {run.status}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(run.executed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Visual Rule Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Rule Builder: WHEN → IF → THEN</h3>
              </div>
              <button 
                onClick={() => setShowBuilder(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound Demo Inquiry Auto-Reply"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* 1. WHEN (Trigger) */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-sky-500/30 space-y-2">
                <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider">1. WHEN (Trigger Event)</label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100"
                >
                  <option value="keyword_detected">Customer message contains specific keyword</option>
                  <option value="business_hours_offline">Customer message received outside business hours (Offline)</option>
                  <option value="new_message">Any incoming direct message</option>
                  <option value="new_comment">New public comment posted</option>
                </select>
              </div>

              {/* 2. IF (Condition) */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-amber-500/30 space-y-2">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">2. IF (Filter Condition)</label>
                {triggerType === 'business_hours_offline' ? (
                  <p className="text-xs text-slate-400">Triggers automatically outside 09:00–18:00 or during weekends.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Keyword (e.g. price, demo)"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100"
                    />
                    <select
                      value={matchType}
                      onChange={(e) => setMatchType(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100"
                    >
                      <option value="contains">Contains phrase</option>
                      <option value="exact">Exact match</option>
                      <option value="starts_with">Starts with</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 3. THEN (Action) */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-500/30 space-y-2">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">3. THEN (Action to execute)</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 mb-2"
                >
                  <option value="send_reply">Send Automated Response</option>
                  <option value="offline_reply">Send Offline Notice</option>
                  <option value="ai_reply">Draft AI Response for Human Review</option>
                </select>

                {actionType !== 'ai_reply' && (
                  <textarea
                    rows={2}
                    placeholder="Enter reply text message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100"
                  />
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20"
                >
                  Save & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
