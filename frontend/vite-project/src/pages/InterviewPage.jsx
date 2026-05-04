import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic2, Plus, Clock, Star, CheckCircle, Play } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const DOMAINS = ["Full-Stack Development","Frontend","Backend","Data Science","DevOps","Mobile","System Design","Python","Java","React"];
const TYPES = ["technical","hr","behavioral","system-design"];
const DIFFICULTIES = ["easy","medium","hard"];

export default function InterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [form, setForm] = useState({ domain: "", difficulty: "medium", interviewType: "technical" });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/interview/my").then((r) => setInterviews(r.data)).finally(() => setLoading(false));
  }, []);

  const startInterview = async () => {
    if (!form.domain) return toast.error("Please select a domain");
    setStarting(true);
    try {
      const r = await api.post("/interview/start", form);
      navigate(`/interview/${r.data._id}`);
    } catch { toast.error("Failed to start interview"); }
    finally { setStarting(false); }
  };

  const diffColor = { easy: "badge-green", medium: "badge-orange", hard: "badge-purple" };
  const typeColor = { technical: "badge-blue", hr: "badge-green", behavioral: "badge-orange", "system-design": "badge-purple" };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Mic2 size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Mock Interviews</h1>
            <p className="text-base" style={{color:"#8b949e"}}>Practice with AI. Get instant feedback.</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={20} /> New Interview
        </button>
      </div>

      {/* Start form */}
      {showForm && (
        <div className="card p-6 border-blue-500/20 bg-blue-500/5 animate-slide-up">
          <h2 className="font-display text-xl font-semibold mb-5">Configure Interview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Domain *</label>
              <select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="input-field">
                <option value="">Select domain</option>
                {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Type</label>
              <select value={form.interviewType} onChange={(e) => setForm({ ...form, interviewType: e.target.value })} className="input-field">
                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={startInterview} disabled={starting} className="btn-primary">
              <Play size={18} /> {starting ? "Starting..." : "Start Interview"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
          <p className="text-sm mt-3" style={{color:"#6e7681"}}>💡 AI asks 8-10 questions and scores each answer in real-time</p>
        </div>
      )}

      {/* Info cards when empty */}
      {!showForm && interviews.length === 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🎯", title: "Domain-specific Questions", desc: "Technical, HR, and behavioral interviews tailored to your role" },
            { icon: "⚡", title: "Instant AI Feedback",       desc: "Get scored 1-10 on each answer with improvement tips" },
            { icon: "📈", title: "Track Your Progress",       desc: "See your scores improve over multiple sessions" },
          ].map((c) => (
            <div key={c.title} className="card p-6 text-center">
              <div className="text-4xl mb-4">{c.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
              <p className="text-base" style={{color:"#8b949e"}}>{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Past interviews */}
      {interviews.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Past Sessions</h2>
          <div className="space-y-3">
            {interviews.map((iv) => (
              <div key={iv._id} onClick={() => navigate(`/interview/${iv._id}`)}
                className="card p-5 flex items-center gap-4 cursor-pointer hover:border-dark-400 transition-all duration-200 group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  {iv.isCompleted ? <CheckCircle size={22} className="text-brand-400" /> : <Clock size={22} className="text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-base">{iv.domain}</span>
                    <span className={typeColor[iv.interviewType] || "badge-gray"}>{iv.interviewType}</span>
                    <span className={diffColor[iv.difficulty] || "badge-gray"}>{iv.difficulty}</span>
                  </div>
                  <p className="text-sm" style={{color:"#6e7681"}}>{formatDistanceToNow(new Date(iv.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {iv.isCompleted ? (
                    <div className="flex items-center gap-1 text-brand-400">
                      <Star size={16} />
                      <span className="font-mono font-bold text-base">{iv.overallScore}/10</span>
                    </div>
                  ) : (
                    <span className="badge-orange">In Progress</span>
                  )}
                  <p className="text-sm mt-1" style={{color:"#6e7681"}}>{iv.messages.length} messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}