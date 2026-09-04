import React, { useState } from "react";
import { Users, ChevronDown, FileText } from "lucide-react";
import Step6VendorSponsor from "./Step6VendorSponsor";
import Step4Documents from "./Step4Documents";

// ── Reusable Accordion Section ──
const AccordionSection = ({ icon: Icon, title, badge, children, defaultOpen = true, accentColor = "cyan" }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
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

const Step4PartnersTerms = ({ formData, setFormData, isReadOnly, showErrors }) => {
  const vendorCount = formData.vendorSponsor?.vendors?.length || 0;
  const sponsorCount = formData.vendorSponsor?.sponsors?.length || 0;
  const guestCount = formData.vendorSponsor?.guests?.length || 0;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3">

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
        <Step6VendorSponsor formData={formData} setFormData={setFormData} isReadOnly={isReadOnly} />
      </AccordionSection>

      {/* ── Documents & Media ── */}
      <AccordionSection
        icon={FileText}
        title="Additional Documents"
        badge={formData.documents?.additionalDocs?.length > 0 ? `${formData.documents.additionalDocs.length} uploaded` : undefined}
        accentColor="rose"
        defaultOpen={true}
      >
        <Step4Documents formData={formData} setFormData={setFormData} showStep4Errors={showErrors} isReadOnly={isReadOnly} />
      </AccordionSection>
    </div>
  );
};

export default Step4PartnersTerms;
