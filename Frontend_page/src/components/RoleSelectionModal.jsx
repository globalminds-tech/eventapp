import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Store, Ticket, ShieldCheck, ArrowRight, X, Compass } from "lucide-react";

export default function RoleSelectionModal({ isOpen, onClose, roles = [], user }) {
  const navigate = useNavigate();

  const isSuper = roles.includes("admin") || roles.includes("superadmin") || roles.includes("superuser");

  React.useEffect(() => {
    if (isOpen && isSuper) {
      onClose();
      navigate("/superuser/dashboard", { replace: true });
    }
  }, [isOpen, isSuper, onClose, navigate]);

  if (!isOpen || isSuper) return null;

  const roleOptions = [
    {
      id: "organizer",
      title: "Event Organizer",
      desc: "Manage your events, ticket sales, gate scanner staff, and revenue analytics.",
      icon: Sparkles,
      gradient: "from-cyan-500 via-sky-500 to-blue-600",
      path: "/OrganizerHome",
      enabled: roles.includes("organizer") || Boolean(user?.profiles?.organizer) || Boolean(user?.organizer_profile),
    },
    {
      id: "exhibitor",
      title: "Exhibitor & Vendor",
      desc: "View booked stalls, lead capture analytics, and upcoming expo events.",
      icon: Store,
      gradient: "from-emerald-500 to-teal-600",
      path: "/exhibitor/dashboard",
      enabled: roles.includes("exhibitor") || Boolean(user?.profiles?.exhibitor) || Boolean(user?.exhibitor_profile),
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

  const handleSelectRole = (path) => {
    onClose();
    navigate(path, { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Choose Your Portal</h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">Select which active dashboard you would like to access right now.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectRole(opt.path)}
                disabled={!opt.enabled}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  opt.enabled
                    ? "bg-slate-50/70 border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 hover:scale-[1.01] shadow-xs"
                    : "bg-slate-50/30 border-slate-100 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${opt.gradient} text-white shadow-md mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">{opt.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            );
          })}

          {/* Escape option — skip workspace selection and browse events */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => handleSelectRole("/")}
              className="w-full text-center py-2.5 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer bg-transparent border border-slate-200 hover:border-sky-300 flex items-center justify-center gap-2 shadow-2xs"
            >
              <Compass className="w-4 h-4" />
              <span>Continue to Event Discovery →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
