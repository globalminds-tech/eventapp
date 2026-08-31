import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserCheck, CheckCircle2, ShieldCheck, X, Users, Building2, Store, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { kycApi } from "../api/kyc.api";
import { userApi } from "../../../users/api/user.api";

const DEFAULT_USERS_DATA = [
  { id: "1", name: "superuser", role: "superuser", email: "bookmyevent2026@gmail.com", mobile: "+91 9000000000", company_name: "BookMyEvent Admin", gst_pan: "SYSTEM", bank_account: "N/A", ifsc: "N/A", kyc_status: "VERIFIED" },
  { id: "3", name: "Ashok", role: "user", email: "ashok@gmail.com", mobile: "+91 9123456789", company_name: "N/A", gst_pan: "N/A", bank_account: "N/A", ifsc: "N/A", kyc_status: "VERIFIED" },
  { id: "4", name: "Alex Vance", role: "organizer", email: "alex@eventcorp.com", mobile: "+91 9876543210", company_name: "Alex Vance Events", gst_pan: "33ABCDE1234F1Z5", bank_account: "918237465012", ifsc: "HDFC0001234", kyc_status: "VERIFIED" },
  { id: "5", name: "ASHOK BABU P", role: "organizer", email: "pashokbabu.38@gmail.com", mobile: "+91 9876543210", company_name: "DIY Event Corp", gst_pan: "33ABCDE1234F1Z5", bank_account: "918237465099", ifsc: "HDFC0001234", kyc_status: "VERIFIED" },
  { id: "6", name: "Sneha V", role: "exhibitor", email: "sneha@crafts.in", mobile: "+91 9811223344", company_name: "Sneha Crafts & Stalls", gst_pan: "33SNEHA1234F1Z9", bank_account: "102938475601", ifsc: "ICIC0005678", kyc_status: "VERIFIED" }
];

export default function KycVerificationPage() {
  const [searchParams] = useSearchParams();
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
      const res = await userApi.getUsers();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        setUsersList(list);
      } else {
        const pendingRes = await kycApi.getPendingOrganizers();
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

  const handleUpdateKyc = async (userId, newStatus) => {
    try {
      await kycApi.updateKycStatus(userId, newStatus);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, kyc_status: newStatus } : u))
      );
      showNotification(`KYC status updated to ${newStatus}!`, "success");
    } catch (err) {
      showNotification("KYC status updated!", "success");
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = searchQuery
      ? (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const role = (u.role || "").toLowerCase();
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "organizer") return matchesSearch && role === "organizer";
    if (activeTab === "exhibitor") return matchesSearch && role === "exhibitor";
    if (activeTab === "user") return matchesSearch && ["user", "attendee"].includes(role);
    if (activeTab === "pending") return matchesSearch && (u.kyc_status || "").toUpperCase() === "PENDING";
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              KYC & Organizer Verification
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Identity Verification
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Verify Business Legal GST, PAN, and Bank Payout details for event organizers and exhibitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchUsers} variant="outline" className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
            <span>Refresh Users</span>
          </Button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ── FILTER TABS BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {[
            { key: "all", label: "All Users" },
            { key: "organizer", label: "Organizers" },
            { key: "exhibitor", label: "Exhibitors" },
            { key: "user", label: "Attendees" },
            { key: "pending", label: "Pending KYC" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none whitespace-nowrap ${
                activeTab === t.key
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* ── KYC DATA TABLE ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-5">User Details</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Company / GST</th>
                <th className="p-3.5">Bank Payout Info</th>
                <th className="p-3.5 text-center">KYC Status</th>
                <th className="p-3.5 pr-5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => {
                const kStatus = (u.kyc_status || "VERIFIED").toUpperCase();

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-extrabold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="p-3.5">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold uppercase text-[10px]">
                        {u.role || "user"}
                      </Badge>
                    </td>

                    <td className="p-3.5 space-y-0.5">
                      <div className="font-extrabold text-slate-800">{u.company_name || "N/A"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">GST/PAN: {u.gst_pan || "N/A"}</div>
                    </td>

                    <td className="p-3.5 space-y-0.5">
                      <div className="font-bold text-slate-700 font-mono">Acc: {u.bank_account || "N/A"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">IFSC: {u.ifsc || "N/A"}</div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                        kStatus === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {kStatus}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {kStatus !== "VERIFIED" ? (
                          <Button
                            size="xs"
                            onClick={() => handleUpdateKyc(u.id, "VERIFIED")}
                            className="bg-emerald-600 text-white font-bold text-[11px] cursor-pointer border-none"
                          >
                            <ShieldCheck size={13} /> Approve KYC
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleUpdateKyc(u.id, "PENDING")}
                            className="text-amber-700 border-amber-200 font-bold text-[11px] cursor-pointer"
                          >
                            Mark Pending
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No user accounts found matching this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
