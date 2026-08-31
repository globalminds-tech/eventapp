import React, { useState } from "react";
import {
  Users, Search, Filter, QrCode, CheckCircle2, Clock, Eye, Send, Mail, Phone,
  Calendar, Ticket, UserCheck, Sparkles, XCircle, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export default function User() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState("all");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [resendNotification, setResendNotification] = useState("");

  const attendeeList = [
    {
      id: 1,
      name: "Arun Kumar",
      email: "arunkumar1611@gmail.com",
      mobile: "9361826137",
      event_name: "Cultural Fest 2026",
      ticket_type: "VIP All-Access Pass",
      booking_code: "BKG-88341",
      checkin_status: "Checked In",
      checkin_time: "Today, 10:45 AM",
      price_paid: 1500,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      name: "Parthiban J",
      email: "jbparthi07@gmail.com",
      mobile: "9677440785",
      event_name: "Cultural Fest 2026",
      ticket_type: "General Day Pass",
      booking_code: "BKG-88342",
      checkin_status: "Not Arrived",
      checkin_time: "-",
      price_paid: 500,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 3,
      name: "Vikas Sharma",
      email: "vikas1905@gmail.com",
      mobile: "8531938400",
      event_name: "LOGMAT Logistics & Supply Chain Expo",
      ticket_type: "Exhibition Visitor Pass",
      booking_code: "BKG-99410",
      checkin_status: "Checked In",
      checkin_time: "Today, 09:15 AM",
      price_paid: 0,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 4,
      name: "Sakthivel G",
      email: "sakthivelganesan@gmail.com",
      mobile: "8056897132",
      event_name: "LOGMAT Logistics & Supply Chain Expo",
      ticket_type: "VIP All-Access Pass",
      booking_code: "BKG-99411",
      checkin_status: "Checked In",
      checkin_time: "Today, 11:30 AM",
      price_paid: 2000,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
    }
  ];

  const handleResendPass = (attendee) => {
    setResendNotification(`✓ Entry Pass QR code resent to ${attendee.email}`);
    setTimeout(() => setResendNotification(""), 3000);
  };

  const filteredAttendees = attendeeList.filter((att) => {
    const matchesSearch = searchTerm === "" ||
      att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.mobile.includes(searchTerm);

    const matchesEvent = selectedEventFilter === "all" || att.event_name === selectedEventFilter;

    const st = att.checkin_status.toLowerCase();
    let matchesStatus = true;
    if (selectedStatusTab === "checkedin") matchesStatus = st === "checked in";
    if (selectedStatusTab === "notarrived") matchesStatus = st === "not arrived";
    if (selectedStatusTab === "vip") matchesStatus = att.ticket_type.includes("VIP");

    return matchesSearch && matchesEvent && matchesStatus;
  });

  const totalRegistered = attendeeList.length;
  const checkedInCount = attendeeList.filter(a => a.checkin_status === "Checked In").length;
  const vipCount = attendeeList.filter(a => a.ticket_type.includes("VIP")).length;
  const checkinPercentage = Math.round((checkedInCount / totalRegistered) * 100);

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* ── NOTIFICATION TOAST ── */}
      {resendNotification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{resendNotification}</span>
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Attendee & User Monitoring Portal
            </h1>
            <Badge className="bg-blue-50 text-blue-800 border-blue-200 px-2.5 py-0.5 font-bold text-[11px]">
              Live Gate Analytics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Monitor real-time attendee registrations, gate scanner check-ins, and digital pass verifications.
          </p>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Attendees</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalRegistered} Attendees</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Across active events</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Users size={22} />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gate Check-Ins Completed</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{checkedInCount} Checked In</h3>
            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">{checkinPercentage}% Attendance Rate</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <UserCheck size={22} />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">VIP Ticket Holders</p>
            <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{vipCount} VIP Guests</h3>
            <p className="text-[11px] font-medium text-purple-600 mt-0.5">Priority Gate Entry</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <Sparkles size={22} />
          </div>
        </Card>
      </div>

      {/* ── ATTENDEE MONITORING TABLE ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {[
              { label: "All Attendees", value: "all" },
              { label: "Checked-In", value: "checkedin" },
              { label: "Not Arrived Yet", value: "notarrived" },
              { label: "VIP Pass Holders", value: "vip" },
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

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search name, code, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">Attendee Profile</th>
                <th className="py-3.5 px-4">Event & Ticket Pass</th>
                <th className="py-3.5 px-4">Booking Code</th>
                <th className="py-3.5 px-4">Gate Scanner Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/50">
                    No attendee records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={att.avatar}
                          alt={att.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{att.name}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold">{att.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-bold text-[10px]">
                          {att.event_name}
                        </Badge>
                        <p className="text-[11px] font-semibold text-slate-700 mt-1 flex items-center gap-1">
                          <Ticket size={12} className="text-blue-600" />
                          {att.ticket_type}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {att.booking_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {att.checkin_status === "Checked In" ? (
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> Checked In
                          </span>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{att.checkin_time}</p>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Clock size={12} /> Not Arrived Yet
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAttendee(att)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
                          title="View Digital Pass QR"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleResendPass(att)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer border border-blue-200"
                          title="Resend Digital Pass SMS/Email"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── DIGITAL PASS INSPECTION MODAL ── */}
      {selectedAttendee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center relative">
            <button
              onClick={() => setSelectedAttendee(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <XCircle size={20} />
            </button>

            <div className="mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 shadow-md">
              <img src={selectedAttendee.avatar} alt={selectedAttendee.name} className="w-full h-full object-cover" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{selectedAttendee.name}</h3>
              <p className="text-xs text-slate-500 font-semibold">{selectedAttendee.email}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Event:</span>
                <span className="font-extrabold text-slate-900">{selectedAttendee.event_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Pass:</span>
                <span className="font-bold text-blue-600">{selectedAttendee.ticket_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Code:</span>
                <span className="font-mono font-extrabold text-slate-900">{selectedAttendee.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Status:</span>
                <span className="font-extrabold text-emerald-600">{selectedAttendee.checkin_status}</span>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={() => setSelectedAttendee(null)} className="w-full bg-slate-900 text-white font-extrabold text-xs rounded-xl cursor-pointer">
                Close Ticket View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}