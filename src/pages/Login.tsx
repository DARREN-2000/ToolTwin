import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Activity, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      toast.error(err);
    } else {
      toast.success("Successfully signed in!");
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-x-hidden flex items-center justify-center p-4 relative z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black -z-10" />

      <div className="w-full max-w-sm relative">
        <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
        
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-14 h-14 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            ToolTwin
          </h1>
          <p className="text-sm text-gray-400">
            AI Safety Layer — Sign in to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative border border-white/10 bg-black/60 backdrop-blur-xl rounded-2xl p-6 space-y-5 shadow-2xl shadow-blue-900/20"
        >
          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-300 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="operator@tooltwin.demo"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-300 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-xs text-center text-gray-400 pt-2">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-white hover:text-gray-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </form>

        <p className="text-xs text-center text-gray-500 mt-8 font-mono">
          Demo: operator@tooltwin.demo / Demo1234!
        </p>
      </div>
    </div>
  );
}
