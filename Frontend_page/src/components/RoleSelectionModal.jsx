import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Store, Ticket, ShieldCheck, ArrowRight, X } from "lucide-react";

export default function RoleSelectionModal({ isOpen, onClose, roles = [], user }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const roleOptions = [
    {
      id: "organizer",
      title: "Event Organizer",
      desc: "Manage your events, ticket sales, gate scanner staff, and revenue analytics.",
      icon: Sparkles,
      gradient: "from-cyan-500 via-sky-500 to-blue-600",
      path: "/OrganizerHome",
      enabled: roles.includes("organizer") || user?.organizer_profile || user?.role === "organizer",
    },
    {
      id: "exhibitor",
      title: "Exhibitor & Vendor",
      desc: "View booked stalls, lead capture analytics, and upcoming expo events.",
      icon: Store,
      gradient: "from-emerald-500 to-teal-600",
      path: "/exhibitor/dashboard",
      enabled: roles.includes("exhibitor") || user?.exhibitor_profile || user?.role === "exhibitor",
    },
    {
      id: "user",
      title: "Attendee / Ticket Buyer",
      desc: "Access your booked passes, QR ticket badges, and event history.",
      icon: Ticket,
      gradient: "from-purple-500 to-indigo-600",
      path: "/my-passes",
      enabled: true, // Always accessible to registered users
    },
  ];

  if (roles.includes("admin") || roles.includes("superadmin") || roles.includes("superuser")) {
    roleOptions.unshift({
      id: "admin",
      title: "Super Admin Workspace",
      desc: "System approvals, category master control, KYC verifications & platform payouts.",
      icon: ShieldCheck,
      gradient: "from-purple-600 to-indigo-600",
      path: "/superuser/dashboard",
      enabled: true,
    });
  }

  const handleSelectRole = (path) => {
    onClose();
    navigate(path, { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Choose Your Portal</h2>
            <p className="text-slate-400 text-xs mt-1">Select which active dashboard you would like to access right now.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectRole(opt.path)}
                disabled={!opt.enabled}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                  opt.enabled
                    ? "bg-slate-800/60 border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 hover:scale-[1.01] shadow-md"
                    : "bg-slate-900/40 border-slate-800/40 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${opt.gradient} text-white shadow-md mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
