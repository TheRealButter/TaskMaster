import React, { useState } from 'react';
import { X, Bell, Send, Sun, CheckCircle2, Smartphone, AlertCircle } from 'lucide-react';

interface NtfySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  onSaveTopic: (topic: string) => void;
}

export const NtfySettingsModal: React.FC<NtfySettingsModalProps> = ({
  isOpen,
  onClose,
  topic,
  onSaveTopic,
}) => {
  const [topicInput, setTopicInput] = useState(topic);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTopic(topicInput.trim());
    setTestResult({ success: true, message: 'Ntfy topic saved successfully!' });
  };

  const handleSendTestPush = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ntfy/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: `Test notification sent to ntfy.sh/${topicInput.trim()}! Check your phone.`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to send test push notification.',
        });
      }
    } catch {
      setTestResult({ success: false, message: 'Network error sending push request.' });
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerDigest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ntfy/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: `7AM Morning Digest triggered! (${data.taskCount} tasks summarized)`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to send digest.',
        });
      }
    } catch {
      setTestResult({ success: false, message: 'Error triggering morning digest.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Mobile Push via ntfy.sh</h3>
              <p className="text-xs text-slate-400">Minute reminders & 7AM daily digest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          {/* Topic form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                ntfy Topic Name
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    ntfy.sh/
                  </span>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="my-taskmaster-topic"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-20 pr-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shrink-0"
                >
                  Save
                </button>
              </div>
            </div>
          </form>

          {/* Test Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleSendTestPush}
              disabled={testing || !topicInput.trim()}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{testing ? 'Sending...' : 'Send Test Push'}</span>
            </button>

            <button
              onClick={handleTriggerDigest}
              disabled={testing || !topicInput.trim()}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition disabled:opacity-50"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{testing ? 'Triggering...' : 'Trigger 7AM Digest'}</span>
            </button>
          </div>

          {/* Result Alert banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                testResult.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Phone Setup Instructions */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>How to setup phone push notifications:</span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
              <li>
                Download the free <strong className="text-slate-200">ntfy app</strong> from the App Store (iOS) or F-Droid / Google Play (Android).
              </li>
              <li>
                Open the app, tap <strong className="text-slate-200">+ Subscribe to topic</strong>.
              </li>
              <li>
                Enter your topic name: <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-400">{topicInput || 'my-taskmaster-topic'}</code>
              </li>
              <li>
                All set! Node-cron checks every minute for due tasks and pushes instant alerts to your phone.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
