import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Layers, 
  Copy, 
  Check, 
  Send, 
  Repeat, 
  Scissors, 
  Maximize2, 
  Share2 
} from 'lucide-react';
import { apiRequest } from '../api/client';

export const AIAssistantPage: React.FC<{ onSendToComposer?: (text: string) => void }> = ({ onSendToComposer }) => {
  const [activeTab, setActiveTab] = useState<'variants' | 'repurpose' | 'rewrite'>('variants');

  // Generator State
  const [ideaText, setIdeaText] = useState('');
  const [tone, setTone] = useState('engaging');
  const [variants, setVariants] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Repurpose State
  const [sourceText, setSourceText] = useState('');
  const [sourceType, setSourceType] = useState('article');
  const [repurposed, setRepurposed] = useState<any | null>(null);
  const [repurposing, setRepurposing] = useState(false);

  // Rewriter State
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteInstruction, setRewriteInstruction] = useState('shorten');
  const [rewrittenOutput, setRewrittenOutput] = useState('');
  const [rewriting, setRewriting] = useState(false);

  const handleGenerateVariants = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    try {
      setGenerating(true);
      const res = await apiRequest('/ai/generate-post', {
        method: 'POST',
        body: JSON.stringify({ idea: ideaText, tone })
      });
      setVariants(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRepurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;
    try {
      setRepurposing(true);
      const res = await apiRequest('/ai/repurpose', {
        method: 'POST',
        body: JSON.stringify({ source_text: sourceText, source_type: sourceType })
      });
      setRepurposed(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRepurposing(false);
    }
  };

  const handleRewrite = async (instruction: string) => {
    if (!rewriteInput.trim()) return;
    try {
      setRewriting(true);
      setRewriteInstruction(instruction);
      const res = await apiRequest('/ai/rewrite', {
        method: 'POST',
        body: JSON.stringify({ content: rewriteInput, instruction })
      });
      setRewrittenOutput(res.rewritten);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRewriting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-sky-400" />
          <span>AI Content Studio</span>
        </h2>
        <p className="text-sm text-slate-400">
          Adapt 1 idea across 5 social networks, repurpose long-form articles, and optimize copywriting tone.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('variants')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'variants'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          1 Idea → Multi-Platform Adaptor
        </button>
        <button
          onClick={() => setActiveTab('repurpose')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'repurpose'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Content Repurposing (Article/Transcript)
        </button>
        <button
          onClick={() => setActiveTab('rewrite')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'rewrite'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Copywriting Rewriter
        </button>
      </div>

      {/* Tab 1: Platform Adaptor */}
      {activeTab === 'variants' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Input Concept</h3>
            <form onSubmit={handleGenerateVariants} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Core Topic or Announcement</label>
                <textarea
                  rows={5}
                  placeholder="e.g. Announcing our 2.0 release with real-time multi-platform scheduling, automated inbox keyword replies, and zero spam loopholes."
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Voice & Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                >
                  <option value="engaging">Engaging & Visionary</option>
                  <option value="professional">Professional Executive</option>
                  <option value="casual">Casual & Direct</option>
                  <option value="bold">Bold & Growth-Focused</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Crafting Variants...' : 'Generate Platform Variants'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {variants ? (
              <div className="space-y-4">
                {[
                  { key: 'linkedin', title: 'LinkedIn Edition (Long-form / Strategic)', color: '#0A66C2', text: variants.linkedin },
                  { key: 'twitter', title: 'X / Twitter Edition (Short & Punchy)', color: '#000000', text: variants.twitter },
                  { key: 'instagram', title: 'Instagram Edition (Caption + Hashtags)', color: '#E4405F', text: variants.instagram },
                  { key: 'facebook', title: 'Facebook Edition (Community Post)', color: '#1877F2', text: variants.facebook },
                  { key: 'telegram', title: 'Telegram Channel Broadcast', color: '#229ED9', text: variants.telegram }
                ].map((item) => (
                  <div key={item.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(item.text, item.key)}
                          className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 text-xs flex items-center space-x-1"
                        >
                          {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === item.key ? 'Copied' : 'Copy'}</span>
                        </button>
                        {onSendToComposer && (
                          <button
                            onClick={() => onSendToComposer(item.text)}
                            className="p-1.5 text-sky-400 hover:text-sky-300 rounded bg-sky-950/40 border border-sky-800/60 text-xs flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Compose</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
                <Bot className="w-8 h-8 mx-auto text-slate-600" />
                <p>Enter an idea on the left and click Generate to see tailor-made variants for all channels.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Repurpose */}
      {activeTab === 'repurpose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Source Content</h3>
            <form onSubmit={handleRepurpose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                >
                  <option value="article">Blog / Article</option>
                  <option value="video_transcript">Video Transcript</option>
                  <option value="podcast">Podcast Show Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Paste Source Text</label>
                <textarea
                  rows={8}
                  placeholder="Paste article, transcript, or long post here..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={repurposing}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
              >
                <Repeat className="w-4 h-4" />
                <span>{repurposing ? 'Repurposing...' : 'Repurpose into Social Assets'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {repurposed ? (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Executive Summary</h4>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {repurposed.summary}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Social Snippets</h4>
                  {repurposed.social_posts.map((sp: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-200">
                      {sp}
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Key Pull Quotes</h4>
                  {repurposed.quotes.map((q: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs italic text-slate-300">
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
                <Repeat className="w-8 h-8 mx-auto text-slate-600" />
                <p>Paste an article or video transcript to extract ready-to-publish snippets and quotes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Rewriter */}
      {activeTab === 'rewrite' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Original Copy</h3>
            <textarea
              rows={6}
              placeholder="Paste draft post here to shorten, expand, or adjust tone..."
              value={rewriteInput}
              onChange={(e) => setRewriteInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRewrite('shorten')}
                disabled={rewriting}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Shorten (Punchy)</span>
              </button>
              <button
                onClick={() => handleRewrite('expand')}
                disabled={rewriting}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Detail</span>
              </button>
              <button
                onClick={() => handleRewrite('professional')}
                disabled={rewriting}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Professional Tone
              </button>
              <button
                onClick={() => handleRewrite('casual')}
                disabled={rewriting}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Casual & Conversational
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Modified Result</h3>
              {rewrittenOutput && (
                <button
                  onClick={() => copyToClipboard(rewrittenOutput, 'rewrite')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                >
                  Copy Text
                </button>
              )}
            </div>

            {rewrittenOutput ? (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                {rewrittenOutput}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select an action on the left to see rewritten results here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
