import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  MessageCircle, 
  Send, 
  Bot, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Search,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck
} from 'lucide-react';
import { Conversation, Message, Comment } from '../types';
import { apiRequest } from '../api/client';

export const InboxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'comments'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [suggestingAI, setSuggestingAI] = useState(false);
  const [summarizingAI, setSummarizingAI] = useState(false);

  // Comment reply state
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentReplyText, setCommentReplyText] = useState('');

  const loadConversations = async () => {
    try {
      setLoading(true);
      const [convs, comms] = await Promise.all([
        apiRequest<Conversation[]>('/inbox/conversations'),
        apiRequest<Comment[]>('/inbox/comments')
      ]);
      setConversations(convs);
      setComments(comms);
      if (convs.length > 0 && !selectedConv) {
        setSelectedConv(convs[0]);
        loadMessages(convs[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await apiRequest<Message[]>(`/inbox/conversations/${convId}/messages`);
      setMessages(msgs);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    loadMessages(conv.id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConv) return;
    try {
      setSendingReply(true);
      await apiRequest('/inbox/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          account_id: selectedConv.account_id,
          platform: selectedConv.platform,
          recipient_id: selectedConv.participant_id,
          content: replyText
        })
      });
      setReplyText('');
      await loadMessages(selectedConv.id);
      await loadConversations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleAISuggestReply = async () => {
    if (!selectedConv || messages.length === 0) return;
    try {
      setSuggestingAI(true);
      const lastMsg = messages[messages.length - 1].content;
      const res = await apiRequest(`/ai/suggest-reply?message=${encodeURIComponent(lastMsg)}&tone=professional`, {
        method: 'POST'
      });
      if (res.reply) {
        setReplyText(res.reply);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSuggestingAI(false);
    }
  };

  const handleAISummarize = async () => {
    if (!selectedConv) return;
    try {
      setSummarizingAI(true);
      const summary = await apiRequest(`/inbox/conversations/${selectedConv.id}/summarize`, {
        method: 'POST'
      });
      setSelectedConv({
        ...selectedConv,
        summary: summary.summary,
        customer_wants: summary.customer_wants,
        customer_asked: summary.customer_asked,
        suggested_action: summary.suggested_action
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSummarizingAI(false);
    }
  };

  const handleReplyComment = async (comment: Comment) => {
    if (!commentReplyText.trim()) return;
    try {
      await apiRequest('/inbox/comments/reply', {
        method: 'POST',
        body: JSON.stringify({
          comment_id: comment.id,
          account_id: comment.account_id,
          platform: comment.platform,
          reply_text: commentReplyText
        })
      });
      setActiveCommentId(null);
      setCommentReplyText('');
      await loadConversations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Unified Customer Inbox</h2>
          <p className="text-sm text-slate-400">
            Omni-channel inbox with automated offline replies, spam shields, and AI assistance.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-1.5 rounded-md transition-all ${
              activeTab === 'messages' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct Messages ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-1.5 rounded-md transition-all ${
              activeTab === 'comments' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Public Comments ({comments.length})
          </button>
        </div>
      </div>

      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
          {/* Conversation List Column */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations</span>
              <button onClick={loadConversations} className="text-slate-400 hover:text-white">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 overflow-y-auto flex-1">
              {conversations.map((c) => {
                const isSelected = selectedConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-950/40 border-l-4 border-sky-500' : 'hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{c.participant_name}</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {c.platform}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-1">
                      {c.customer_asked || c.customer_wants || 'New inquiry'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                        c.status === 'unread' ? 'bg-indigo-500/20 text-indigo-300' :
                        c.status === 'replied' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Conversation Thread Column */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden">
            {selectedConv ? (
              <>
                {/* Thread Header & AI Summary Bar */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200">
                        {selectedConv.participant_name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{selectedConv.participant_name}</h4>
                        <span className="text-[10px] text-slate-400 capitalize">{selectedConv.platform} Direct Message</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAISummarize}
                      disabled={summarizingAI}
                      className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>{summarizingAI ? 'Summarizing...' : 'AI Summary'}</span>
                    </button>
                  </div>

                  {/* AI Structured Summary Widget */}
                  {selectedConv.customer_wants && (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-sky-500/20 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                        <span>AI Conversation Analysis</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong>Customer Wants:</strong> {selectedConv.customer_wants}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong>Suggested Action:</strong> {selectedConv.suggested_action}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Bubble Thread */}
                <div className="p-4 space-y-3 overflow-y-auto max-h-[360px] flex-1 bg-slate-950/20">
                  {messages.map((m) => {
                    const isOutgoing = m.direction === 'outgoing';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isOutgoing
                              ? 'bg-sky-600 text-white rounded-br-xs'
                              : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {m.is_auto_reply && ' • Automated Reply'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Composer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleAISuggestReply}
                      disabled={suggestingAI}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{suggestingAI ? 'Drafting...' : 'Generate AI Reply Suggestion'}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-medium">Safe guard: Anti-spam loop enabled</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type your response or edit the AI draft..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply();
                      }}
                      className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply}
                      className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a conversation from the left to view messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Comments Tab */}
      {activeTab === 'comments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monitored Post Comments</h3>
            <span className="text-xs text-slate-400">Total: {comments.length}</span>
          </div>

          <div className="space-y-3">
            {comments.map((comm) => (
              <div key={comm.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{comm.author_name}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {comm.platform}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      comm.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                      comm.sentiment === 'negative' ? 'bg-red-500/10 text-red-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {comm.sentiment}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {new Date(comm.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-200">{comm.content}</p>

                {comm.reply_content ? (
                  <div className="p-2.5 bg-sky-950/30 border border-sky-900/40 rounded-lg text-xs text-sky-200">
                    <span className="font-semibold block text-[10px] uppercase tracking-wider text-sky-400 mb-0.5">Your Response:</span>
                    {comm.reply_content}
                  </div>
                ) : (
                  <div>
                    {activeCommentId === comm.id ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="text"
                          placeholder="Type reply..."
                          value={commentReplyText}
                          onChange={(e) => setCommentReplyText(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                        />
                        <button
                          onClick={() => handleReplyComment(comm)}
                          className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => setActiveCommentId(null)}
                          className="px-2 py-1.5 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveCommentId(comm.id);
                          setCommentReplyText('');
                        }}
                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        Reply to comment
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
