import { ArrowRight, Shield, Zap, Activity, CheckCircle, Database, Lock, Code2, Cpu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function LandingPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    toast.loading("Starting demo environment...", { id: "demo" });
    await signIn("operator@tooltwin.demo", "Demo1234!");
    toast.success("Welcome to ToolTwin!", { id: "demo" });
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] overflow-hidden selection:bg-accent/30 font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 flex justify-center pointer-events-none">
        <div className="absolute top-[-20%] w-[1000px] h-[600px] bg-accent/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 border-b border-white/[0.08] bg-black/50 backdrop-blur-xl z-50 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent),0.5)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-white">ToolTwin</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <button 
            onClick={handleDemoLogin}
            className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Try Demo
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mt-12 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-accent text-sm font-medium mb-8 hover:bg-white/[0.05] transition-colors cursor-default backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            ToolTwin AI Safety Layer 2.0 is Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[1.1] mb-8 max-w-5xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Never let an AI agent <br className="hidden md:block" />
            destroy your database.
          </h1>
          
          <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12 leading-relaxed font-light">
            ToolTwin intercepts LLM tool calls, simulates their blast radius on a digital twin, and requires human cryptographic approval before executing on your production data.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button 
              onClick={handleDemoLogin}
              className="group relative flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all w-full sm:w-auto overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter Interactive Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
            <Link 
              to="/signup"
              className="flex items-center justify-center gap-2 bg-white/[0.03] border border-white/[0.08] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/[0.08] transition-all w-full sm:w-auto backdrop-blur-md"
            >
              Deploy to Production
            </Link>
          </div>
        </div>

        {/* Floating Code Mockup */}
        <div className="w-full max-w-5xl mx-auto mb-32 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent via-blue-600 to-purple-600 rounded-[24px] blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-[22px] overflow-hidden shadow-2xl flex flex-col">
            <div className="h-12 bg-white/[0.02] border-b border-white/[0.08] flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="mx-auto text-xs font-mono text-white/30 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                agent-proxy/interceptor.ts
              </div>
            </div>
            <div className="p-6 md:p-8 font-mono text-sm leading-relaxed overflow-x-auto text-white/70">
              <span className="text-purple-400">const</span> interceptToolCall = <span className="text-blue-400">async</span> (toolCall) {`=>`} {'{\n'}
              {'  '}// 1. Intercept the LLM request\n
              {'  '}<span className="text-accent">console</span>.log(<span className="text-green-300">"Intercepted:"</span>, toolCall.name);\n\n
              {'  '}// 2. Clone schema & simulate locally\n
              {'  '}<span className="text-purple-400">const</span> impact = <span className="text-blue-400">await</span> MicroVM.simulate(toolCall);\n\n
              {'  '}// 3. Halt if blast radius exceeds policy\n
              {'  '}<span className="text-purple-400">if</span> (impact.cascadingDeletes {'>'} <span className="text-orange-400">0</span>) {'{\n'}
              {'    '}<span className="text-blue-400">throw new</span> <span className="text-yellow-200">PolicyViolationError</span>(<span className="text-green-300">"Requires Human Approval"</span>);\n
              {'  }\n'}
              {'}'}
            </div>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div className="w-full">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-center mb-16 tracking-tight">Enterprise-grade security, <br/><span className="text-white/40">built for the autonomous era.</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Bento Box */}
            <div className="md:col-span-2 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.15] transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full group-hover:bg-accent/20 transition-colors" />
              <div className="w-14 h-14 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading mb-3 text-white">Pre-Execution Sandboxing</h3>
                <p className="text-white/50 leading-relaxed max-w-md text-lg">
                  Every LLM tool call is routed to an ephemeral MicroVM. We run the mutation against a mocked Postgres schema to calculate the exact blast radius before it touches production.
                </p>
              </div>
            </div>

            {/* Small Bento Box 1 */}
            <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between group hover:border-white/[0.15] transition-colors relative overflow-hidden">
              <div className="w-14 h-14 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading mb-2 text-white">Visual DAGs</h3>
                <p className="text-white/50 leading-relaxed">
                  Map out circular dependencies and cascading deletes instantly on a gorgeous node graph.
                </p>
              </div>
            </div>

            {/* Small Bento Box 2 */}
            <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between group hover:border-white/[0.15] transition-colors relative overflow-hidden">
              <div className="w-14 h-14 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading mb-2 text-white">Cryptographic Audit</h3>
                <p className="text-white/50 leading-relaxed">
                  Every approved action is hashed with SHA-256 for strict enterprise compliance.
                </p>
              </div>
            </div>

            {/* Medium Bento Box */}
            <div className="md:col-span-2 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between group hover:border-white/[0.15] transition-colors relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
              <div className="w-14 h-14 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading mb-3 text-white">Rule-Based Policies</h3>
                <p className="text-white/50 leading-relaxed max-w-md text-lg">
                  Define strict operational guardrails. "Never allow DELETE on users table if active subscriptions exist." ToolTwin enforces these automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer CTA */}
        <div className="mt-40 text-center w-full max-w-4xl border-t border-white/[0.08] pt-24 pb-12">
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8">Ready to secure your AI?</h2>
          <button 
            onClick={handleDemoLogin}
            className="bg-white text-black px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Launch Interactive Demo
          </button>
        </div>
      </main>
    </div>
  );
}
