import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, Map, Mic2, Users, UserCheck, User, LogOut, Menu, X, Zap } from "lucide-react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const navLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/roadmap",   icon: Map,             label: "My Roadmap" },
  { to: "/interview", icon: Mic2,            label: "Mock Interview" },
  { to: "/community", icon: Users,           label: "Community" },
  { to: "/mentors",   icon: UserCheck,       label: "Find Mentors" },
  { to: "/profile",   icon: User,            label: "Profile" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-dark-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-dark-900" />
          </div>
          <span className="font-display text-xl font-semibold text-text-primary">MentorMap</span>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-dark-500">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-dark-900 font-bold text-base flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-sm" style={{color:"#6e7681"}}>{user?.domain || user?.role}</p>
          </div>
          <div className="badge-green text-sm">{user?.totalPoints || 0} pts</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon size={20} />
            <span>{label}</span>
            {to === "/interview" && <span className="ml-auto badge-green" style={{fontSize:"12px",padding:"2px 8px"}}>AI</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-dark-500">
        <button onClick={handleLogout} className="sidebar-link w-full" style={{color:"#f85149"}}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-r border-dark-500 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-68 bg-dark-800 border-r border-dark-500" style={{width:"270px"}}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4" style={{color:"#6e7681"}}>
              <X size={22} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-500">
          <button onClick={() => setSidebarOpen(true)} style={{color:"#8b949e"}}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded flex items-center justify-center">
              <Zap size={14} className="text-dark-900" />
            </div>
            <span className="font-display text-lg font-semibold">MentorMap</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-dark-900 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}