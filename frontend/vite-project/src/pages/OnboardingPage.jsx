import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Zap, CheckCircle } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const DOMAINS = ["Full-Stack Development", "Frontend Development", "Backend Development", "Data Science", "DevOps / Cloud", "Mobile Development", "UI/UX Design", "Cybersecurity", "Machine Learning", "Product Management"];
const SKILLS_LIST = ["JavaScript", "React", "Node.js", "Python", "Java", "MongoDB", "SQL", "Git", "TypeScript", "Express.js", "Next.js", "Docker", "AWS", "Figma", "C++"];
const GOALS = ["Get my first job", "Switch careers", "Get a promotion", "Freelance", "Start a startup", "Get into a top company"];

const steps = ["Basic Info", "Your Skills", "Career Goal", "Done 🎉"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    degree: "", experience: "fresher", domain: "", bio: "",
    skills: [], careerGoal: "", targetRole: "", linkedIn: "", github: "",
  });
  const { updateUser, loading, user } = useAuthStore();
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handleFinish = async () => {
    if (!form.degree || !form.domain || !form.careerGoal || !form.targetRole) {
      return toast.error("Please fill in all required fields");
    }
    const res = await updateUser(form);
    if (res.success) {
      toast.success("Profile set up! Let's build your roadmap.");
      navigate("/dashboard");
    } else {
      toast.error(res.error || "Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 dot-grid">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-dark-900" />
            </div>
            <span className="font-display font-semibold">MentorMap</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Set up your profile</h1>
          <p className="text-text-muted text-sm">Step {step + 1} of {steps.length}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= step ? "bg-brand-500" : "bg-dark-500"}`} />
          ))}
        </div>

        <div className="card p-7">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="font-display text-xl font-semibold mb-5">Tell us about yourself</h2>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Degree / Qualification *</label>
                <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  className="input-field" placeholder="e.g. B.E. Electrical Engineering, MCA, BCA" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Domain *</label>
                <select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="input-field">
                  <option value="">Select your target domain</option>
                  {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["fresher", "0-1yr", "1-3yr"].map((e) => (
                    <button key={e} type="button" onClick={() => setForm({ ...form, experience: e })}
                      className={`py-2 rounded-lg text-sm border transition-all ${form.experience === e ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-dark-500 text-text-muted"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Short Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input-field resize-none" rows={3} placeholder="A quick intro about yourself..." />
              </div>
            </div>
          )}

          {/* Step 1: Skills */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="font-display text-xl font-semibold mb-2">What skills do you have?</h2>
              <p className="text-text-muted text-sm mb-5">Select all that apply (or skip if fresher)</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_LIST.map((skill) => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      form.skills.includes(skill) ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-dark-500 text-text-muted hover:border-dark-400"
                    }`}>
                    {form.skills.includes(skill) && <CheckCircle size={12} className="inline mr-1" />}
                    {skill}
                  </button>
                ))}
              </div>
              <p className="text-text-muted text-xs mt-4">{form.skills.length} skill{form.skills.length !== 1 ? "s" : ""} selected</p>
            </div>
          )}

          {/* Step 2: Career Goal */}
          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="font-display text-xl font-semibold mb-5">What's your career goal?</h2>
              <div>
                <label className="block text-sm text-text-secondary mb-2">My primary goal is to *</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, careerGoal: g })}
                      className={`py-2.5 px-3 rounded-lg text-sm border text-left transition-all ${form.careerGoal === g ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-dark-500 text-text-muted hover:border-dark-400"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Target Role / Job Title *</label>
                <input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  className="input-field" placeholder="e.g. Full-Stack Developer, Data Analyst" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">LinkedIn</label>
                  <input value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                    className="input-field" placeholder="linkedin.com/in/..." />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">GitHub</label>
                  <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })}
                    className="input-field" placeholder="github.com/..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center py-4 animate-slide-up">
              <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-brand-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">You're all set, {user?.name?.split(" ")[0]}!</h2>
              <p className="text-text-secondary mb-2">Your profile is ready. Now let's generate your personalized AI career roadmap.</p>
              <div className="mt-4 p-4 bg-dark-800 rounded-xl border border-dark-500 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Domain</span>
                  <span className="text-text-primary font-medium">{form.domain}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Target Role</span>
                  <span className="text-text-primary font-medium">{form.targetRole}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Skills</span>
                  <span className="text-text-primary font-medium">{form.skills.length || 0} added</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary">
                {step === 2 ? "Review" : "Continue"} <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading} className="btn-primary">
                {loading ? "Saving..." : <>Go to Dashboard <ArrowRight size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}