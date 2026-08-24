import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tighter">CipherAI</Link>
          <div className="hidden md:flex space-x-8 text-sm text-gray-400">
            <Link to="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link to="/#docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link to="/pricing" className="text-white font-medium transition-colors">Pricing</Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition flex items-center">Sign In</Link>
            <button className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition">Get Started</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Pricing for every stage
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Start for free, scale as you grow. Purpose-built for developers who prioritize both velocity and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Developer Tier */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col hover:border-white/20 transition-colors duration-300">
            <h3 className="text-2xl font-bold mb-2">Developer</h3>
            <p className="text-gray-400 text-sm mb-6 flex-grow">Perfect for side projects and local testing.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold tracking-tight">$0</span>
              <span className="text-gray-500 font-medium">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-grow">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Up to 10k requests/mo
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Basic rate limiting
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Community support
              </li>
            </ul>
            <button className="w-full py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition">
              Start Free
            </button>
          </div>

          {/* Pro Tier - Glowing Border */}
          <div className="rounded-3xl border border-blue-500 bg-white/5 p-8 flex flex-col relative shadow-[0_0_40px_rgba(59,130,246,0.2)] transform md:-translate-y-4 group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-300 text-sm mb-6 flex-grow">For production apps and growing teams.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold tracking-tight">$49</span>
                <span className="text-gray-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-grow">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  500k requests/mo
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Advanced injection protection
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Analytics dashboard
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Priority email support
                </li>
              </ul>
              <button className="w-full py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col hover:border-white/20 transition-colors duration-300">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <p className="text-gray-400 text-sm mb-6 flex-grow">Custom solutions for large organizations.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold tracking-tight">Custom</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-grow">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Unlimited requests
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                SOC2 & GDPR Compliance
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Dedicated success manager
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Custom SLAs
              </li>
            </ul>
            <button className="w-full py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Pricing;
