import { useEffect, useState } from "react";
import { Map, Sparkles, CheckCircle, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react";
import useAuthStore from "../store/authStore";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function RoadmapPage() {
  const { user } = useAuthStore();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    degree: user?.degree || "",
    skills: user?.skills || [],
    careerGoal: user?.careerGoal || "",
    targetRole: user?.targetRole || "",
    domain: user?.domain || "",
    experience: user?.experience || "fresher",
    durationWeeks: 12,
  });

  useEffect(() => { fetchRoadmap(); }, []);

  const fetchRoadmap = async () => {
    try { const r = await api.get("/roadmap/my"); setRoadmap(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const generateRoadmap = async () => {
    if (!form.domain || !form.careerGoal || !form.targetRole)
      return toast.error("Please fill in domain, career goal, and target role");
    setGenerating(true);
    try {
      const r = await api.post("/roadmap/generate", form);
      setRoadmap(r.data);
      setShowForm(false);
      toast.success("🗺️ Roadmap generated! Start crushing milestones.");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to generate roadmap");
    } finally { setGenerating(false); }
  };

  const toggleMilestone = async (idx) => {
    try {
      const r = await api.put(`/roadmap/milestone/${roadmap._id}/${idx}`);
      setRoadmap(r.data);
      const m = r.data.milestones[idx];
      if (m.isCompleted) toast.success(`✅ Week ${m.week} complete! +${m.points} pts`);
    } catch { toast.error("Failed to update milestone"); }
  };

  if (loading) return (
    <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-20 shimmer" />)}</div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center">
            <Map size={24} className="text-brand-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Career Roadmap</h1>
            {roadmap && <p className="text-base" style={{color:"#8b949e"}}>{roadmap.title}</p>}
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-secondary">
          <RefreshCw size={18} /> {roadmap ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* Generate form */}
      {(showForm || !roadmap) && (
        <div className="card p-6 border-brand-500/20 animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={22} className="text-brand-400" />
            <h2 className="font-display text-xl font-semibold">Generate AI Roadmap</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Domain *</label>
              <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="input-field" placeholder="e.g. Full-Stack Development" />
            </div>
            <div>
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Target Role *</label>
              <input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="input-field" placeholder="e.g. MERN Stack Developer" />
            </div>
            <div>
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Career Goal *</label>
              <input value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                className="input-field" placeholder="e.g. Get first job in 3 months" />
            </div>
            <div>
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Duration (weeks)</label>
              <select value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: parseInt(e.target.value) })} className="input-field">
                {[8, 10, 12, 16, 20].map((w) => <option key={w} value={w}>{w} weeks</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-medium mb-2" style={{color:"#8b949e"}}>Current Skills (comma-separated)</label>
              <input value={form.skills.join(", ")}
                onChange={(e) => setForm({ ...form, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                className="input-field" placeholder="e.g. React, Node.js, MongoDB" />
            </div>
          </div>
          <button onClick={generateRoadmap} disabled={generating} className="btn-primary mt-5 text-base">
            <Sparkles size={18} />
            {generating ? "AI is building your roadmap... (15-30s)" : "Generate with AI"}
          </button>
        </div>
      )}

      {/* Progress */}
      {roadmap && (
        <div className="card p-5">
          <div className="flex justify-between text-base mb-3">
            <span style={{color:"#8b949e"}} className="font-medium">Overall Progress</span>
            <span className="text-brand-400 font-mono font-bold text-lg">{roadmap.overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${roadmap.overallProgress}%` }} />
          </div>
          <p className="text-sm mt-2" style={{color:"#6e7681"}}>
            {roadmap.milestones.filter((m) => m.isCompleted).length} of {roadmap.milestones.length} milestones completed
          </p>
        </div>
      )}

      {/* Milestones */}
      {roadmap && (
        <div className="space-y-3">
          {roadmap.milestones.map((milestone, idx) => (
            <div key={idx} className={`card overflow-hidden transition-all duration-200 ${milestone.isCompleted ? "border-brand-500/30 bg-brand-500/5" : ""}`}>
              <div className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpanded((e) => ({ ...e, [idx]: !e[idx] }))}>
                <button onClick={(e) => { e.stopPropagation(); toggleMilestone(idx); }}
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${milestone.isCompleted ? "border-brand-500 bg-brand-500" : "border-dark-400 hover:border-brand-500"}`}>
                  {milestone.isCompleted && <CheckCircle size={16} className="text-dark-900" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono" style={{color:"#6e7681"}}>Week {milestone.week}</span>
                    {milestone.isCompleted && <span className="badge-green text-sm">+{milestone.points}pts</span>}
                  </div>
                  <p className={`font-semibold text-base ${milestone.isCompleted ? "line-through" : "text-text-primary"}`}
                    style={milestone.isCompleted ? {color:"#6e7681"} : {}}>
                    {milestone.title}
                  </p>
                </div>
                {expanded[idx] ? <ChevronUp size={20} style={{color:"#6e7681"}} /> : <ChevronDown size={20} style={{color:"#6e7681"}} />}
              </div>

              {expanded[idx] && (
                <div className="px-5 pb-5 border-t border-dark-500 pt-4 animate-slide-up">
                  <p className="text-base mb-4 leading-relaxed" style={{color:"#8b949e"}}>{milestone.description}</p>
                  {milestone.tasks?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{color:"#6e7681"}}>Tasks</p>
                      <ul className="space-y-2">
                        {milestone.tasks.map((task, ti) => (
                          <li key={ti} className="flex items-start gap-3 text-base" style={{color:"#8b949e"}}>
                            <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {milestone.resources?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{color:"#6e7681"}}>Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {milestone.resources.map((r, ri) => (
                          <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg transition-colors">
                            <ExternalLink size={13} />
                            {r.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}