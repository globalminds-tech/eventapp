import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser, setUser } from "@/app/store/userSlice";
import { logout } from "@/app/store/authSlice";
import { performLogout } from "@/shared/services/authHelper";
import { getUserProfile } from "@/Services/api";
import { authApi } from "@/features/auth/api/auth.api";
import {
  HelpCircle, Gift, Tag, CreditCard, Utensils,
  Home, Settings, Shield, Store, Share2, ThumbsUp,
  FileText, User, LogOut, LogIn, ChevronRight, Edit3,
  ArrowLeft, Info, ArrowUpRight, Sparkles, Mail, Phone, Building, CheckCircle2,
  Ticket, Compass, QrCode, UserCheck, Landmark, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = React.useRef(null);

  const reduxUser = useSelector((state) => state.user);
  const reduxAuth = useSelector((state) => state.auth);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const isAuthenticated = Boolean(reduxAuth.isAuthenticated || reduxAuth.accessToken || reduxUser.id);

  const [userProfile, setUserProfile] = useState({
    id: reduxUser.id || sessionStorage.getItem("id") || localStorage.getItem("id") || "",
    name: reduxUser.name || sessionStorage.getItem("name") || localStorage.getItem("name") || (isAuthenticated ? "User" : "Guest Visitor"),
    email: reduxUser.email || sessionStorage.getItem("email") || localStorage.getItem("email") || (isAuthenticated ? "Not provided" : "Not Signed In"),
    role: (reduxUser.role || sessionStorage.getItem("role") || localStorage.getItem("role") || "user").toLowerCase(),
    mobile: reduxUser.mobile || sessionStorage.getItem("mobile") || "",
    organization_name: reduxUser.organization_name || sessionStorage.getItem("organization_name") || "",
    profile_image: reduxUser.profile_image || "",
    status: isAuthenticated ? "ACTIVE" : "GUEST",
  });

  useEffect(() => {
    if (isAuthenticated) {
      authApi.getMe()
        .then((res) => {
          const fetched = res.data || res;
          if (fetched && (fetched.id || fetched.email)) {
            const updated = {
              id: fetched.id || userProfile.id,
              name: fetched.name || userProfile.name,
              email: fetched.email || userProfile.email,
              role: (fetched.role || userProfile.role).toLowerCase(),
              mobile: fetched.mobile || userProfile.mobile,
              organization_name: fetched.organization_name || userProfile.organization_name,
              profile_image: fetched.profile_image || userProfile.profile_image || "",
              roles: fetched.roles || [userProfile.role],
              profiles: fetched.profiles || {},
              status: fetched.status || "ACTIVE",
            };
            setUserProfile(updated);
            dispatch(setUser(updated));
          }
        })
        .catch((err) => {
          console.log("Profile API fetch note:", err?.message || err);
        });
    }
  }, [isAuthenticated, dispatch]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, WEBP, GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be under 5MB");
      return;
    }

    setIsAvatarUploading(true);
    try {
      const res = await authApi.uploadAvatar(file);
      const newUrl = res?.data?.profile_image || res?.url;
      if (newUrl) {
        setUserProfile((prev) => ({ ...prev, profile_image: newUrl }));
        dispatch(setUser({ ...userProfile, profile_image: newUrl }));
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert(err?.response?.data?.detail || err?.message || "Failed to upload profile photo");
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    performLogout(dispatch, navigate);
  };

  const hasOrganizer = isAuthenticated && (
    userProfile.role === "organizer" ||
    Boolean(userProfile.profiles?.organizer) ||
    (Array.isArray(userProfile.roles) && userProfile.roles.includes("organizer"))
  );

  const hasExhibitor = isAuthenticated && (
    userProfile.role === "exhibitor" ||
    Boolean(userProfile.profiles?.exhibitor) ||
    (Array.isArray(userProfile.roles) && userProfile.roles.includes("exhibitor"))
  );

  const isSuperuser = isAuthenticated && (
    userProfile.role === "superuser" ||
    userProfile.role === "superadmin" ||
    userProfile.role === "admin"
  );

  const isPublicUser = !isSuperuser && !hasOrganizer && !hasExhibitor;

  const getRoleBadge = () => {
    if (!isAuthenticated) return "🎟️ PUBLIC GUEST";
    if (isSuperuser) return "👑 Super Admin";
    if (hasOrganizer && hasExhibitor) return "🎪 Organizer & Vendor";
    if (hasOrganizer) return "🎪 Event Organizer";
    if (hasExhibitor) return "🏬 Exhibitor Vendor";
    return "🎟️ Platform Member";
  };

  const accountServicesList = [
    {
      title: "Help Centre & Support",
      subtitle: "Get assistance for ticketing, gate check-ins & payouts",
      icon: HelpCircle,
      path: "/Help_Center",
    },
    {
      title: "Terms, Conditions & Privacy",
      subtitle: "Platform policies & cancellation terms",
      icon: FileText,
      path: "/Terms",
    },
  ];

  const handleRowClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    } else {
      alert(`${item.title} feature coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-10 select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Sleek Header Navbar */}
      <header className="bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              <Home size={16} className="text-cyan-600" />
              <span>Back to User Home</span>
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <h1 className="text-base font-black text-slate-900 uppercase tracking-wider">Account Control Panel</h1>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-extrabold text-xs rounded-xl cursor-pointer bg-transparent transition-all shadow-xs"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-105 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/20"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Full-Width Grid Content */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Identity & Support (lg:col-span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
            
            {/* Avatar */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-1 shadow-md flex items-center justify-center overflow-hidden">
                {userProfile.profile_image ? (
                  <img src={userProfile.profile_image} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-800 font-black text-3xl">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User size={44} className="stroke-[1.5]" />}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 cursor-pointer hover:text-cyan-600 transition" title="Upload Profile Photo">
                <Edit3 size={14} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mt-4 leading-none">{userProfile.name}</h2>
            <p className="text-cyan-700 font-bold text-xs uppercase tracking-widest mt-2 px-3.5 py-1 bg-cyan-50 border border-cyan-200/60 rounded-full">
              {getRoleBadge()}
            </p>

            <div className="w-full h-px bg-slate-100 my-5" />

            {/* Account Details */}
            <div className="w-full space-y-2.5 text-left">
              <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <Mail size={16} className="text-cyan-600 shrink-0" />
                <div className="truncate min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Email Address</span>
                  <span className="font-extrabold text-slate-800 truncate block">{userProfile.email}</span>
                </div>
              </div>

              {userProfile.mobile && (
                <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <Phone size={16} className="text-emerald-600 shrink-0" />
                  <div className="truncate min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Mobile Contact</span>
                    <span className="font-extrabold text-slate-800">{userProfile.mobile}</span>
                  </div>
                </div>
              )}

              {userProfile.organization_name && (
                <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <Building size={16} className="text-indigo-600 shrink-0" />
                  <div className="truncate min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Organization / Business</span>
                    <span className="font-extrabold text-slate-800">{userProfile.organization_name}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className={isAuthenticated ? "text-emerald-500" : "text-amber-500"} />
                  <span className="font-bold text-slate-700">Account ID #{userProfile.id || "N/A"}</span>
                </div>
                <Badge className={`${isAuthenticated ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"} text-[10px] font-extrabold`}>
                  {userProfile.status}
                </Badge>
              </div>

              {!isAuthenticated && (
                <div className="pt-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black text-xs py-2.5 rounded-xl border-none cursor-pointer shadow-md shadow-cyan-500/20 hover:brightness-105 transition"
                  >
                    Sign In to Your Account →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Assistance & Support */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md">
            <h3 className="font-extrabold text-sm mb-1.5 flex items-center gap-2">
              <Info size={16} className="text-cyan-400" />
              Need Assistance?
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Have questions regarding event tickets, QR code check-ins, or partner onboarding? Reach out to support.
            </p>
            <button
              onClick={() => navigate("/Help_Center")}
              className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </section>

        {/* Right Column: Actions & Services (lg:col-span-8) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Role-Scoped Action Items Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {isPublicUser ? "Attendee Shortcuts & Discovery" : "Workspace Action Items"}
              </h3>
              <span className="bg-cyan-100 text-cyan-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-cyan-200">
                {isPublicUser ? "MEMBER HUB" : "OPERATIONS"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. ACTIVE WORKSPACE CARDS */}

              {/* Organizer Active Workspace */}
              {hasOrganizer && (
                <Card className="border-cyan-300 shadow-md hover:border-cyan-500 transition-all bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-white border-2 col-span-1 sm:col-span-2">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Event Organizer Workspace</h4>
                          <p className="text-[11px] text-slate-500">Manage published shows, event check-in scanner & payouts</p>
                        </div>
                      </div>
                      <Badge className="bg-cyan-500 text-white text-[9px] font-black uppercase">ORGANIZER</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => navigate("/OrganizerHome")}
                        className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-105 text-white font-extrabold text-xs py-2 px-4 rounded-xl border-none cursor-pointer gap-1.5 shadow-md shadow-cyan-500/20 flex-1"
                      >
                        <Sparkles size={14} />
                        <span>Go to Organizer Dashboard →</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/upgrade/organizer")}
                        className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl border border-slate-200 cursor-pointer gap-1"
                      >
                        <span>Update KYC Details</span>
                        <ArrowUpRight size={13} />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/OrganizerHome/EventCheckIn")}
                        className="bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs py-2 px-3 rounded-xl border border-indigo-200 cursor-pointer gap-1"
                      >
                        <QrCode size={13} />
                        <span>Gate Scanner</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Exhibitor Active Workspace */}
              {hasExhibitor && (
                <Card className="border-emerald-300 shadow-md hover:border-emerald-500 transition-all bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-2 col-span-1 sm:col-span-2">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md">
                          <Store size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Exhibitor Vendor Portal</h4>
                          <p className="text-[11px] text-slate-500">Manage stall bookings, booth badges & visitor lead scans</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-[9px] font-black uppercase">EXHIBITOR</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => navigate("/exhibitor/dashboard")}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-extrabold text-xs py-2 px-4 rounded-xl border-none cursor-pointer gap-1.5 shadow-md shadow-emerald-600/20 flex-1"
                      >
                        <Store size={14} />
                        <span>Go to Exhibitor Portal →</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/exhibitor/my-bookings")}
                        className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl border border-slate-200 cursor-pointer gap-1"
                      >
                        <span>My Stall Bookings</span>
                        <ArrowUpRight size={13} />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/upgrade/exhibitor")}
                        className="bg-white hover:bg-slate-50 text-emerald-700 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-200 cursor-pointer gap-1"
                      >
                        <span>Update Vendor Profile</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Superuser Active Workspace */}
              {isSuperuser && (
                <Card className="border-purple-300 shadow-md hover:border-purple-500 transition-all bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white border-2 col-span-1 sm:col-span-2">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Super Admin Control Center</h4>
                          <p className="text-[11px] text-slate-500">Approve event submissions, verify KYC & manage categories</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-600 text-white text-[9px] font-black uppercase">SUPER ADMIN</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => navigate("/superuser/dashboard")}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 text-white font-extrabold text-xs py-2 px-4 rounded-xl border-none cursor-pointer gap-1.5 shadow-md shadow-purple-600/20 flex-1"
                      >
                        <UserCheck size={14} />
                        <span>Go to Admin Dashboard →</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* 2. PARTNER UPGRADE OPPORTUNITIES */}

              {/* Upgrade to Organizer (if not an organizer yet) */}
              {!hasOrganizer && (
                <Card className="border-cyan-200 shadow-xs hover:border-cyan-400 transition-all bg-gradient-to-br from-white to-cyan-50/30">
                  <CardContent className="p-4.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Sparkles size={16} className="text-cyan-600" />
                        <span>Become an Event Organizer</span>
                      </span>
                      <Badge className="bg-cyan-500 text-white text-[9px] font-black uppercase">KYC VERIFIED</Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Host concerts, tech summits & festivals. Verify business KYC to publish events and sell passes.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate(isAuthenticated ? "/upgrade/organizer" : "/login")}
                      className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-105 text-white font-extrabold text-xs py-2 rounded-xl border-none cursor-pointer gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <span>Become an Organizer →</span>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Upgrade to Exhibitor (if not an exhibitor yet) */}
              {!hasExhibitor && (
                <Card className="border-emerald-200 shadow-xs hover:border-emerald-400 transition-all bg-gradient-to-br from-white to-emerald-50/30">
                  <CardContent className="p-4.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Store size={16} className="text-emerald-600" />
                        <span>Become an Exhibitor Vendor</span>
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[9px] font-black uppercase">KYC VERIFIED</Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Reserve vendor booth spaces, showcase products & connect with attendees at upcoming expos.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate(isAuthenticated ? "/upgrade/exhibitor" : "/login")}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-extrabold text-xs py-2 rounded-xl border-none cursor-pointer gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <span>Become an Exhibitor →</span>
                    </Button>
                  </CardContent>
                </Card>
              )}


              {/* 3. ATTENDEE SHORTCUTS */}

              <Card className="border-slate-200/80 shadow-xs hover:border-slate-300 transition-all bg-gradient-to-br from-white to-slate-50/50">
                <CardContent className="p-4.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Ticket size={15} className="text-cyan-600" />
                      <span>My Booked Passes</span>
                    </span>
                    <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[9px] font-extrabold">PASSES</Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    View confirmed event passes and digital QR codes for entrance check-in.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate(isAuthenticated ? "/my-passes" : "/login")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                  >
                    <Ticket size={14} />
                    <span>{isAuthenticated ? "View My Passes" : "Sign In to View Passes"}</span>
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Unified Account Services Directory */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Account Services & Partner Hub
            </h3>
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {accountServicesList.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleRowClick(item)}
                    className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors ${
                      item.isHighlight
                        ? "bg-gradient-to-r from-cyan-50/80 via-sky-50/50 to-white hover:bg-cyan-100/50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.isHighlight ? "bg-cyan-500 text-white shadow-xs" : "bg-slate-100 text-slate-600"
                      }`}>
                        <Icon size={18} className="stroke-[2.2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-extrabold ${item.isHighlight ? "text-cyan-950 font-black" : "text-slate-800"}`}>
                            {item.title}
                          </h4>
                          {item.badge && (
                            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-[9px] font-extrabold">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`shrink-0 ${item.isHighlight ? "text-cyan-600" : "text-slate-400"}`} />
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      </main>

      {/* Streamlined Partner Onboarding Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPartnerModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition"
            >
              <X size={18} />
            </button>

            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 font-extrabold text-[11px] uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                <span>Partner Network</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Become a Partner</h2>
              <p className="text-xs text-slate-500 mt-1">Host live events or exhibit products with BookMyEvent.</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => { setShowPartnerModal(false); navigate("/register/partner"); }}
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-105 text-white font-black text-xs py-3.5 rounded-2xl border-none cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <span>Register as Partner →</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => { setShowPartnerModal(false); navigate("/login"); }}
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold text-xs py-2.5 rounded-2xl cursor-pointer"
              >
                <span>Already Registered? Sign In</span>
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
