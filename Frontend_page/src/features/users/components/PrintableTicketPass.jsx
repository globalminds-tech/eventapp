import React from "react";
import {
  Ticket, MapPin, Calendar, Clock, QrCode, ShieldCheck, CheckCircle2,
  Utensils, Car, Sparkles, User, Mail, Phone, AlertCircle
} from "lucide-react";

/**
 * PrintableTicketPass
 * High-resolution, executive boarding-pass style printable event ticket.
 * Optimized for crisp A4/Letter paper printing with zero ink bleed.
 */
export default function PrintableTicketPass({ pass, id = "printable-pass-target" }) {
  if (!pass) return null;

  const qrSrc = pass.qr_code
    ? (pass.qr_code.startsWith("data:") ? pass.qr_code : `data:image/png;base64,${pass.qr_code}`)
    : null;

  const eventTitle = pass.event_name || pass.eventName || pass.event_details?.name || "Official Event Admission";
  const venueName = pass.venue || pass.event_details?.venue || "Main Exhibition Venue";
  const venueAddress = pass.address || pass.event_details?.address || "";
  const eventDate = pass.start_date || pass.event_details?.date || "Confirmed Event Date";
  const eventTime = pass.start_time || pass.event_details?.time || "Gates Open: 1 Hour Before";
  const ticketCode = pass.ticket_code || (pass.id ? `BME-${String(pass.id).replace(/-/g, "").slice(0, 8).toUpperCase()}` : "BME-CONFIRMED");
  const bookingRef = pass.booking_id || pass.id || `REF-${Date.now().toString().slice(-6)}`;
  const attendeeName = pass.name || pass.visitor_name || "Valued Attendee";
  const attendeeEmail = pass.email || pass.user_email || "";
  const attendeePhone = pass.phone || pass.user_phone || "";
  const ticketCount = Number(pass.ticket_count || 1);
  const groupSize = Number(pass.group_size || 1);
  const passType = pass.pass_type || (groupSize > 1 ? "Group Pass" : "Single Pass");
  const isGroup = passType.toLowerCase().includes("group");
  const totalSeats = isGroup ? (ticketCount * (groupSize || 2)) : ticketCount;
  const entryType = pass.entry_type || "Single Entry";
  const maxReentries = pass.max_reentries || (entryType === "Single Entry" ? "1-Scan" : "Unlimited");
  const totalCheckins = Number(pass.total_checkins || 0);
  const amountPaid = Number(pass.amount_paid || 0);
  const currency = pass.currency_code || "INR";
  const isPaid = amountPaid > 0;
  const bannerUrl = pass.banner_url || pass.event_details?.banner || "";

  // Parse food provision snapshot
  let parsedFoods = [];
  if (pass.food_details && pass.food_details !== "None") {
    try {
      if (pass.food_details.startsWith("[") || pass.food_details.startsWith("{")) {
        const parsed = JSON.parse(pass.food_details);
        parsedFoods = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (e) {}
  }

  // Parse vehicle provision snapshot
  let parsedVehicles = [];
  if (pass.vehicle_details) {
    try {
      if (pass.vehicle_details.startsWith("{") || pass.vehicle_details.startsWith("[")) {
        const parsed = JSON.parse(pass.vehicle_details);
        parsedVehicles = parsed.passes || (Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {}
  }

  return (
    <div
      id={id}
      className="bg-white text-slate-900 w-full max-w-[820px] mx-auto border-2 border-slate-900 rounded-3xl overflow-hidden font-sans shadow-xl print:shadow-none print:border-2 print:border-black print:m-0 print:w-full print:max-w-none"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
    >
      {/* ── TOP HEADER / BRAND BAR ── */}
      <div className="bg-slate-950 text-white px-6 sm:px-8 py-4 flex items-center justify-between border-b-2 border-slate-900 print:bg-black print:text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm print:bg-black print:text-white print:border print:border-white">
            <Ticket size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white uppercase">BookMyEvent</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-cyan-400/40 print:border-white print:text-white">
                Official Admission Pass
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Authenticated Electronic Ticket • Valid for Gate Admission
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pass Code</span>
          <span className="font-mono text-xs sm:text-sm font-black text-cyan-300 tracking-wider print:text-white">
            {ticketCode}
          </span>
        </div>
      </div>

      {/* ── MAIN TICKET BODY ── */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Event Title & Schedule Banner */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-900 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md print:bg-black">
                {pass.category || "Official Event"}
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-600" />
                <span>CONFIRMED ADMISSION</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
              {eventTitle}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold pt-0.5">
              <MapPin size={15} className="text-cyan-600 shrink-0 print:text-black" />
              <span>{venueName}{venueAddress ? `, ${venueAddress}` : ""}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 shrink-0 sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-2 print:bg-white print:border-black">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Scheduled Date</span>
              <div className="flex items-center sm:justify-end gap-1.5 text-xs sm:text-sm font-black text-slate-900">
                <Calendar size={14} className="text-cyan-600 print:text-black" />
                <span>{eventDate}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Time</span>
              <div className="flex items-center sm:justify-end gap-1.5 text-xs sm:text-sm font-black text-slate-800">
                <Clock size={14} className="text-slate-500 print:text-black" />
                <span>{eventTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Core Grid: Attendee Details & QR Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Attendee Details Column (2 Cols) */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            
            <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 print:bg-white print:border-black">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Primary Attendee</span>
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-slate-400 shrink-0" />
                <span className="text-sm font-black text-slate-950 truncate">{attendeeName}</span>
              </div>
              {attendeeEmail && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate pt-0.5">
                  <Mail size={11} className="shrink-0" />
                  <span className="truncate">{attendeeEmail}</span>
                </div>
              )}
              {attendeePhone && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                  <Phone size={11} className="shrink-0" />
                  <span>{attendeePhone}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 print:bg-white print:border-black">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pass Allocation</span>
              <p className="text-sm font-black text-slate-950">
                {ticketCount} {passType}
              </p>
              <p className="text-xs font-bold text-slate-600">
                Total Seats: <span className="font-extrabold text-slate-950">{totalSeats}</span>
              </p>
              <div className="pt-0.5">
                <span className="inline-block text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md print:bg-white print:border-black print:text-black">
                  {entryType} ({maxReentries})
                </span>
              </div>
            </div>

            <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 print:bg-white print:border-black">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Payment Receipt</span>
              <p className="text-sm font-black text-emerald-700 print:text-black">
                {isPaid ? `₹ ${amountPaid.toLocaleString("en-IN")} ${currency}` : "FREE PASS"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Status: <span className="font-extrabold text-slate-800">Paid &amp; Tax-Cleared</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Ref: {bookingRef}</p>
            </div>

            <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 print:bg-white print:border-black">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Turnstile Gate Access</span>
              <p className="text-sm font-black text-slate-900">
                Main Entrance Turnstile
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Scans Used: <span className="font-extrabold">{totalCheckins}</span> / {maxReentries}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Auto-Validates at Scanner</p>
            </div>

          </div>

          {/* QR Code Column (1 Col) */}
          <div className="border-2 border-dashed border-slate-300 rounded-3xl p-4 flex flex-col items-center justify-center bg-slate-50 text-center shrink-0 print:bg-white print:border-black">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-2">
              Gate Turnstile QR Code
            </span>
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm print:border-black">
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt="Official Ticket QR Code"
                  className="w-32 h-32 object-contain block"
                />
              ) : (
                <div className="w-32 h-32 bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1 rounded-xl">
                  <QrCode size={36} />
                  <span className="text-[9px] font-bold">QR Pass Code</span>
                </div>
              )}
            </div>
            <span className="font-mono text-[11px] font-black text-slate-900 mt-2 tracking-widest block">
              {ticketCode}
            </span>
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-tight mt-0.5">
              Hold code flat against turnstile scanner
            </span>
          </div>

        </div>

        {/* Provisions & Special Amenities Bar (if any booked) */}
        {(parsedFoods.length > 0 || pass.food_preference || parsedVehicles.length > 0 || pass.vehicle_number) && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center gap-4 text-xs print:bg-white print:border-black">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              <span>Included Passes &amp; Provisions:</span>
            </span>

            {/* Food Snapshot */}
            {parsedFoods.length > 0 ? (
              parsedFoods.map((f, idx) => (
                <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 print:bg-white print:border-black print:text-black">
                  <Utensils size={11} />
                  <span>{f.meal_type || "Meal"} ({f.food_type || "Standard"}) x{f.count || 1}</span>
                </span>
              ))
            ) : pass.food_preference && pass.food_preference !== "None" ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 print:bg-white print:border-black print:text-black">
                <Utensils size={11} />
                <span>Meal Preference: {pass.food_preference}</span>
              </span>
            ) : null}

            {/* Parking Snapshot */}
            {parsedVehicles.length > 0 ? (
              parsedVehicles.map((v, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 print:bg-white print:border-black print:text-black">
                  <Car size={11} />
                  <span>Parking: {v.vehicle_type} {pass.vehicle_number ? `(${pass.vehicle_number})` : ""}</span>
                </span>
              ))
            ) : pass.vehicle_number ? (
              <span className="bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 print:bg-white print:border-black print:text-black">
                <Car size={11} />
                <span>Parking Pass: {pass.vehicle_number}</span>
              </span>
            ) : null}
          </div>
        )}

        {/* ── PERFORATED STUB SEPARATOR ── */}
        <div className="relative py-2 flex items-center justify-center">
          <div className="w-full border-t-2 border-dashed border-slate-300 print:border-black" />
          <span className="absolute bg-white px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1 print:text-black">
            <span>✂</span> Tear Along Perforation For Gate Counterfoil Stub <span>✂</span>
          </span>
        </div>

        {/* ── GATE ADMISSION STUB ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs print:bg-white print:border-black">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Gate Audit Counterfoil</span>
            <p className="font-extrabold text-slate-900 text-sm">{eventTitle}</p>
            <p className="text-slate-600 text-[11px]">
              Attendee: <strong className="text-slate-900">{attendeeName}</strong> • {totalSeats} Seat(s) Reserved
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-mono text-xs font-black text-slate-900 block">{ticketCode}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 print:text-black">
                {isPaid ? `PAID ₹${amountPaid}` : "FREE PASS"}
              </span>
            </div>
            <div className="w-28 h-12 border border-slate-300 rounded-xl flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase text-center p-1 print:border-black">
              Gate Scanner Verification Box
            </div>
          </div>
        </div>

        {/* ── ADMISSION TERMS & SECURITY NOTICE ── */}
        <div className="space-y-1.5 pt-1 text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-100">
          <span className="font-black text-slate-700 uppercase tracking-wider block">Official Gate Admission Guidelines:</span>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
            <li>Present this digital pass or printed voucher with the QR code intact for electronic scanning upon arrival.</li>
            <li>Each QR code is uniquely encrypted and admits the number of attendees indicated in the seat allocation.</li>
            <li>Government-issued photo identification matching the primary booker name may be requested at venue gates.</li>
            <li>Outside food, hazardous substances, and unauthorized commercial recording equipment are strictly prohibited.</li>
            <li>For support or inquiries regarding this pass, contact <strong>support@bookmyevent.com</strong>.</li>
          </ul>
        </div>

        {/* Barcode Strip Aesthetic */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="font-mono tracking-[0.4em] text-xs font-black text-slate-800">
            ||||||| | ||||| || |||||| | |||| |||||| | ||||| | ||||||||
          </div>
          <span className="font-mono text-[9px] text-slate-400 font-bold tracking-wider mt-0.5">
            *BME-{ticketCode.replace(/[^A-Z0-9]/g, "")}-GATE-PASS*
          </span>
        </div>

      </div>
    </div>
  );
}
