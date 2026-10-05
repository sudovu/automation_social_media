import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Clock, 
  Bot, 
  Save, 
  AlertTriangle,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { apiRequest } from '../api/client';

export const SettingsPage: React.FC<{ isPaused: boolean; onTogglePause: () => void }> = ({
  isPaused,
  onTogglePause
}) => {
  const [settingsData, setSettingsData] = useState<any>({
    timezone: 'UTC',
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    ai_provider: 'mock',
    ai_default_mode: 'APPROVAL_REQUIRED',
    max_messages_per_hour: 60,
    max_posts_per_day: 30,
    global_cooldown_seconds: 10
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    apiRequest('/settings').then(setSettingsData).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData)
      });
      setSavedMsg('Settings saved successfully.');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-sky-400" />
          <span>System & Safeguard Settings</span>
        </h2>
        <p className="text-sm text-slate-400">
          Configure operating hours, anti-spam loop thresholds, and AI oversight rules.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold">
          {savedMsg}
        </div>
      )}

      {/* Emergency Global Master Switch */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Emergency Master Control</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly freeze all scheduled posts, incoming auto-replies, and background webhook executions.
            </p>
          </div>
          <button
            onClick={onTogglePause}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
            }`}
          >
            {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
            <span>{isPaused ? 'Resume All Systems' : 'Halt All Automations'}</span>
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Hours & Timezone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Timezone & Business Operating Hours</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Timezone</label>
              <select
                value={settingsData.timezone}
                onChange={(e) => setSettingsData({ ...settingsData, timezone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                <option value="UTC">UTC (Default Standard)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Hours Start</label>
              <input
                type="time"
                value={settingsData.business_hours_start}
                onChange={(e) => setSettingsData({ ...settingsData, business_hours_start: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Hours End</label>
              <input
                type="time"
                value={settingsData.business_hours_end}
                onChange={(e) => setSettingsData({ ...settingsData, business_hours_end: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Messages arriving outside these hours automatically trigger your configured Offline Auto-Responder.
          </p>
        </div>

        {/* AI Oversight Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>AI Provider & Oversight Policy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">AI Provider Engine</label>
              <select
                value={settingsData.ai_provider}
                onChange={(e) => setSettingsData({ ...settingsData, ai_provider: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                <option value="mock">Built-in Offline Heuristic AI (No API key needed)</option>
                <option value="gemini">Google Gemini API (Requires AI_API_KEY)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Inbound Reply Mode</label>
              <select
                value={settingsData.ai_default_mode}
                onChange={(e) => setSettingsData({ ...settingsData, ai_default_mode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                <option value="APPROVAL_REQUIRED">APPROVAL REQUIRED (Recommended: Human in loop)</option>
                <option value="SUGGEST_ONLY">SUGGEST ONLY (Draft in inbox only)</option>
                <option value="AUTO_SEND">AUTO SEND (Fully autonomous)</option>
                <option value="OFF">OFF (Disabled)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Anti-Spam Safeguards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Spam & Rate Limit Safeguards</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Messages / Hour</label>
              <input
                type="number"
                value={settingsData.max_messages_per_hour}
                onChange={(e) => setSettingsData({ ...settingsData, max_messages_per_hour: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Posts / Day</label>
              <input
                type="number"
                value={settingsData.max_posts_per_day}
                onChange={(e) => setSettingsData({ ...settingsData, max_posts_per_day: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cooldown (Seconds)</label>
              <input
                type="number"
                value={settingsData.global_cooldown_seconds}
                onChange={(e) => setSettingsData({ ...settingsData, global_cooldown_seconds: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md shadow-sky-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
