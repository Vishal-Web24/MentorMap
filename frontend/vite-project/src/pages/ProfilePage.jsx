// import React from "react";

// const ProfilePage = () => {
//   const user = {
//     name: "John Doe",
//     email: "john@example.com",
//     role: "Full Stack Developer",
//     bio: "Passionate developer building modern web applications and exploring new technologies.",
//     avatar: "https://i.pravatar.cc/150?img=12",
//   };

//   return (
//     <div className="min-h-screen bg-background-primary text-text-primary p-6">
//       <div className="max-w-4xl mx-auto">

//         {/* Header */}
//         <div className="bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-600 flex flex-col md:flex-row items-center gap-6">
          
//           {/* Avatar */}
//           <img
//             src={user.avatar}
//             alt="Profile"
//             className="w-28 h-28 rounded-full border-4 border-dark-500 object-cover"
//           />

//           {/* Info */}
//           <div className="text-center md:text-left">
//             <h1 className="text-2xl font-bold">{user.name}</h1>
//             <p className="text-text-secondary">{user.email}</p>
//             <p className="mt-2 text-sm bg-dark-600 inline-block px-3 py-1 rounded-full">
//               {user.role}
//             </p>
//           </div>
//         </div>

//         {/* Bio Section */}
//         <div className="mt-6 bg-dark-800 rounded-2xl p-6 border border-dark-600">
//           <h2 className="text-lg font-semibold mb-2">About</h2>
//           <p className="text-text-secondary">{user.bio}</p>
//         </div>

//         {/* Stats / Cards */}
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          
//           <div className="bg-dark-800 p-4 rounded-xl border border-dark-600 text-center">
//             <p className="text-2xl font-bold text-brand-400">24</p>
//             <p className="text-text-secondary text-sm">Projects</p>
//           </div>

//           <div className="bg-dark-800 p-4 rounded-xl border border-dark-600 text-center">
//             <p className="text-2xl font-bold text-brand-400">12</p>
//             <p className="text-text-secondary text-sm">Completed</p>
//           </div>

//           <div className="bg-dark-800 p-4 rounded-xl border border-dark-600 text-center">
//             <p className="text-2xl font-bold text-brand-400">5</p>
//             <p className="text-text-secondary text-sm">Ongoing</p>
//           </div>

//         </div>

//         {/* Actions */}
//         <div className="mt-6 flex flex-wrap gap-4">
          
//           <button className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg transition">
//             Edit Profile
//           </button>

//           <button className="border border-dark-500 hover:border-dark-400 hover:bg-dark-600 text-text-secondary hover:text-text-primary px-5 py-2 rounded-lg transition">
//             Logout
//           </button>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default ProfilePage;


import { useState } from "react";
import { User, Save, Github, Linkedin, Award, Briefcase } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const SKILLS_LIST = ["JavaScript", "React", "Node.js", "Python", "Java", "MongoDB", "SQL", "Git", "TypeScript", "Express.js", "Next.js", "Docker", "AWS", "Figma", "C++", "Redux", "GraphQL", "REST APIs"];

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    degree: user?.degree || "",
    domain: user?.domain || "",
    careerGoal: user?.careerGoal || "",
    targetRole: user?.targetRole || "",
    experience: user?.experience || "fresher",
    skills: user?.skills || [],
    linkedIn: user?.linkedIn || "",
    github: user?.github || "",
    mentorProfile: {
      expertise: user?.mentorProfile?.expertise || [],
      yearsOfExperience: user?.mentorProfile?.yearsOfExperience || 0,
      company: user?.mentorProfile?.company || "",
      designation: user?.mentorProfile?.designation || "",
      availableSlots: user?.mentorProfile?.availableSlots || 3,
    },
  });

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handleSave = async () => {
    const res = await updateUser(form);
    if (res.success) toast.success("Profile updated!");
    else toast.error(res.error || "Failed to update");
  };

  const isMentor = user?.role === "mentor" || user?.role === "both";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-dark-600 border border-dark-500 rounded-xl flex items-center justify-center">
          <User size={20} className="text-text-secondary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">My Profile</h1>
          <p className="text-text-muted text-sm">{user?.email}</p>
        </div>
        <div className="ml-auto">
          <span className={`badge ${user?.role === "mentor" ? "badge-purple" : user?.role === "both" ? "badge-orange" : "badge-green"}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Points", value: user?.totalPoints || 0, icon: Award },
          { label: "Streak", value: `${user?.streak || 0} days`, icon: "🔥" },
          { label: "Member Since", value: new Date(user?.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }), icon: Briefcase },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="font-display text-xl font-bold text-brand-400">{s.value}</p>
            <p className="text-text-muted text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <div className="card p-5">
        <h2 className="font-display font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Degree</label>
            <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="input-field" placeholder="B.E. Computer Science" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Domain</label>
            <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="input-field" placeholder="Full-Stack Development" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Target Role</label>
            <input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="input-field" placeholder="MERN Stack Developer" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-text-secondary mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input-field resize-none" rows={3} placeholder="Tell the community about yourself..." />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">LinkedIn</label>
            <div className="relative">
              <Linkedin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                className="input-field pl-9" placeholder="linkedin.com/in/yourname" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">GitHub</label>
            <div className="relative">
              <Github size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })}
                className="input-field pl-9" placeholder="github.com/yourname" />
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-5">
        <h2 className="font-display font-semibold mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {SKILLS_LIST.map((skill) => (
            <button key={skill} type="button" onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${form.skills.includes(skill) ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-dark-500 text-text-muted hover:border-dark-400"}`}>
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Profile */}
      {isMentor && (
        <div className="card p-5 border-purple-500/20">
          <h2 className="font-display font-semibold mb-4">Mentor Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Designation</label>
              <input value={form.mentorProfile.designation}
                onChange={(e) => setForm({ ...form, mentorProfile: { ...form.mentorProfile, designation: e.target.value } })}
                className="input-field" placeholder="Senior Developer" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Company</label>
              <input value={form.mentorProfile.company}
                onChange={(e) => setForm({ ...form, mentorProfile: { ...form.mentorProfile, company: e.target.value } })}
                className="input-field" placeholder="Infosys, TCS, Startup..." />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Years of Experience</label>
              <input type="number" value={form.mentorProfile.yearsOfExperience}
                onChange={(e) => setForm({ ...form, mentorProfile: { ...form.mentorProfile, yearsOfExperience: parseInt(e.target.value) || 0 } })}
                className="input-field" min={0} max={40} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Available Slots / Month</label>
              <input type="number" value={form.mentorProfile.availableSlots}
                onChange={(e) => setForm({ ...form, mentorProfile: { ...form.mentorProfile, availableSlots: parseInt(e.target.value) || 0 } })}
                className="input-field" min={0} max={20} />
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <button onClick={handleSave} disabled={loading} className="btn-primary w-full justify-center py-3">
        <Save size={17} />
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}