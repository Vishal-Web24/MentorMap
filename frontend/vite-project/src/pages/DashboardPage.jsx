import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Map, Mic2, Users, UserCheck, ArrowRight, TrendingUp, Zap, Trophy } from "lucide-react";
import useAuthStore from "../store/authStore";
import api from "../utils/api";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/progress/stats"), api.get("/users/leaderboard")])
      .then(([s, l]) => { setStats(s.data); setLeaderboard(l.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { to: "/roadmap",   icon: Map,       label: "View Roadmap",   desc: "Track your weekly milestones",    color: "text-brand-400",  bg: "bg-brand-500/10  border-brand-500/20" },
    { to: "/interview", icon: Mic2,      label: "Mock Interview", desc: "Practice with AI interviewer",    color: "text-blue-400",   bg: "bg-blue-500/10   border-blue-500/20" },
    { to: "/mentors",   icon: UserCheck, label: "Find a Mentor",  desc: "Connect with industry pros",      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { to: "/community", icon: Users,     label: "Community",      desc: "Ask questions & share wins",      color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">
            Hey, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-lg" style={{color:"#8b949e"}}>
            {user?.domain ? `${user.domain} · ${user.targetRole || "Building your future"}` : "Let's set up your career roadmap"}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 badge-green px-4 py-2 rounded-lg text-base">
          <Zap size={16} />
          <span className="font-mono font-semibold">{user?.totalPoints || 0} points</span>
        </div>
      </div>

      {/* Stats */}
      {!loading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Roadmap Progress", value: `${stats.roadmapProgress}%`,  sub: `${stats.completedMilestones}/${stats.totalMilestones} weeks done`, color: "text-brand-400" },
            { label: "Interviews Done",  value: stats.completedInterviews,    sub: `${stats.totalInterviews} total sessions`,  color: "text-blue-400" },
            { label: "Avg Interview Score", value: stats.avgInterviewScore ? `${stats.avgInterviewScore}/10` : "—", sub: "across all sessions", color: "text-purple-400" },
            { label: "Total Points",     value: stats.totalPoints,            sub: `🔥 ${stats.streak || 0} day streak`,       color: "text-orange-400" },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-sm font-medium mb-1" style={{color:"#6e7681"}}>{s.label}</p>
              <p className={`font-display text-3xl font-bold ${s.color} mb-1`}>{s.value}</p>
              <p className="text-sm" style={{color:"#6e7681"}}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {stats?.totalMilestones > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-400" />
              <span className="font-semibold text-base">Roadmap Progress</span>
            </div>
            <span className="text-brand-400 font-mono text-base font-bold">{stats.roadmapProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.roadmapProgress}%` }} />
          </div>
          <p className="text-sm mt-2" style={{color:"#6e7681"}}>{stats.completedMilestones} of {stats.totalMilestones} milestones completed</p>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map(({ to, icon: Icon, label, desc, color, bg }) => (
            <Link key={to} to={to} className={`card p-5 border flex items-center gap-4 hover:border-opacity-60 transition-all duration-200 group ${bg}`}>
              <div className={`w-12 h-12 rounded-xl ${bg} border flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base text-text-primary mb-1">{label}</p>
                <p className="text-sm" style={{color:"#8b949e"}}>{desc}</p>
              </div>
              <ArrowRight size={18} style={{color:"#6e7681"}} className="group-hover:text-text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={22} className="text-orange-400" />
            <h2 className="font-display text-xl font-semibold">Leaderboard</h2>
          </div>
          <div className="space-y-4">
            {leaderboard.slice(0, 5).map((u, i) => (
              <div key={u._id} className="flex items-center gap-4">
                <span className={`font-mono text-base font-bold w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-text-muted"}`}>
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-dark-900 font-bold text-sm">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold">{u.name}</p>
                  <p className="text-sm" style={{color:"#6e7681"}}>{u.domain}</p>
                </div>
                <span className="font-mono text-base text-brand-400 font-bold">{u.totalPoints} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No roadmapCTA */}
      {!loading && stats?.totalMilestones === 0 && (
        <div className="card p-10 text-center border-brand-500/30 bg-brand-500/5">
          <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Map size={30} className="text-brand-400" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-3">Generate Your AI Roadmap</h3>
          <p className="text-base mb-6" style={{color:"#8b949e"}}>Get a personalized 12-week career plan built just for you</p>
          <Link to="/roadmap" className="btn-primary inline-flex text-base">
            Generate Roadmap <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}