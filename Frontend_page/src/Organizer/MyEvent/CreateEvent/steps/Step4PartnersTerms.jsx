import React, { useState } from "react";
import { Users, Award, UserPlus, ScrollText, ChevronDown } from "lucide-react";
import Step5Terms from "./Step5Terms";
import Step6VendorSponsor from "./Step6VendorSponsor";

// ── Reusable Accordion Section ──
const AccordionSection = ({ icon: Icon, title, badge, children, defaultOpen = false, accentColor = "cyan" }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
  };
  const c = colorMap[accentColor] || colorMap.cyan;

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden transition-all ${open ? "shadow-sm" : ""}`}>
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

const Step4PartnersTerms = ({ formData, setFormData }) => {
  const vendorCount = formData.vendorSponsor?.vendors?.length || 0;
  const sponsorCount = formData.vendorSponsor?.sponsors?.length || 0;
  const guestCount = formData.vendorSponsor?.guests?.length || 0;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3">
      {/* ── Section Header ── */}
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-purple-50 rounded-lg">
          <Users className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">Partners & Policies</h3>
        <span className="text-[10px] text-slate-500 font-medium">
          Manage vendors, sponsors, guests, and event terms
        </span>
      </div>

      {/* ── Vendors, Sponsors & Guests ── */}
      <AccordionSection
        icon={Users}
        title="Vendors, Sponsors & Guests"
        badge={
          vendorCount + sponsorCount + guestCount > 0
            ? `${vendorCount + sponsorCount + guestCount} added`
            : undefined
        }
        accentColor="cyan"
        defaultOpen={true}
      >
        <Step6VendorSponsor formData={formData} setFormData={setFormData} />
      </AccordionSection>

      {/* ── Terms & Policies ── */}
      <AccordionSection
        icon={ScrollText}
        title="Terms & Policies"
        accentColor="amber"
        defaultOpen={false}
      >
        <Step5Terms formData={formData} setFormData={setFormData} />
      </AccordionSection>
    </div>
  );
};

export default Step4PartnersTerms;
