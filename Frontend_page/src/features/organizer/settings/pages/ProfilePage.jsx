import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser, setUser } from "@/app/store/userSlice";
import { logout, setCredentials } from "@/app/store/authSlice";
import { performLogout, getUserAvailableRoles, switchWorkspaceRole } from "@/shared/services/authHelper";
import { authApi } from "@/features/auth/api/auth.api";
import {
  User, LogOut, LogIn, Edit3, ArrowLeft, ArrowRight,
  Mail, Phone, Building, Ticket, Key, Store, Calendar,
  Shield, CheckCircle2
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = React.useRef(null);

  const reduxUser = useSelector((state) => state.user);
  const reduxAuth = useSelector((state) => state.auth);

  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const isAuthenticated = Boolean(reduxAuth.isAuthenticated || reduxAuth.accessToken || reduxUser.id);

  // Initialize profile synchronously from all available client memory to prevent button flashing
  const getInitialProfile = () => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    } catch {
      storedUser = null;
    }

    const candidate = {
      ...(storedUser || {}),
      ...(reduxUser || {}),
      ...(reduxAuth?.user || {}),
    };

    const initialRoles = getUserAvailableRoles(candidate);

    return {
      id: candidate.id || sessionStorage.getItem("id") || localStorage.getItem("id") || "",
      name: candidate.name || sessionStorage.getItem("name") || localStorage.getItem("name") || (isAuthenticated ? "User" : "Guest"),
      email: candidate.email || sessionStorage.getItem("email") || localStorage.getItem("email") || (isAuthenticated ? "Not provided" : "Not Signed In"),
      roles: initialRoles,
      active_role: candidate.active_role || candidate.role || sessionStorage.getItem("role") || localStorage.getItem("role") || "user",
      role: candidate.active_role || candidate.role || sessionStorage.getItem("role") || localStorage.getItem("role") || "user",
      mobile: candidate.mobile || sessionStorage.getItem("mobile") || "",
      organization_name: candidate.organization_name || candidate.company_name || sessionStorage.getItem("organization_name") || "",
      profile_image: candidate.profile_image || "",
      profiles: candidate.profiles || storedUser?.profiles || reduxUser?.profiles || {},
      status: isAuthenticated ? "ACTIVE" : "GUEST",
    };
  };

  const [userProfile, setUserProfile] = useState(getInitialProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(() => {
    if (!isAuthenticated) return false;
    const candidate = userProfile || {};
    const roles = candidate.roles || [];
    const hasKnownAccess = roles.length > 1 ||
      Boolean(candidate.profiles?.organizer) ||
      Boolean(candidate.profiles?.exhibitor) ||
      Boolean(candidate.organization_name);
    return !hasKnownAccess;
  });

  useEffect(() => {
    if (isAuthenticated) {
      authApi.getMe()
        .then((res) => {
          const fetched = res?.data?.data || res?.data || res;
          if (fetched && (fetched.id || fetched.email)) {
            const mergedRoles = getUserAvailableRoles(fetched);
            setUserProfile((prev) => {
              const updated = {
                ...prev,
                id: fetched.id || prev.id,
                name: fetched.name || prev.name,
                email: fetched.email || prev.email,
                role: (fetched.active_role || fetched.role || prev.role).toLowerCase(),
                active_role: (fetched.active_role || fetched.role || prev.role).toLowerCase(),
                mobile: fetched.mobile || prev.mobile,
                organization_name: fetched.organization_name || prev.organization_name,
                profile_image: fetched.profile_image || prev.profile_image || "",
                roles: mergedRoles,
                profiles: fetched.profiles || prev.profiles || {},
                status: fetched.status || "ACTIVE",
              };

              localStorage.setItem("user", JSON.stringify(updated));
              sessionStorage.setItem("user", JSON.stringify(updated));
              if (mergedRoles.length > 0) {
                localStorage.setItem("roles", JSON.stringify(mergedRoles));
                sessionStorage.setItem("roles", JSON.stringify(mergedRoles));
              }

              dispatch(setUser(updated));
              dispatch(setCredentials({ user: updated, role: updated.active_role }));
              return updated;
            });
          }
        })
        .catch((err) => {
          console.log("Profile fetch:", err?.message || err);
        })
        .finally(() => {
          setIsProfileLoading(false);
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

  // Workspace Switcher using unified helper with background server persistence and retry
  const handleEnterWorkspace = (targetRole) => {
    switchWorkspaceRole(targetRole, dispatch, navigate);
  };

  const effectiveUser = {
    ...(reduxUser || {}),
    ...(reduxAuth?.user || {}),
    ...userProfile,
  };
  const effectiveRoles = getUserAvailableRoles(effectiveUser);

  const isSuperuser = isAuthenticated && (
    effectiveRoles.includes("superuser") ||
    effectiveRoles.includes("superadmin") ||
    effectiveRoles.includes("admin") ||
    String(userProfile?.active_role || userProfile?.role || "").toLowerCase() === "superadmin" ||
    String(userProfile?.active_role || userProfile?.role || "").toLowerCase() === "superuser" ||
    String(reduxAuth?.role || "").toLowerCase() === "superadmin" ||
    String(reduxAuth?.role || "").toLowerCase() === "superuser"
  );

  useEffect(() => {
    if (isSuperuser) {
      navigate("/superuser/dashboard", { replace: true });
    }
  }, [isSuperuser, navigate]);

  const hasOrganizer = isAuthenticated && !isSuperuser && (
    effectiveRoles.includes("organizer") ||
    Boolean(effectiveUser?.profiles?.organizer?.id) ||
    Boolean(userProfile?.profiles?.organizer?.id)
  );

  const hasExhibitor = isAuthenticated && !isSuperuser && (
    effectiveRoles.includes("exhibitor") ||
    Boolean(effectiveUser?.profiles?.exhibitor?.id) ||
    Boolean(userProfile?.profiles?.exhibitor?.id)
  );

  const getRoleBadge = () => {
    if (!isAuthenticated) return "Public Guest";
    if (isSuperuser) return "Super Administrator";
    if (hasOrganizer && hasExhibitor) return "Organizer & Exhibitor";
    if (hasOrganizer) return "Event Organizer";
    if (hasExhibitor) return "Exhibitor Vendor";
    return "Verified Member";
  };

  if (isSuperuser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          <span className="text-xs font-bold text-slate-700">Redirecting to Super Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20 select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Simple Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <BrandLogo textColor="#0f172a" />
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50/50 hover:text-red-600 text-xs font-semibold text-slate-600 transition cursor-pointer bg-white"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">

        {/* Back Button (Arrow Alone, positioned down in the page) */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 transition flex items-center justify-center cursor-pointer shadow-xs"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* User Identity Card (Clean, Simple Style) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* User Avatar + Details */}
            <div className="flex items-center gap-4">
              <div
                className={`relative shrink-0 ${isAuthenticated ? "cursor-pointer group" : ""}`}
                onClick={() => isAuthenticated && fileInputRef.current?.click()}
                title="Change Photo"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {userProfile.profile_image ? (
                    <img src={userProfile.profile_image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-slate-700">
                      {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User size={22} />}
                    </span>
                  )}
                </div>
                {isAuthenticated && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 hover:text-orange-600 transition">
                    <Edit3 size={10} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900">{userProfile.name}</h1>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    {getRoleBadge()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" />
                    <span>{userProfile.email}</span>
                  </span>
                  {userProfile.mobile && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      <span>{userProfile.mobile}</span>
                    </span>
                  )}
                  {userProfile.organization_name && (
                    <span className="flex items-center gap-1">
                      <Building size={12} className="text-slate-400" />
                      <span>{userProfile.organization_name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <button
                onClick={() => navigate("/my-passes")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition shadow-xs"
              >
                <Ticket size={13} />
                <span>My Passes</span>
              </button>

              <button
                onClick={() => navigate("/reset-password")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition"
              >
                <Key size={13} />
                <span>Password</span>
              </button>
            </div>

          </div>
        </div>

        {/* Section Header */}
        <div className="mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Workspaces
          </h2>
        </div>

        {/* Workspace Cards (Using the simple reference card style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          {/* 1. Organizer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-sky-300 transition">
            <div>
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Event Organizer
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {hasOrganizer ? "Organizer Dashboard" : isProfileLoading ? "Event Organizer" : "Become an Organizer"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {hasOrganizer ? "Active Access" : isProfileLoading ? "Verifying access permissions..." : "Create and manage live events"}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {hasOrganizer ? (
                <button
                  onClick={() => handleEnterWorkspace("organizer")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  <span>Go to Organizer Dashboard</span>
                  <ArrowRight size={13} />
                </button>
              ) : isProfileLoading ? (
                <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100/90 text-slate-400 text-xs font-medium flex items-center justify-center gap-2 animate-pulse">
                  <span>Checking access...</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/upgrade/organizer")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-sky-300 hover:bg-sky-50 text-sky-700 text-xs font-bold cursor-pointer transition"
                >
                  <span>Start Organizer Setup</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 2. Exhibitor Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
            <div>
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Exhibitor Vendor
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Store size={18} />
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {hasExhibitor ? "Exhibitor Portal" : isProfileLoading ? "Exhibitor Vendor" : "Become an Exhibitor"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {hasExhibitor ? "Active Access" : isProfileLoading ? "Verifying access permissions..." : "Reserve stalls at upcoming expos"}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {hasExhibitor ? (
                <button
                  onClick={() => handleEnterWorkspace("exhibitor")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  <span>Go to Exhibitor Portal</span>
                  <ArrowRight size={13} />
                </button>
              ) : isProfileLoading ? (
                <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100/90 text-slate-400 text-xs font-medium flex items-center justify-center gap-2 animate-pulse">
                  <span>Checking access...</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/upgrade/exhibitor")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-700 text-xs font-bold cursor-pointer transition"
                >
                  <span>Start Exhibitor Setup</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer Support Links */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/Help_Center")} className="hover:text-slate-900 bg-transparent border-none cursor-pointer">
              Help Center
            </button>
            <button onClick={() => navigate("/Terms")} className="hover:text-slate-900 bg-transparent border-none cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => navigate("/Cancellation")} className="hover:text-slate-900 bg-transparent border-none cursor-pointer">
              Cancellation Policy
            </button>
          </div>
          <span>BookMyEvent Platform</span>
        </div>

      </main>
    </div>
  );
}
