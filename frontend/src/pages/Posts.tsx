import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Clock, 
  Calendar, 
  FileText, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Trash2, 
  Layers, 
  ListOrdered,
  Sparkles,
  ChevronRight,
  Pause,
  Play,
  SkipForward
} from 'lucide-react';
import { Post, QueueItem, SocialAccount } from '../types';
import { apiRequest } from '../api/client';

export const PostsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'queue' | 'recurring'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Post Creator State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('TEXT');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin']);
  const [publishMode, setPublishMode] = useState<'published' | 'scheduled' | 'draft' | 'pending_approval'>('published');
  const [scheduleTime, setScheduleTime] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option A', 'Option B']);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, qData, aData] = await Promise.all([
        apiRequest<Post[]>('/posts'),
        apiRequest<QueueItem[]>('/queue'),
        apiRequest<SocialAccount[]>('/accounts')
      ]);
      setPosts(pData);
      setQueue(qData);
      setAccounts(aData);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      alert('Post content cannot be empty.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one social channel.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const idempotencyKey = `post_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: postTitle || postContent.slice(0, 30),
          content: postContent,
          post_type: postType,
          platforms: selectedPlatforms,
          poll_options: postType === 'POLL' ? pollOptions : [],
          status: publishMode,
          scheduled_at: publishMode === 'scheduled' && scheduleTime ? new Date(scheduleTime).toISOString() : null,
          idempotency_key: idempotencyKey
        })
      });

      setShowCreateModal(false);
      setPostTitle('');
      setPostContent('');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiRequest(`/posts/${id}/duplicate`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiRequest(`/posts/${id}/approve`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiRequest(`/posts/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddToQueue = async (postId: string) => {
    try {
      await apiRequest(`/queue/add/${postId}`, { method: 'POST' });
      await loadData();
      alert('Post added to Content Queue!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSkipQueue = async (itemId: string) => {
    try {
      await apiRequest(`/queue/${itemId}/skip`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const togglePlatform = (plat: string) => {
    if (selectedPlatforms.includes(plat)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== plat));
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Publishing & Content Queue</h2>
          <p className="text-sm text-slate-400">
            Publish immediately, schedule for peak engagement, or manage automated content queues.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Post Composer</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 font-bold">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Posts Stream ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'queue'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Automated Queue ({queue.length})
        </button>
      </div>

      {/* Post Stream Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-3">
              <Send className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No posts published or scheduled</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create your first post or schedule evergreen content for automated distribution.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{post.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          post.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          post.status === 'pending_approval' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {post.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{post.post_type}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(post.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {post.status === 'pending_approval' && (
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleAddToQueue(post.id)}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors text-xs"
                        title="Add to Content Queue"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(post.id)}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors text-xs"
                        title="Clone Post"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors text-xs"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Targeted Channels & Variant Outcomes */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">Target Channels:</span>
                    {post.platforms.map((plat) => (
                      <span key={plat} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-800 rounded text-slate-300 capitalize">
                        {plat}
                      </span>
                    ))}
                    {post.scheduled_at && (
                      <span className="text-[11px] text-amber-400 ml-auto flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Run: {new Date(post.scheduled_at).toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Queue Tab */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span>Automated Queue: Posts will publish in sequential order at regular intervals.</span>
            <span className="font-semibold text-sky-400">{queue.length} items queued</span>
          </div>

          {queue.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-3">
              <ListOrdered className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">Content Queue is empty</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add posts to your queue from the Posts stream to let the automation engine distribute them automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.post?.title || 'Queued Content'}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.post?.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.status}
                    </span>
                    <button
                      onClick={() => handleSkipQueue(item.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded text-xs flex items-center space-x-1"
                      title="Skip this slot"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>Skip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Composer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Create Multi-Platform Post</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Target Platforms</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'telegram', 'whatsapp', 'reddit', 'pinterest', 'threads'].map((plat) => {
                    const checked = selectedPlatforms.includes(plat);
                    return (
                      <button
                        type="button"
                        key={plat}
                        onClick={() => togglePlatform(plat)}
                        className={`p-2 rounded-lg border text-xs font-semibold capitalize transition-all flex items-center justify-between ${
                          checked
                            ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{plat}</span>
                        {checked && <CheckCircle className="w-3 h-3 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Post Title / Internal Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly Product Update"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Post Format</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="TEXT">TEXT (Standard)</option>
                    <option value="IMAGE">IMAGE Post</option>
                    <option value="VIDEO">VIDEO Post</option>
                    <option value="CAROUSEL">CAROUSEL / Gallery</option>
                    <option value="LINK">LINK Post</option>
                    <option value="POLL">POLL (Interactive)</option>
                  </select>
                </div>
              </div>

              {/* Content Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Post Content</label>
                <textarea
                  rows={4}
                  placeholder="Draft your message, announcements, or hashtags here..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                ></textarea>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Characters: {postContent.length}</span>
                  <span>(X limit: 280, Threads: 500, LinkedIn: 3000)</span>
                </div>
              </div>

              {/* Publishing Schedule Controls */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Publishing Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'published', label: 'Publish Now' },
                    { id: 'scheduled', label: 'Schedule' },
                    { id: 'draft', label: 'Save Draft' },
                    { id: 'pending_approval', label: 'Require Approval' }
                  ].map((mode) => (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => setPublishMode(mode.id as any)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                        publishMode === mode.id
                          ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {publishMode === 'scheduled' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Stored in UTC internally; converted automatically to your timezone.</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Processing...' : publishMode === 'published' ? 'Publish Immediately' : 'Submit Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
