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
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-7 h-7 text-on-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            ToolTwin
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            AI Safety Layer — Sign in to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-muted/50 border border-border rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground/70 block mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="operator@tooltwin.demo"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/70 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 cursor-pointer"
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
            className="w-full bg-primary text-on-primary rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-xs text-center text-foreground/40">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>

        <p className="text-xs text-center text-foreground/25 mt-6">
          Demo: operator@tooltwin.demo / Demo1234!
        </p>
      </div>
    </div>
  );
}
