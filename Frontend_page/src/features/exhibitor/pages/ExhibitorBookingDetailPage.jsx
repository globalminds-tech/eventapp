import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Store, Building2, User, MapPin, Phone, Mail, FileText,
  CreditCard, CheckCircle2, Clock, XCircle, Briefcase, Info, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getBookingById } from "@/Services/api";

const ExhibitorBookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBookingById(id);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setError("Failed to load booking details.");
      }
    } catch (err) {
      console.error("Error fetching booking detail:", err);
      setError("An error occurred while fetching booking details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 select-none font-sans animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-6 w-3/4 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </Card>

            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 space-y-4">
              <Skeleton className="h-5 w-40 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 space-y-4">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-700">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl text-xs font-bold gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Go Back
        </Button>
      </div>
    );
  }

  const b = booking;
  const status = (b.status || "Pending").toLowerCase();

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      
      {/* ── Breadcrumb & Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to My Bookings
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Booking Details
            </h1>
            <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-bold text-[10px]">
              ID: {b.id}
            </Badge>
          </div>
        </div>
        <div className="shrink-0">
          {status === 'pending' && (
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-sm">
              <Clock size={14} className="animate-pulse" /> Pending Approval
            </span>
          )}
          {status === 'approved' && (
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} /> Approved (24h Lock)
            </span>
          )}
          {(status === 'confirmed' || status === 'paid') && (
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} /> Confirmed & Paid
            </span>
          )}
          {status === 'rejected' && (
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1.5 shadow-sm">
              <XCircle size={14} /> Rejected
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Key Info ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stall & Event Info */}
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
            <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">Event & Stall Details</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Exhibition Information</p>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Event Name</p>
                    <p className="font-extrabold text-slate-900 mt-1">{b.event_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Event Code</p>
                    <Badge variant="outline" className="mt-1 text-slate-700 bg-slate-50 font-bold">{b.event_code || "N/A"}</Badge>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Stall Area</p>
                    <p className="font-extrabold text-slate-900 mt-1">{b.stall_area || "Standard Booth"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Fee</p>
                    <p className="font-black text-emerald-600 text-lg mt-0.5">
                      ₹{Number(b.price_paid || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
             <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">Company Information</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Business Details</p>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Briefcase size={12}/> Company Name</p>
                  <p className="font-bold text-slate-800 mt-1">{b.company_name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Company Type</p>
                  <p className="font-bold text-slate-800 mt-1">{b.company_type || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Industry</p>
                  <p className="font-bold text-slate-800 mt-1">{b.industry_type || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Website</p>
                  <p className="font-bold text-sky-600 mt-1 hover:underline cursor-pointer">{b.company_website || "—"}</p>
                </div>
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FileText size={12}/> Business Description</p>
                  <p className="text-sm text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {b.business_description || "No description provided."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Applicant & Address ── */}
        <div className="space-y-6">
          
          {/* Applicant Info */}
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
             <div className="bg-sky-50 px-5 py-4 border-b border-sky-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                <User className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">Applicant Info</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Primary Contact</p>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Full Name</p>
                <p className="font-extrabold text-slate-800 mt-1">
                  {b.title} {b.first_name} {b.last_name}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Designation</p>
                <p className="font-medium text-slate-700 mt-1">{b.designation || "—"}</p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Mail size={14} className="text-slate-500" />
                </div>
                <p className="font-bold text-slate-700 text-sm truncate">{b.email_id || "—"}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Phone size={14} className="text-slate-500" />
                </div>
                <p className="font-bold text-slate-700 text-sm">{b.mobile_number || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
             <div className="bg-rose-50 px-5 py-4 border-b border-rose-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">Address</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Location Details</p>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {b.address || "—"}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">City</p>
                  <p className="font-bold text-slate-800 mt-0.5">{b.city || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">State</p>
                  <p className="font-bold text-slate-800 mt-0.5">{b.state || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Country</p>
                  <p className="font-bold text-slate-800 mt-0.5">{b.country || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pin Code</p>
                  <p className="font-bold text-slate-800 mt-0.5">{b.postal_code || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
};

export default ExhibitorBookingDetailPage;
