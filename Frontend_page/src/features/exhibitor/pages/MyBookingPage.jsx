import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMyBookings, getBookingById, updateBooking } from "@/Services/api";
import {
  Store, Search, CheckCircle2, Clock, Eye, Pencil, CreditCard,
  MapPin, XCircle, Phone, Mail, Building, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

  const reduxUser = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const user = reduxUser?.id ? reduxUser : storedUser;

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const res = await getMyBookings(user.id);
        if (res.success && Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          setBookings([]);
        }
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to fetch stall bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (b) => {
    setToastMessage(`✓ Redirecting to payment portal for ${b.event_name}...`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = searchTerm === "" ||
      (b.event_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.stall_area || "").toLowerCase().includes(searchTerm.toLowerCase());

    const st = (b.status || "pending").toLowerCase();
    let matchesStatus = true;
    if (selectedStatusTab === "pending") matchesStatus = st === "pending";
    if (selectedStatusTab === "approved") matchesStatus = st === "approved";
    if (selectedStatusTab === "confirmed") matchesStatus = st === "confirmed" || st === "paid";
    if (selectedStatusTab === "rejected") matchesStatus = st === "rejected";

    return matchesSearch && matchesStatus;
  });

  const totalCount = bookings.length;
  const approvedCount = bookings.filter(b => (b.status || "").toLowerCase() === "approved").length;
  const confirmedCount = bookings.filter(b => ["confirmed", "paid"].includes((b.status || "").toLowerCase())).length;

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              My Stall Bookings
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              Exhibitor Reservation Hub
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Track your booth applications, view 24-hour payment lock countdowns, and complete invoice settlements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => navigate("/exhibitor/upcoming-events")}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 border-none cursor-pointer gap-2"
          >
            <Store size={18} />
            <span>Book New Stall</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stall Applications</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount} Reservations</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Across active expos</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Store size={22} />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved & Payment Locked</p>
            <h3 className="text-2xl font-extrabold text-cyan-600 mt-1">{approvedCount} Active Locks</h3>
            <p className="text-[11px] font-medium text-cyan-600 mt-0.5">Complete payment to confirm</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0">
            <Clock size={22} className="animate-pulse" />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed & Paid Booths</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{confirmedCount} Confirmed</h3>
            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Stall space reserved</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </Card>
      </div>

      {/* Main Table Card (Shadcn Table standard matching Screenshot 4) */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {[
              { label: "All Bookings", value: "all" },
              { label: "Pending Approval", value: "pending" },
              { label: "Approved (24h Lock)", value: "approved" },
              { label: "Confirmed & Paid", value: "confirmed" },
              { label: "Rejected", value: "rejected" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedStatusTab(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedStatusTab === t.value
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
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
              placeholder="Search event code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">Stall & Location</th>
                <th className="py-3.5 px-4">Booking Fee</th>
                <th className="py-3.5 px-4">Status & Payment Lock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4 space-y-2">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-36 rounded" />
                    </td>
                    <td className="py-3.5 px-4 space-y-1.5">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-4 w-20 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Skeleton className="h-8 w-16 rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/50">
                    No stall bookings found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const status = (b.status || "Pending").toLowerCase();
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[10px]">
                            {b.company_name || 'Exhibitor Firm'}
                          </Badge>
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mt-1">{b.event_name}</h4>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600 space-y-0.5">
                          <p className="font-bold text-slate-800 text-xs">{b.stall_area || 'Standard Booth'}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{b.city || 'Chennai'}, {b.state || 'TN'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                        ₹{Number(b.price_paid || 45000).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <Clock size={12} className="animate-pulse" /> Pending Approval
                          </span>
                        )}
                        {status === 'approved' && (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200 inline-flex items-center gap-1">
                              <CheckCircle2 size={12} /> Approved (24h Lock)
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-0.5">
                              <Clock size={10} className="text-cyan-600" /> Payment lock active
                            </span>
                          </div>
                        )}
                        {(status === 'confirmed' || status === 'paid') && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> Confirmed & Paid
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/exhibitor/my-bookings/${b.id}`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
                            title="View Booking Details"
                          >
                            <Eye size={14} />
                          </button>

                          {status === 'approved' && (
                            <button
                              onClick={() => handlePayNow(b)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <CreditCard size={13} />
                              <span>Pay Now</span>
                            </button>
                          )}
                        </div>
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
};

export default MyBookings;
