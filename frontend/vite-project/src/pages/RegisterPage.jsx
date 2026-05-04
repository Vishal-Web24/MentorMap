import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "mentee" });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    const res = await register(form);
    if (res.success) {
      toast.success("Account created! Let's set up your profile.");
      navigate("/onboarding");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 dot-grid">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-dark-900" />
            </div>
            <span className="font-display text-xl font-semibold">MentorMap</span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Start your journey</h1>
          <p className="text-text-muted">Get your AI career roadmap in 2 minutes</p>
        </div>

        <div className="card p-7 glow-green">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-10" placeholder="Vishal Munde" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">I want to</label>
              <div className="grid grid-cols-3 gap-2">
                {["mentee", "mentor", "both"].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all capitalize ${
                      form.role === r ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-dark-500 text-text-muted hover:border-dark-400"
                    }`}>
                    {r === "mentee" ? "Learn" : r === "mentor" ? "Mentor" : "Both"}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? "Creating account..." : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}