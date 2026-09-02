import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser, setUser } from "@/app/store/userSlice";
import { logout } from "@/app/store/authSlice";
import { performLogout } from "@/shared/services/authHelper";
import { getUserProfile } from "@/Services/api";
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

  const reduxUser = useSelector((state) => state.user);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const isAuthenticated = Boolean(
    (sessionStorage.getItem("token") || localStorage.getItem("token")) &&
    (reduxUser.id || sessionStorage.getItem("id") || localStorage.getItem("id"))
  );

  const [userProfile, setUserProfile] = useState({
    id: reduxUser.id || sessionStorage.getItem("id") || localStorage.getItem("id") || "",
    name: reduxUser.name || sessionStorage.getItem("name") || localStorage.getItem("name") || (isAuthenticated ? "User" : "Guest Visitor"),
    email: reduxUser.email || sessionStorage.getItem("email") || localStorage.getItem("email") || (isAuthenticated ? "Not provided" : "Not Signed In"),
    role: (reduxUser.role || sessionStorage.getItem("role") || localStorage.getItem("role") || "user").toLowerCase(),
    mobile: reduxUser.mobile || sessionStorage.getItem("mobile") || "",
    organization_name: reduxUser.organization_name || sessionStorage.getItem("organization_name") || "",
    status: isAuthenticated ? "ACTIVE" : "GUEST",
  });

  useEffect(() => {
    const userId = userProfile.id;
    if (userId && isAuthenticated) {
      getUserProfile(userId)
        .then((res) => {
          const fetched = res.data?.data || res.data || res;
          if (fetched && fetched.id) {
            const updated = {
              id: fetched.id,
              name: fetched.name || userProfile.name,
              email: fetched.email || userProfile.email,
              role: (fetched.role || userProfile.role).toLowerCase(),
              mobile: fetched.mobile || userProfile.mobile,
              organization_name: fetched.organization_name || userProfile.organization_name,
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
  }, [userProfile.id, isAuthenticated, dispatch]);

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    performLogout(dispatch, navigate);
  };

  const isSuperuser = isAuthenticated && (userProfile.role === "superuser" || userProfile.role === "superadmin" || userProfile.role === "admin");
  const isOrganizer = isAuthenticated && userProfile.role === "organizer";
  const isExhibitor = isAuthenticated && userProfile.role === "exhibitor";
  const isPublicUser = !isSuperuser && !isOrganizer && !isExhibitor;

  const getBackRoute = () => {
    if (isSuperuser) return "/superuser/dashboard";
    if (isOrganizer) return "/OrganizerHome";
    if (isExhibitor) return "/exhibitor/dashboard";
    return "/";
  };

  const getRoleBadge = () => {
    if (!isAuthenticated) return "🎟️ PUBLIC GUEST";
    if (isSuperuser) return "👑 Super Admin";
    if (isOrganizer) return "🎪 Event Organizer";
    if (isExhibitor) return "🏬 Exhibitor Vendor";
    return "🎟️ Platform Member";
  };

  const accountServicesList = [
    {
      title: "List Your Show & Partner Hub",
      subtitle: "Host events as Organizer or reserve stalls as Exhibitor",
      icon: Sparkles,
      isHighlight: true,
      badge: "PARTNER",
      action: () => setShowPartnerModal(true),
    },
    {
      title: "Help Centre & Support",
      subtitle: "Get assistance for ticketing, gate check-ins & payouts",
      icon: HelpCircle,
      path: "/Help_Center",
    },
    {
      title: "My Rewards & Passports",
      subtitle: "View earned loyalty points & event stamps",
      icon: Gift,
      path: null,
    },
    {
      title: "Offers & Promotional Coupons",
      subtitle: "Available discount codes & early bird vouchers",
      icon: Tag,
      path: null,
    },
    {
      title: "Gift Cards & Credits",
      subtitle: "Manage event voucher gift balances",
      icon: CreditCard,
      path: null,
    },
    {
      title: "Food & Beverage Tokens",
      subtitle: "Active meal passes & pre-booked food vouchers",
      icon: Utensils,
      path: null,
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
      
      {/* Sleek Header Navbar */}
      <header className="bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(getBackRoute())}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              <ArrowLeft size={16} />
              <span>{isPublicUser ? "Back to Events" : "Back to Workspace"}</span>
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
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-1 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-800 font-black text-3xl">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User size={44} className="stroke-[1.5]" />}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 cursor-pointer hover:text-cyan-600 transition">
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
              {/* PUBLIC ATTENDEE ROLE VIEW */}
              {isPublicUser && (
                <>
                  <Card className="border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all bg-gradient-to-br from-white to-cyan-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">My Tickets & Entry Passes</span>
                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-[10px] font-extrabold">PASSES</Badge>
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

                  <Card className="border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all bg-gradient-to-br from-white to-emerald-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Discover Live Events</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-extrabold">DISCOVER</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Browse music concerts, tech expos, food carnivals, and cultural shows.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/")}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <Compass size={14} />
                        <span>Discover Events</span>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ORGANIZER ROLE VIEW */}
              {isOrganizer && (
                <>
                  <Card className="border-slate-200/80 shadow-xs hover:border-amber-300 transition-all bg-gradient-to-br from-white to-amber-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Account KYC & Legal GST</span>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-extrabold">VERIFICATION</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Manage business GSTIN, PAN details, entity type, and registered office address.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/register/organizer?step=2")}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <span>Update Legal & KYC Details</span>
                        <ArrowUpRight size={14} />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all bg-gradient-to-br from-white to-cyan-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Bank Payout & Settlement Setup</span>
                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-[10px] font-extrabold">PAYOUTS</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Update bank account number, IFSC code, and instant UPI settlement preference.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/register/organizer?step=3")}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <Landmark size={14} />
                        <span>Update Bank Account & Payouts</span>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-indigo-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Gate Scanner Staff</span>
                        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] font-extrabold">OPERATIONAL</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Turnstiles & QR scanners ready for attendee validation.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/OrganizerHome/EventCheckIn")}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <QrCode size={14} />
                        <span>Gate Scanner Control</span>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* EXHIBITOR ROLE VIEW */}
              {isExhibitor && (
                <>
                  <Card className="border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all bg-gradient-to-br from-white to-emerald-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">GSTIN & Tax Invoices</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-extrabold">TAX PROFILE</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Manage vendor business GSTIN and download stall tax invoices.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/register/exhibitor?step=2")}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <span>Update Vendor Profile</span>
                        <ArrowUpRight size={14} />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all bg-gradient-to-br from-white to-cyan-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Bank Payout & Vendor Settlement</span>
                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-[10px] font-extrabold">PAYOUTS</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Manage bank account details for refund settlements & vendor payouts.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/register/exhibitor?step=3")}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <Landmark size={14} />
                        <span>Update Bank Payout Setup</span>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all bg-gradient-to-br from-white to-cyan-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">My Booth Reservations</span>
                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-[10px] font-extrabold">STALL PASSES</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        View booth numbers, floor layout plans, and badge passes.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/exhibitor/my-bookings")}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <Store size={14} />
                        <span>View Stall Bookings</span>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* SUPERUSER ROLE VIEW */}
              {isSuperuser && (
                <>
                  <Card className="border-slate-200/80 shadow-xs hover:border-purple-300 transition-all bg-gradient-to-br from-white to-purple-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Event Approvals Queue</span>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-extrabold">ADMIN</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Review organizer submitted event details and publish events live.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/superuser/dashboard?tab=approvals")}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <UserCheck size={14} />
                        <span>Approvals Queue</span>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-indigo-50/20">
                    <CardContent className="p-4.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Category Master</span>
                        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] font-extrabold">MASTER</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Manage categories/subcategories and bulk import Excel templates.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/superuser/dashboard?tab=categories")}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 rounded-xl border-none cursor-pointer gap-1.5"
                      >
                        <Landmark size={14} />
                        <span>Category Master</span>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
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
