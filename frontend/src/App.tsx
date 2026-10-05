import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { AccountsPage } from './pages/Accounts';
import { PostsPage } from './pages/Posts';
import { CalendarPage } from './pages/Calendar';
import { InboxPage } from './pages/Inbox';
import { AutomationsPage } from './pages/Automations';
import { AIAssistantPage } from './pages/AIAssistant';
import { AnalyticsPage } from './pages/Analytics';
import { MediaLibraryPage } from './pages/MediaLibrary';
import { TemplatesPage } from './pages/Templates';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { DevelopmentsPage } from './pages/DevelopmentsPage';
import { SetupWizard } from './pages/SetupWizard';
import { DashboardStats } from './types';
import { apiRequest } from './api/client';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const loadData = async () => {
    try {
      const [dashStats, emergencyStatus, notifs] = await Promise.all([
        apiRequest<DashboardStats>('/analytics/dashboard-stats'),
        apiRequest<{ automations_paused: boolean }>('/emergency/status'),
        apiRequest<any[]>('/reports/notifications')
      ]);
      setStats(dashStats);
      setIsPaused(emergencyStatus.automations_paused);
      setNotificationsCount(notifs.filter(n => !n.is_read).length);
    } catch (err: any) {
      console.error('Failed to load dashboard telemetry:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Check if first-run setup wizard needed
    apiRequest('/auth/status')
      .then(res => {
        if (!res.is_initialized) {
          setShowWizard(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleEmergencyPause = async () => {
    try {
      if (isPaused) {
        await apiRequest('/emergency/resume-all', { method: 'POST' });
        setIsPaused(false);
      } else {
        await apiRequest('/emergency/pause-all', { method: 'POST' });
        setIsPaused(true);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isPaused={isPaused}
        onTogglePause={handleToggleEmergencyPause}
        onOpenWizard={() => setShowWizard(true)}
      />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isPaused={isPaused}
          onRefresh={loadData}
          onOpenWizard={() => setShowWizard(true)}
          notificationsCount={notificationsCount}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              onNavigate={setCurrentTab}
              onOpenCreatePost={() => setCurrentTab('posts')}
              onOpenConnectAccount={() => setCurrentTab('accounts')}
            />
          )}
          {currentTab === 'accounts' && <AccountsPage />}
          {currentTab === 'posts' && <PostsPage />}
          {currentTab === 'calendar' && <CalendarPage />}
          {currentTab === 'inbox' && <InboxPage />}
          {currentTab === 'automations' && <AutomationsPage />}
          {currentTab === 'ai' && (
            <AIAssistantPage
              onSendToComposer={(text) => {
                setCurrentTab('posts');
              }}
            />
          )}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'media' && <MediaLibraryPage />}
          {currentTab === 'templates' && <TemplatesPage />}
          {currentTab === 'reports' && <ReportsPage />}
          {currentTab === 'developments' && <DevelopmentsPage />}
          {currentTab === 'settings' && (
            <SettingsPage
              isPaused={isPaused}
              onTogglePause={handleToggleEmergencyPause}
            />
          )}
        </main>
      </div>

      {/* 8-Step Setup Wizard Modal */}
      {showWizard && (
        <SetupWizard
          onComplete={() => {
            setShowWizard(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default App;
