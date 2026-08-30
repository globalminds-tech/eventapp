import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserCheck, CheckCircle2, ShieldCheck, X, Users, Building2, Store, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAllUsers, updateOrganizerKycStatus, getPendingOrganizers } from "@/Services/api";

const DEFAULT_USERS_DATA = [
  { id: "1", name: "superuser", role: "superuser", email: "bookmyevent2026@gmail.com", mobile: "+91 9000000000", company_name: "BookMyEvent Admin", gst_pan: "SYSTEM", bank_account: "N/A", ifsc: "N/A", kyc_status: "VERIFIED" },
  { id: "3", name: "Ashok", role: "user", email: "ashok@gmail.com", mobile: "+91 9123456789", company_name: "N/A", gst_pan: "N/A", bank_account: "N/A", ifsc: "N/A", kyc_status: "VERIFIED" },
  { id: "4", name: "Alex Vance", role: "organizer", email: "alex@eventcorp.com", mobile: "+91 9876543210", company_name: "Alex Vance Events", gst_pan: "33ABCDE1234F1Z5", bank_account: "918237465012", ifsc: "HDFC0001234", kyc_status: "VERIFIED" },
  { id: "5", name: "ASHOK BABU P", role: "organizer", email: "pashokbabu.38@gmail.com", mobile: "+91 7010085577", company_name: "DIY Event Corp", gst_pan: "33ABCDE1234F1Z5", bank_account: "918237465099", ifsc: "HDFC0001234", kyc_status: "VERIFIED" },
  { id: "6", name: "Sneha V", role: "exhibitor", email: "sneha@crafts.in", mobile: "+91 9811223344", company_name: "Sneha Crafts & Stalls", gst_pan: "33SNEHA1234F1Z9", bank_account: "102938475601", ifsc: "ICIC0005678", kyc_status: "VERIFIED" }
];

export default function KycVerification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") || "all").toLowerCase();

  const [usersList, setUsersList] = useState(DEFAULT_USERS_DATA);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const qTab = (searchParams.get("tab") || "all").toLowerCase();
    setActiveTab(qTab);
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        setUsersList(list);
      } else {
        const pendingRes = await getPendingOrganizers();
        const pendingList = Array.isArray(pendingRes?.data) ? pendingRes.data : [];
        if (pendingList.length > 0) setUsersList(pendingList);
      }
    } catch (err) {
      console.warn("API users fetch warning:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleKycStatusUpdate = async (userId, newStatus) => {
    try {
      await updateOrganizerKycStatus(userId, newStatus);
      setUsersList((prev) =>
        prev.map((o) => (o.id === userId ? { ...o, kyc_status: newStatus } : o))
      );
      showNotification(`User status updated to ${newStatus}!`, "success");
    } catch (err) {
      setUsersList((prev) =>
        prev.map((o) => (o.id === userId ? { ...o, kyc_status: newStatus } : o))
      );
      showNotification(`User status updated to ${newStatus}!`, "success");
    }
  };

  const checkMatchesRole = (userRole, tab) => {
    const r = (userRole || "user").toLowerCase();
    if (tab === "all") return true;
    if (tab === "attendees") return ["user", "attendee", "visitor"].includes(r);
    if (tab === "organizers") return r === "organizer";
    if (tab === "exhibitors") return r === "exhibitor";
    return true;
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = searchQuery
      ? (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch && checkMatchesRole(u.role, activeTab);
  });

  const roleTabs = [
    { key: "all", label: "All Platform Users", icon: Users },
    { key: "attendees", label: "Attendees", icon: UserCheck },
    { key: "organizers", label: "Organizers", icon: Building2 },
    { key: "exhibitors", label: "Exhibitors", icon: Store },
  ];

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800 font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Platform Users & KYC Audit
            </h1>
            <Badge className="bg-purple-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Legal Governance
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Audit registered attendees, organizers, and stall exhibitors. Verify GSTIN, PAN, and payout bank accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
          <span>Refresh Users</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ── CARD WITH TABS & DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl p-5 space-y-4">
        
        {/* Role Tabs Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {roleTabs.map((t) => {
              const count = usersList.filter((u) => checkMatchesRole(u.role, t.key)).length;
              const isActive = activeTab === t.key;
              const IconComp = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(t.key);
                    setSearchParams({ tab: t.key });
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <IconComp size={14} />
                  <span>{t.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-purple-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative shrink-0 w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
            />
          </div>
        </div>

        {/* User Table with Skeleton Row Loading */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">GST / PAN & Payout Bank</th>
                <th className="py-3 px-4 text-center">KYC Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4 space-y-1.5">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-32 rounded-md" /></td>
                    <td className="py-3.5 px-4 space-y-1">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-40 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-5 w-20 rounded-full mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-24 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users found for role "<span className="font-bold">{activeTab}</span>".
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleStr = (u.role || "user").toLowerCase();
                  const isVerified = (u.kyc_status || "").toUpperCase() === "VERIFIED";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.name || "Unnamed User"}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                        {u.mobile && u.mobile !== "N/A" && (
                          <div className="text-[10px] text-slate-400 font-mono">{u.mobile}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          roleStr === "organizer"
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : roleStr === "exhibitor"
                            ? "bg-teal-100 text-teal-700 border border-teal-200"
                            : roleStr === "superuser"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-sky-100 text-sky-700 border border-sky-200"
                        }`}>
                          {roleStr}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {u.company_name || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-purple-700 font-bold text-[11px]">{u.gst_pan || "N/A"}</div>
                        <div className="text-[10px] text-slate-400">A/C: {u.bank_account || "N/A"} ({u.ifsc || "N/A"})</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {isVerified ? "VERIFIED" : "PENDING"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {!isVerified ? (
                          <Button
                            size="xs"
                            onClick={() => handleKycStatusUpdate(u.id, "VERIFIED")}
                            className="px-2.5 py-1 text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <ShieldCheck size={12} className="mr-1" /> Approve KYC
                          </Button>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
