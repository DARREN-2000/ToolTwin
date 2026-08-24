import React, { useState, useEffect } from 'react';
import { X, Play, Activity, ShieldCheck } from 'lucide-react';

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      
      <div className={`relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-8 shadow-2xl transition-transform duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <button onClick={handleClose} className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 mt-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome to ToolTwin</h2>
          <p className="text-gray-400">Your powerful new platform for system management and orchestration.</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1 bg-white/5 p-3 rounded-xl border border-white/10 text-white flex items-center justify-center">
              <Play className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Action Console</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Monitor live operations, manage incoming actions, and intervene when necessary with real-time feedback.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1 bg-white/5 p-3 rounded-xl border border-white/10 text-white flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Simulation Graph</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Visualize system dependencies and simulate complex scenarios before deploying them to production.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1 bg-white/5 p-3 rounded-xl border border-white/10 text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Policy Manager</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Set rigorous guardrails, define access controls, and enforce compliance across your entire infrastructure.</p>
            </div>
          </div>
        </div>

        <button onClick={handleClose} className="w-full rounded-lg bg-white py-3 font-medium text-black transition-colors hover:bg-gray-200">
          Get Started
        </button>
      </div>
    </div>
  );
}
