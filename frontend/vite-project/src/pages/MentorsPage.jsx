import { useEffect, useState } from "react";
import { UserCheck, Search, Star, Send, X } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

function MentorCard({ mentor, onRequest }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ message: "", goals: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async () => {
    if (!form.message) return toast.error("Please write a message");
    setSubmitting(true);
    try {
      await onRequest(mentor._id, form.message, form.goals.split(",").map((g) => g.trim()).filter(Boolean));
      setShowModal(false);
      setForm({ message: "", goals: "" });
      toast.success(`Request sent to ${mentor.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card p-5 hover:border-dark-400 transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {mentor.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-text-primary">{mentor.name}</h3>
                <p className="text-text-muted text-sm">{mentor.mentorProfile?.designation || "Mentor"} {mentor.mentorProfile?.company ? `@ ${mentor.mentorProfile.company}` : ""}</p>
              </div>
              {mentor.mentorProfile?.rating > 0 && (
                <div className="flex items-center gap-1 text-yellow-400 text-sm flex-shrink-0">
                  <Star size={13} className="fill-current" />
                  <span className="font-mono">{mentor.mentorProfile.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-2 line-clamp-2">{mentor.bio || "Experienced professional ready to guide your career."}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {mentor.domain && <span className="badge-blue">{mentor.domain}</span>}
              {mentor.mentorProfile?.expertise?.slice(0, 3).map((e) => (
                <span key={e} className="badge-gray">{e}</span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-text-muted">
                {mentor.mentorProfile?.yearsOfExperience > 0 ? `${mentor.mentorProfile.yearsOfExperience} yrs exp` : ""}
                {mentor.mentorProfile?.availableSlots > 0 ? ` · ${mentor.mentorProfile.availableSlots} slots open` : ""}
              </div>
              <button onClick={() => setShowModal(true)} className="btn-primary text-xs py-1.5 px-3">
                <Send size={12} /> Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold">Connect with {mentor.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Your message *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field resize-none" rows={3}
                  placeholder="Hi! I'm a fresher looking for guidance in Full-Stack development..." />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Your goals (comma-separated)</label>
                <input value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  className="input-field" placeholder="Get first job, Learn system design, Resume review" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleRequest} disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? "Sending..." : "Send Request"}
                </button>
                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    fetchMentors();
    api.get("/mentors/requests/my").then((r) => setMyRequests(r.data)).catch(() => {});
  }, []);

  const fetchMentors = async (q = "") => {
    setLoading(true);
    try {
      const params = q ? `?search=${q}` : "";
      const res = await api.get(`/mentors${params}`);
      setMentors(res.data);
    } catch (err) {
      toast.error("Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const timeout = setTimeout(() => fetchMentors(e.target.value), 400);
    return () => clearTimeout(timeout);
  };

  const handleRequest = async (mentorId, message, goals) => {
    const res = await api.post("/mentors/request", { mentorId, message, goals });
    setMyRequests((prev) => [...prev, res.data]);
  };

  const requestedIds = myRequests.map((r) => r.mentor?._id || r.mentor);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
          <UserCheck size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Find a Mentor</h1>
          <p className="text-text-muted text-sm">Connect with professionals who've been where you want to go</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={search} onChange={handleSearch} className="input-field pl-10"
          placeholder="Search by name or domain..." />
      </div>

      {/* My Requests */}
      {myRequests.length > 0 && (
        <div className="card p-4">
          <h3 className="font-medium text-sm mb-3 text-text-secondary">My Requests</h3>
          <div className="flex flex-wrap gap-2">
            {myRequests.map((r) => (
              <div key={r._id} className="flex items-center gap-2 bg-dark-800 border border-dark-500 rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium">{r.mentor?.name || "Mentor"}</span>
                <span className={r.status === "accepted" ? "badge-green" : r.status === "rejected" ? "text-red-400 text-xs" : "badge-gray"}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Grid */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-36 shimmer" />)}</div>
      ) : mentors.length === 0 ? (
        <div className="card p-10 text-center">
          <UserCheck size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary mb-2">No mentors found</p>
          <p className="text-text-muted text-sm">Mentors will appear here once they register. You can also become a mentor!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mentors.map((mentor) => (
            <MentorCard key={mentor._id} mentor={mentor} onRequest={handleRequest}
              requested={requestedIds.includes(mentor._id)} />
          ))}
        </div>
      )}
    </div>
  );
}