import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Plus, 
  ExternalLink,
  Shield,
  Layers,
  Info
} from 'lucide-react';
import { SocialAccount, PlatformCapability } from '../types';
import { apiRequest } from '../api/client';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [platforms, setPlatforms] = useState<PlatformCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformCapability | null>(null);
  const [accountName, setAccountName] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [accs, plats] = await Promise.all([
        apiRequest<SocialAccount[]>('/accounts'),
        apiRequest<PlatformCapability[]>('/accounts/platforms')
      ]);
      setAccounts(accs);
      setPlatforms(plats);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform) return;
    try {
      setConnecting(true);
      setErrorMsg('');
      await apiRequest('/accounts/connect', {
        method: 'POST',
        body: JSON.stringify({
          platform: selectedPlatform.platform,
          account_name: accountName || `${selectedPlatform.display_name} Account`,
          auth_token_or_code: authToken || 'mock_token_sandbox',
          timezone: 'UTC'
        })
      });
      setSuccessMsg(`Successfully connected ${selectedPlatform.display_name}!`);
      setSelectedPlatform(null);
      setAccountName('');
      setAuthToken('');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async (id: string) => {
    try {
      await apiRequest(`/accounts/${id}/sync`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this account? Scheduled automations will halt.')) return;
    try {
      await apiRequest(`/accounts/${id}/disconnect`, { method: 'POST' });
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Social Channel Integrations</h2>
          <p className="text-sm text-slate-400">
            Connect and authenticate your official brand accounts with granular capability controls.
          </p>
        </div>
        <button
          onClick={() => {
            if (platforms.length > 0) setSelectedPlatform(platforms[0]);
          }}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Platform</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 font-bold">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 font-bold">×</button>
        </div>
      )}

      {/* Connected Accounts List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">Connected Channels ({accounts.length})</h3>
        {accounts.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-3">
            <Share2 className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No social accounts connected yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select one of the 11 supported platforms below to link your official page, channel, or bot.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {acc.metadata?.avatar_url ? (
                      <img src={acc.metadata.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 uppercase">
                        {acc.platform.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white capitalize">{acc.account_name}</h4>
                      <span className="text-xs text-slate-400 capitalize">{acc.platform} • ID: {acc.account_id}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span>Followers / Audience:</span>
                    <strong className="text-slate-200">{(acc.metadata?.followers_count || 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Timezone:</span>
                    <strong className="text-slate-200">{acc.timezone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Synced:</span>
                    <strong className="text-slate-200">{acc.last_sync ? new Date(acc.last_sync).toLocaleTimeString() : 'Never'}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleSync(acc.id)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors text-xs flex items-center space-x-1"
                    title="Sync profile data"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors text-xs flex items-center space-x-1"
                    title="Disconnect account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Platforms Directory */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">Supported Platform Connectors (11)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((plat) => (
            <div
              key={plat.platform}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: plat.color }}
                    ></span>
                    <h4 className="text-sm font-bold text-white">{plat.display_name}</h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {plat.auth_type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{plat.category}</p>

                {/* Capabilities pills */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    plat.capabilities.publishing ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    Publishing: {plat.capabilities.publishing ? 'Yes' : 'No'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    plat.capabilities.messaging ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    Inbox: {plat.capabilities.messaging ? 'Yes' : 'No'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    plat.capabilities.comments ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    Comments: {plat.capabilities.comments ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* Unsupported indicators */}
                {plat.unsupported_features.length > 0 && (
                  <div className="mt-3 text-[11px] text-amber-300/80 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                    <span className="font-semibold block text-[10px] uppercase tracking-wider text-amber-400 mb-0.5">Platform Policy Limitation:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {plat.unsupported_features.map((uf, i) => (
                        <li key={i} className="line-clamp-1">{uf}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedPlatform(plat)}
                className="w-full py-2 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 rounded-lg text-xs font-semibold transition-all"
              >
                Connect {plat.display_name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span 
                  className="w-3.5 h-3.5 rounded-full" 
                  style={{ backgroundColor: selectedPlatform.color }}
                ></span>
                <h3 className="text-base font-bold text-white">Connect {selectedPlatform.display_name}</h3>
              </div>
              <button 
                onClick={() => setSelectedPlatform(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Official Brand Channel"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  API Key / OAuth Token (or leave blank for Sandbox Mode)
                </label>
                <input
                  type="password"
                  placeholder="Paste token or leave empty for local sandbox"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tokens are encrypted at rest with Fernet. Leaving this empty connects via local sandbox testing.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Required Permissions:</span>
                </div>
                <p className="font-mono text-[11px] text-slate-300">
                  {selectedPlatform.required_permissions.join(', ') || 'Standard Basic Access'}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Authorize & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
