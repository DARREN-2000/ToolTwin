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
      toast.success("Account created successfully!");
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
          <p className="text-sm text-gray-400">Create your account</p>
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
          {success && (
            <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Alex Operator"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 block">
              Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer [&>option]:bg-gray-900"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)] mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-xs text-center text-gray-400 pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white hover:text-gray-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
