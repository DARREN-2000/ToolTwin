import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, type UserRole } from "../hooks/useAuth";
import { Activity, Mail, Lock, User, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const roles: { value: UserRole; label: string }[] = [
  { value: "operator", label: "Operator" },
  { value: "approver", label: "Approver" },
  { value: "auditor", label: "Auditor" },
  { value: "admin", label: "Admin" },
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error: err } = await signUp(email, password, role, fullName);
    setLoading(false);
    if (err) {
      setError(err);
      toast.error(err);
    } else {
      toast.success("Account created! You can now sign in.");
      setTimeout(() => navigate("/login"), 2000);
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
            Create your account
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
          {success && (
            <div className="text-sm text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground/70 block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Alex Operator"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

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
                placeholder="you@example.com"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/70 block mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-background border border-border rounded-lg pl-3 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-xs text-center text-foreground/40">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
