import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Clock, 
  Bot, 
  Share2, 
  Zap, 
  Send, 
  ShieldCheck 
} from 'lucide-react';
import { apiRequest } from '../api/client';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Wizard state
  const [adminEmail, setAdminEmail] = useState('admin@socialhub.local');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [timezone, setTimezone] = useState('UTC');
  const [aiProvider, setAiProvider] = useState('mock');
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [businessStart, setBusinessStart] = useState('09:00');
  const [businessEnd, setBusinessEnd] = useState('18:00');
  const [firstRuleName, setFirstRuleName] = useState('Instant Pricing Auto-Reply');
  const [firstPostContent, setFirstPostContent] = useState('Excited to announce our new automated multichannel workflows! 🚀 #productivity');
  const [submitting, setSubmitting] = useState(false);

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      // Connect first account
      await apiRequest('/accounts/connect', {
        method: 'POST',
        body: JSON.stringify({
          platform: selectedPlatform,
          account_name: `${selectedPlatform.toUpperCase()} Official Page`,
          auth_token_or_code: 'mock_token',
          timezone
        })
      });

      // Create first post
      await apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'First Automated Post',
          content: firstPostContent,
          post_type: 'TEXT',
          platforms: [selectedPlatform],
          status: 'published'
        })
      });

      onComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-sky-400">
              Setup Wizard • Step {step} of {totalSteps}
            </span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Admin */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Step 1: Admin Account Credentials</h3>
                <p className="text-xs text-slate-400">Establish the master administrator profile.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Timezone */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Step 2: Operating Timezone</h3>
                <p className="text-xs text-slate-400">Ensure scheduled posts execute at your target audience hours.</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">Eastern Time (EST/EDT)</option>
                <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: AI Provider */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Step 3: Configure AI Engine</h3>
                <p className="text-xs text-slate-400">Select copy generation and autonomous reply engine.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAiProvider('mock')}
                className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                  aiProvider === 'mock'
                    ? 'bg-sky-600/20 border-sky-500 text-sky-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-white">Offline AI Engine</div>
                <div className="text-[11px] text-slate-400">Zero API key setup required. Works offline.</div>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider('gemini')}
                className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                  aiProvider === 'gemini'
                    ? 'bg-sky-600/20 border-sky-500 text-sky-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-white">Google Gemini API</div>
                <div className="text-[11px] text-slate-400">Advanced LLM for reasoning and multi-turn chat.</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: First Social Account */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Step 4: Primary Social Account</h3>
                <p className="text-xs text-slate-400">Pick your primary channel to initialize.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'telegram'].map((plat) => (
                <button
                  type="button"
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`p-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    selectedPlatform === plat
                      ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Business Hours */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Step 5: Business Hours Auto-Responder</h3>
                <p className="text-xs text-slate-400">Incoming inquiries outside these hours get an automatic polite notice.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opens at</label>
                <input
                  type="time"
                  value={businessStart}
                  onChange={(e) => setBusinessStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Closes at</label>
                <input
                  type="time"
                  value={businessEnd}
                  onChange={(e) => setBusinessEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: First Automation */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Step 6: First Automation Rule</h3>
                <p className="text-xs text-slate-400">WHEN a customer mentions "price" → THEN reply immediately.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-300 font-semibold">Enabled Rule: Instant Pricing Guide</div>
              <p className="text-slate-400 text-[11px]">
                Incoming messages matching "price" or "pricing" receive instant assistance without human delay.
              </p>
            </div>
          </div>
        )}

        {/* Step 7: First Scheduled Post */}
        {step === 7 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Step 7: Launch Post Content</h3>
                <p className="text-xs text-slate-400">Draft your inaugural broadcast announcement.</p>
              </div>
            </div>

            <div className="pt-2">
              <textarea
                rows={3}
                value={firstPostContent}
                onChange={(e) => setFirstPostContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* Step 8: Ready */}
        {step === 8 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Platform Ready to Launch!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your accounts, automation rules, rate limits, and scheduling engine are initialized and running.
            </p>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 hover:bg-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div></div>}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-sky-600/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <span>{submitting ? 'Initializing...' : 'Launch Dashboard'}</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
