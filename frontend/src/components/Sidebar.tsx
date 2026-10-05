import React from 'react';
import { 
  LayoutDashboard, 
  Share2, 
  Inbox, 
  Send, 
  Calendar, 
  Zap, 
  Bot, 
  BarChart3, 
  Image, 
  FileText, 
  LineChart, 
  Settings, 
  ShieldAlert,
  PlayCircle,
  PauseCircle,
  Sparkles,
  Code2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenWizard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isPaused,
  onTogglePause,
  onOpenWizard
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Share2 },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'posts', label: 'Posts & Queue', icon: Send },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'reports', label: 'Reports', icon: LineChart },
    { id: 'developments', label: 'Developments', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">SOCIAL HUB</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Automation Core</p>
            </div>
          </div>
        </div>

        {/* Setup Wizard Button */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenWizard}
            className="w-full py-2 px-3 bg-gradient-to-r from-sky-600/30 to-indigo-600/30 hover:from-sky-600/40 hover:to-indigo-600/40 border border-sky-500/30 rounded-lg text-xs font-semibold text-sky-300 flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Launch Setup Wizard</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-sky-600/15 text-sky-400 border border-sky-500/20 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Emergency Safeguard Panel */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Safeguard Switch</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isPaused ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isPaused ? 'Paused' : 'Active'}
            </span>
          </div>
          
          <button
            onClick={onTogglePause}
            className={`w-full py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
            }`}
          >
            {isPaused ? (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>RESUME ALL POSTING</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4" />
                <span>PAUSE ALL POSTING</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
