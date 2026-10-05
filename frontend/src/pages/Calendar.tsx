import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Send, 
  Layers,
  Filter
} from 'lucide-react';
import { Post } from '../types';
import { apiRequest } from '../api/client';

export const CalendarPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    apiRequest<Post[]>('/posts').then(setPosts).catch(console.error);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate days in current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const getPostsForDay = (day: number) => {
    return posts.filter(p => {
      const dateToCheck = p.scheduled_at ? new Date(p.scheduled_at) : new Date(p.created_at);
      return (
        dateToCheck.getFullYear() === year &&
        dateToCheck.getMonth() === month &&
        dateToCheck.getDate() === day
      );
    });
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Editorial Calendar</h2>
          <p className="text-sm text-slate-400">
            Visualize scheduled campaigns, recurring streams, and active releases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold">
            {(['month', 'week', 'day', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Month Stepper */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-200 px-2 min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 text-center text-xs font-semibold text-slate-400 py-3 bg-slate-950/60">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[110px] bg-slate-950/20 p-2"></div>;
              }

              const dayPosts = getPostsForDay(day);
              const isToday = (
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year
              );

              return (
                <div key={`day-${day}`} className="min-h-[110px] p-2 hover:bg-slate-850 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isToday ? 'bg-sky-600 text-white' : 'text-slate-400'
                    }`}>
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {dayPosts.length} posts
                      </span>
                    )}
                  </div>

                  {/* Post Badges */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className={`text-[10px] p-1 rounded font-medium truncate flex items-center space-x-1 ${
                          p.status === 'published' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' :
                          p.status === 'scheduled' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' :
                          'bg-slate-800 text-slate-300'
                        }`}
                        title={p.title || p.content}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                        <span className="truncate">{p.title || p.content}</span>
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-[9px] text-slate-500 font-bold pl-1">
                        +{dayPosts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List / Schedule Stream View */}
      {viewMode !== 'month' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Posts Timeline List</h3>
          {posts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No posts found for this range.</p>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.content}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    p.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {p.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
