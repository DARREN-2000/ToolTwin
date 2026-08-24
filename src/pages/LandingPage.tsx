import { ArrowRight, Shield, Zap, Activity, CheckCircle, Database } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md z-50 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">ToolTwin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Sign In
          </Link>
          <button 
            onClick={handleDemoLogin}
            className="text-sm font-bold bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-all active:scale-95"
          >
            Try Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            <span>Zero-Trust AI Agent Architecture</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight leading-tight mb-6 max-w-4xl">
            Never let an AI agent <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              destroy your database.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mb-10 leading-relaxed">
            ToolTwin intercepts AI tool calls, simulates their blast radius on a digital twin, and requires human cryptographic approval before executing on your production data.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleDemoLogin}
              className="group flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all active:scale-95"
            >
              Enter Interactive Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link 
              to="/signup"
              className="flex items-center gap-2 bg-muted/50 border border-border text-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-muted transition-all active:scale-95"
            >
              Deploy to Production
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 relative z-10">
          <div className="bg-muted/30 border border-border/50 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-6">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-3">Pre-Execution Sandbox</h3>
            <p className="text-foreground/60 leading-relaxed">
              Every LLM tool call is routed to an ephemeral MicroVM. We run the query against a mocked schema to calculate the exact blast radius.
            </p>
          </div>
          <div className="bg-muted/30 border border-border/50 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-3">Visual DAG Simulation</h3>
            <p className="text-foreground/60 leading-relaxed">
              See exactly what the AI is about to do. We map out circular dependencies and cascading deletes in a gorgeous, interactive graph.
            </p>
          </div>
          <div className="bg-muted/30 border border-border/50 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-3">Cryptographic Audit</h3>
            <p className="text-foreground/60 leading-relaxed">
              Every approved action is hashed with SHA-256 and signed via Open Agent Passport (OAP) for strict enterprise compliance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
