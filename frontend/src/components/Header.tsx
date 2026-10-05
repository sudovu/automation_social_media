import React from 'react';
import { Bell, ShieldCheck, ShieldAlert, Sparkles, User, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isPaused: boolean;
  onRefresh: () => void;
  onOpenWizard: () => void;
  notificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isPaused,
  onRefresh,
  onOpenWizard,
  notificationsCount
}) => {
  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-md text-slate-300 border border-slate-700">
          Environment: Production Ready
        </span>
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Background Scheduler: Running</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Emergency status pill */}
        {isPaused ? (
          <div className="flex items-center space-x-2 px-3 py-1 bg-red-950/50 border border-red-800/80 rounded-full text-xs text-red-300 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Emergency Pause Active</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-950/50 border border-emerald-800/80 rounded-full text-xs text-emerald-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automations Active</span>
          </div>
        )}

        {/* Sync / Refresh */}
        <button
          onClick={onRefresh}
          title="Refresh Data"
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800">
            <Bell className="w-4 h-4" />
          </button>
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </div>

        {/* User badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-medium text-xs">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-slate-200">Admin Account</p>
            <p className="text-[10px] text-slate-400">admin@socialhub.local</p>
          </div>
        </div>
      </div>
    </header>
  );
};
