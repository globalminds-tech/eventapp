import React, { useState } from "react";
import {
  Settings2, ChevronDown, Utensils, Car, Package,
  MessageSquare, ShieldCheck, FileText, Layers
} from "lucide-react";
import StepFoodProvision from "./StepFoodDetails";
import StepVehicleProvision from "./StepVehiclePassDetails";

// ── Reusable Accordion Section ──
const AccordionSection = ({ icon: Icon, title, badge, children, defaultOpen = false, accentColor = "cyan" }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", ring: "ring-cyan-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-200" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-200" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-200" },
  };
  const c = colorMap[accentColor] || colorMap.cyan;

  return (
    <div className={`border border-slate-200 rounded-xl overflow-visible transition-all ${open ? "shadow-sm" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/50 transition-colors border-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${c.bg}`}>
            <Icon className={`w-4 h-4 ${c.text}`} />
          </div>
          <span className="text-sm font-bold text-slate-900">{title}</span>
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const Step3FacilitiesLayout = ({ formData, setFormData, organizerId, showErrors }) => {
  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      eventDetails: {
        ...prev.eventDetails,
        [field]: !prev.eventDetails?.[field],
      },
    }));
  };

  const handleCheckbox = (field, checked) => {
    let value = checked;
    if (field === "includeProgram") {
      value = checked ? "Yes" : "No";
    }

    const updates = { [field]: value };
    // Cascading logic
    if (field === "vehiclePass" && !checked) updates.vehicleNumber = false;
    if (field === "isInternationalInclude" && !checked) {
      updates.passport = false;
      // Also reset booking international
      setFormData((prev) => ({
        ...prev,
        eventDetails: { ...prev.eventDetails, ...updates },
        booking: { ...(prev.booking || {}), priceType: "National" },
      }));
      return;
    }
    if (field === "mail") updates.visitorMail = checked;

    setFormData((prev) => ({
      ...prev,
      eventDetails: { ...prev.eventDetails, ...updates },
    }));
  };

  // Toggle chip component
  const ToggleChip = ({ label, field, locked = false }) => {
    let checked = false;
    if (field === "visitorName") {
      checked = true;
    } else if (field === "includeProgram") {
      checked = formData.eventDetails?.includeProgram === "Yes" || formData.eventDetails?.includeProgram === true;
    } else {
      checked = Boolean(formData.eventDetails?.[field]);
    }

    return (
      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
        checked
          ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200"
          : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
      } ${locked ? "opacity-70 cursor-not-allowed" : ""}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !locked && handleCheckbox(field, e.target.checked)}
          className="w-3 h-3 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          onClick={(e) => locked && e.preventDefault()}
        />
        {label}
      </label>
    );
  };

  return (
    <div className="space-y-3">
      {/* ── Section Header ── */}
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-emerald-50 rounded-lg">
          <Settings2 className="w-4 h-4 text-emerald-600" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">Facilities & Configuration</h3>
      </div>

      {/* ── Communication ── */}
      <AccordionSection icon={MessageSquare} title="Communication" accentColor="purple" defaultOpen={true}>
        <div className="flex flex-wrap gap-2 pt-1">
          <ToggleChip label="Mail ID" field="mail" />
          <ToggleChip label="WhatsApp" field="whatsapp" />
          <ToggleChip label="Print" field="print" />
        </div>
      </AccordionSection>

      {/* ── Visitor Requirements ── */}
      <AccordionSection icon={ShieldCheck} title="Visitor Requirements" accentColor="cyan" defaultOpen={true}>
        <div className="space-y-3 pt-1">
          <div>
            <span className="text-[11px] font-bold text-slate-600 mb-1.5 block">Mandatory for On-Spot Visitors</span>
            <div className="flex flex-wrap gap-2">
              <ToggleChip label="Visitor Name" field="visitorName" locked />
              <ToggleChip label="Mail ID" field="visitorMail" />
              <ToggleChip label="Photo" field="visitorPhoto" />
              <ToggleChip label="Mobile" field="visitorMobile" />
              <ToggleChip label="Document Proof" field="documentProof" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <ToggleChip label="Day Pass" field="dayPass" />
            <ToggleChip label="International" field="isInternationalInclude" />
            <ToggleChip label="Include Program" field="includeProgram" />
            <ToggleChip label="Welcome Kit" field="welcomeKit" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-600 mb-1.5 block">Mandatory Documents</span>
            <div className="flex flex-wrap gap-2">
              <ToggleChip label="Aadhar" field="aadhar" />
              <ToggleChip label="Vehicle Pass" field="vehiclePass" />
              {formData.eventDetails?.isInternationalInclude && <ToggleChip label="Passport" field="passport" />}
              {formData.eventDetails?.vehiclePass && <ToggleChip label="Vehicle Number" field="vehicleNumber" />}
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* ── Food Provision ── */}
      <AccordionSection icon={Utensils} title="Food Provision"
        badge={formData.eventDetails?.food ? "Enabled" : undefined} accentColor="amber" defaultOpen={true}>
        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={Boolean(formData.eventDetails?.food)}
              onChange={() => handleToggle("food")}
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-slate-700">Include Food for this event</span>
          </label>
          {Boolean(formData.eventDetails?.food) && (
            <StepFoodProvision formData={formData} setFormData={setFormData} />
          )}
        </div>
      </AccordionSection>

      {/* ── Vehicle & Parking Pass ── */}
      <AccordionSection
        icon={Car}
        title="Vehicle & Parking Pass Allotment"
        badge={formData.eventDetails?.vehiclePass ? "Enabled" : undefined}
        accentColor="indigo"
        defaultOpen={true}
      >
        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(formData.eventDetails?.vehiclePass)}
              onChange={() => handleToggle("vehiclePass")}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-slate-700">Enable Vehicle Parking Passes for this event</span>
          </label>
          {Boolean(formData.eventDetails?.vehiclePass) && (
            <StepVehicleProvision formData={formData} setFormData={setFormData} />
          )}
        </div>
      </AccordionSection>

    </div>
  );
};

export default Step3FacilitiesLayout;
