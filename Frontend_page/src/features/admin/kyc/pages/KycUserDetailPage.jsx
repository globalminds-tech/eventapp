import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Store,
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Check,
  X,
  Copy,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  FileText,
  ExternalLink,
  Layers,
  AlertTriangle,
  RefreshCw,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { userApi } from "@/features/users/api/user.api";
import { kycApi } from "@/features/admin/kyc/api/kyc.api";
import { useDispatch } from "react-redux";
import { updateKycStatusInStore, fetchKycUsersThunk } from "@/app/store/adminSlice";

export default function KycUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUserById(userId);
      const data = res?.data || res || null;
      setUserData(data);
    } catch (err) {
      console.error("Failed to load user KYC details:", err);
      showNotification("Failed to load user profile. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showNotification(`Copied ${fieldName} to clipboard!`, "success");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateKycStatus = async (targetRole, newStatus) => {
    setActionLoading(true);
    try {
      await kycApi.updateKycStatus(userId, newStatus, targetRole);
      dispatch(updateKycStatusInStore({ userId, status: newStatus, role: targetRole }));
      dispatch(fetchKycUsersThunk({ force: true }));

      // Optimistically update local view
      setUserData((prev) => {
        if (!prev) return null;
        const updated = { ...prev };
        if (targetRole === "organizer") {
          updated.organizer_kyc = newStatus;
          if (updated.organizer_profile) updated.organizer_profile.kyc_status = newStatus;
        } else if (targetRole === "exhibitor") {
          updated.exhibitor_kyc = newStatus;
          if (updated.exhibitor_profile) updated.exhibitor_profile.kyc_status = newStatus;
        } else {
          updated.organizer_kyc = newStatus;
          updated.exhibitor_kyc = newStatus;
          updated.kyc_status = newStatus;
          if (updated.organizer_profile) updated.organizer_profile.kyc_status = newStatus;
          if (updated.exhibitor_profile) updated.exhibitor_profile.kyc_status = newStatus;
        }
        return updated;
      });

      const roleLabel = targetRole === "both" ? "All Profiles" : targetRole ? `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} Profile` : "Profile";
      showNotification(`${roleLabel} KYC status updated to ${newStatus}!`, "success");
    } catch (err) {
      console.error("KYC update error:", err);
      showNotification(err?.response?.data?.detail || "Failed to update KYC status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <Card className="rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">User Account Not Found</h2>
        <p className="text-xs text-slate-500">The requested user profile could not be loaded or does not exist.</p>
        <Button onClick={() => navigate("/superuser/kyc")} variant="outline" className="text-xs font-bold gap-2">
          <ArrowLeft size={14} /> Return to Directory
        </Button>
      </div>
    );
  }

  const roles = Array.isArray(userData.roles) ? userData.roles.map((r) => String(r).toLowerCase()) : [(userData.active_role || userData.role || "user").toLowerCase()];
  const isOrg = userData.is_organizer ?? roles.includes("organizer");
  const isExh = userData.is_exhibitor ?? roles.includes("exhibitor");
  const isCommonUser = userData.is_common_user ?? (!isOrg && !isExh);

  const orgKyc = (userData.organizer_kyc || userData.organizer_profile?.kyc_status || (isOrg ? userData.kyc_status : null) || "PENDING").toUpperCase();
  const exhKyc = (userData.exhibitor_kyc || userData.exhibitor_profile?.kyc_status || (isExh ? userData.kyc_status : null) || "PENDING").toUpperCase();

  const isOverallVerified = isCommonUser ? true : (isOrg && isExh) ? (orgKyc === "VERIFIED" && exhKyc === "VERIFIED") : isOrg ? orgKyc === "VERIFIED" : exhKyc === "VERIFIED";

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const orgProfile = userData.organizer_profile || {};
  const exhProfile = userData.exhibitor_profile || {};
  const events = Array.isArray(userData.events) ? userData.events : [];
  const stalls = Array.isArray(userData.stall_bookings) ? userData.stall_bookings : [];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto select-none font-sans text-slate-800">
      {/* ── Breadcrumb & Top Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/superuser/kyc")}
          className="gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl cursor-pointer w-fit border-slate-200"
        >
          <ArrowLeft size={14} /> Back to Users &amp; Organization Directory
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchUserDetails}
            disabled={loading || actionLoading}
            className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer border-slate-200"
          >
            <RefreshCw size={13} className={actionLoading ? "animate-spin text-purple-600" : "text-slate-500"} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Toast Notification Banner ── */}
      {toast && (
        <div className="p-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg shadow-purple-500/20 animate-in fade-in slide-in-from-top-2">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Executive Profile Header Card ── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <div className="p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4.5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/25 shrink-0">
              {getInitials(userData.name)}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {userData.name}
                </h1>

                {/* Status Pill Component (Zero Emojis) */}
                {isCommonUser ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200">
                    <User size={12} className="text-slate-500" />
                    <span>Attendee • KYC Not Required</span>
                  </span>
                ) : isOverallVerified ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>KYC Verified</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/90 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <Clock size={13} className="text-amber-600" />
                    <span>KYC Verification Pending</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 font-mono text-slate-600">
                  <Mail size={12} className="text-slate-400" /> {userData.email}
                </span>
                {userData.mobile && userData.mobile !== "N/A" && (
                  <span className="flex items-center gap-1 font-mono text-slate-600">
                    <Phone size={12} className="text-slate-400" /> {userData.mobile}
                  </span>
                )}
                {userData.created_at && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} className="text-slate-400" /> Registered {userData.created_at.slice(0, 10)}
                  </span>
                )}
              </div>

              {/* Roles Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {isCommonUser && (
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-extrabold text-[10px] gap-1 py-0.5">
                    <User size={11} className="text-slate-500" /> Public Attendee
                  </Badge>
                )}
                {isOrg && (
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-200 font-extrabold text-[10px] gap-1 py-0.5">
                    <Building2 size={11} className="text-cyan-600" /> Event Organizer
                  </Badge>
                )}
                {isExh && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold text-[10px] gap-1 py-0.5">
                    <Store size={11} className="text-emerald-600" /> Expo Exhibitor
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          {!isCommonUser && (
            <div className="flex flex-wrap items-center gap-2 md:self-center">
              {isOrg && isExh ? (
                <>
                  {!isOverallVerified && (
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateKycStatus("both", "VERIFIED")}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs cursor-pointer border-none shadow-md shadow-purple-500/20 h-9 rounded-xl gap-1.5"
                    >
                      <ShieldCheck size={14} /> Approve All KYC
                    </Button>
                  )}
                  {orgKyc !== "VERIFIED" && (
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateKycStatus("organizer", "VERIFIED")}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer border-none shadow-xs h-9 rounded-xl gap-1"
                    >
                      <Building2 size={13} /> Approve Org
                    </Button>
                  )}
                  {exhKyc !== "VERIFIED" && (
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateKycStatus("exhibitor", "VERIFIED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer border-none shadow-xs h-9 rounded-xl gap-1"
                    >
                      <Store size={13} /> Approve Exh
                    </Button>
                  )}
                  {isOverallVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() => handleUpdateKycStatus("both", "PENDING")}
                      className="text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-xs cursor-pointer h-9 rounded-xl"
                    >
                      Revert to Pending
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {(isOrg ? orgKyc : exhKyc) !== "VERIFIED" ? (
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateKycStatus(isOrg ? "organizer" : "exhibitor", "VERIFIED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer border-none shadow-md shadow-emerald-500/20 h-9 rounded-xl gap-1.5 px-4"
                    >
                      <ShieldCheck size={14} /> Approve KYC Verification
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() => handleUpdateKycStatus(isOrg ? "organizer" : "exhibitor", "PENDING")}
                      className="text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-xs cursor-pointer h-9 rounded-xl gap-1"
                    >
                      <Clock size={13} /> Mark as Pending Review
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ── KPI Metric Summary ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Account Type</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
            {isOrg && isExh ? "Dual-Role Partner" : isOrg ? "Event Organizer" : isExh ? "Exhibitor Partner" : "Attendee Member"}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {isOrg && isExh ? "Organizer + Exhibitor Active" : "Single Portal Profile"}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Organizer KYC</div>
          <div className="text-base sm:text-lg font-black mt-1 flex items-center gap-1.5">
            {isOrg ? (
              <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
                orgKyc === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {orgKyc === "VERIFIED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {orgKyc}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-bold">Not Enabled</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {isOrg ? "Required to publish live events" : "No organizer profile"}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Exhibitor KYC</div>
          <div className="text-base sm:text-lg font-black mt-1 flex items-center gap-1.5">
            {isExh ? (
              <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
                exhKyc === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {exhKyc === "VERIFIED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {exhKyc}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-bold">Not Enabled</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {isExh ? "Required to confirm stall booking" : "No exhibitor profile"}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Activity Footprint</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
            {events.length} {events.length === 1 ? "Event" : "Events"} • {stalls.length} {stalls.length === 1 ? "Stall" : "Stalls"}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Registered on platform
          </div>
        </Card>
      </div>

      {/* ── Business & Banking Inspection Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Legal Business Identity & GST */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="p-4.5 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Business &amp; Legal Identity</h3>
                <p className="text-[10px] text-slate-400 font-medium">Registered business entities and tax IDs</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-bold text-[10px]">
              Tax ID Compliance
            </Badge>
          </div>

          <CardContent className="p-5 sm:p-6 space-y-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company / Entity Name</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {userData.company_name || orgProfile.company_name || exhProfile.company_name || "Individual / Not Provided"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* GSTIN */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">GSTIN</span>
                  {(orgProfile.gstin || exhProfile.gstin) && (
                    <button
                      onClick={() => copyToClipboard(orgProfile.gstin || exhProfile.gstin, "GSTIN")}
                      className="text-slate-400 hover:text-cyan-700 p-0.5 border-none bg-transparent cursor-pointer"
                      title="Copy GSTIN"
                    >
                      {copiedField === "GSTIN" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
                <div className="font-mono text-xs font-bold text-slate-800">
                  {orgProfile.gstin || exhProfile.gstin || "Not Registered"}
                </div>
              </div>

              {/* PAN Number */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Business PAN</span>
                  {(orgProfile.pan_number || exhProfile.pan_number) && (
                    <button
                      onClick={() => copyToClipboard(orgProfile.pan_number || exhProfile.pan_number, "PAN")}
                      className="text-slate-400 hover:text-cyan-700 p-0.5 border-none bg-transparent cursor-pointer"
                      title="Copy PAN"
                    >
                      {copiedField === "PAN" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
                <div className="font-mono text-xs font-bold text-slate-800">
                  {orgProfile.pan_number || exhProfile.pan_number || "Not Provided"}
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 font-medium bg-cyan-50/40 p-3 rounded-xl border border-cyan-100">
              <div className="flex items-center gap-1.5 font-bold text-cyan-900 text-[11px] mb-1">
                <ShieldCheck size={13} className="text-cyan-700" /> Dual-Role Pre-fill Verification
              </div>
              GST and PAN data are pre-filled upon role elevation and remain independently editable per organization profile.
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Payout Banking & Settlement Coordinates */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="p-4.5 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Banking &amp; Settlement Payouts</h3>
                <p className="text-[10px] text-slate-400 font-medium">Bank coordinates for ticket and stall settlements</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-bold text-[10px]">
              Direct Bank Payout
            </Badge>
          </div>

          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Number */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Number</span>
                  {(orgProfile.account_number || exhProfile.account_number) && (
                    <button
                      onClick={() => copyToClipboard(orgProfile.account_number || exhProfile.account_number, "Account Number")}
                      className="text-slate-400 hover:text-emerald-700 p-0.5 border-none bg-transparent cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedField === "Account Number" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
                <div className="font-mono text-xs font-extrabold text-slate-900">
                  {orgProfile.account_number || exhProfile.account_number || "Not Configured"}
                </div>
              </div>

              {/* IFSC Code */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">IFSC Code</span>
                  {(orgProfile.ifsc_code || exhProfile.ifsc_code) && (
                    <button
                      onClick={() => copyToClipboard(orgProfile.ifsc_code || exhProfile.ifsc_code, "IFSC Code")}
                      className="text-slate-400 hover:text-emerald-700 p-0.5 border-none bg-transparent cursor-pointer"
                      title="Copy IFSC Code"
                    >
                      {copiedField === "IFSC Code" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
                <div className="font-mono text-xs font-extrabold text-slate-900">
                  {orgProfile.ifsc_code || exhProfile.ifsc_code || "Not Configured"}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Settlement Verification</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {(orgProfile.account_number && orgProfile.ifsc_code) ? "Verified Banking Coordinates" : "Banking details pending setup"}
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                (orgProfile.account_number && orgProfile.ifsc_code) ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {(orgProfile.account_number && orgProfile.ifsc_code) ? "Ready for Payouts" : "Setup Incomplete"}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] mb-1">
                <CheckCircle2 size={13} className="text-emerald-700" /> Automated Bank Transfers
              </div>
              Payout batches route ticket proceeds and vendor stall funds directly to this confirmed account coordinates.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Associated Events List Card (if Organizer) ── */}
      {isOrg && (
        <Card className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="p-4.5 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Events Hosted by this Organizer</h3>
                <p className="text-[10px] text-slate-400 font-medium">All events submitted under this organization</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-[11px]">
              {events.length} {events.length === 1 ? "Event" : "Events"}
            </Badge>
          </div>

          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No events created by this organizer yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <th className="p-3 pl-5">Event Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Venue</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 pr-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 pl-5">
                          <div className="font-extrabold text-slate-900">{ev.event_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{ev.event_code}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px]">
                            {ev.category}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-600">{ev.venue}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{ev.start_date || "Date Pending"}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ["APPROVED", "LIVE", "ACTIVE"].includes((ev.status || "").toUpperCase())
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="p-3 pr-5 text-right">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => navigate(`/superuser/inspection/${ev.id}`)}
                            className="text-[11px] font-extrabold gap-1 cursor-pointer hover:bg-purple-50 hover:text-purple-700"
                          >
                            <Eye size={12} /> Inspect Event
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
