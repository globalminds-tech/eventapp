import React from "react";
import Step6VendorSponsor from "./Step6VendorSponsor";

const Step4PartnersTerms = ({ formData, setFormData, isReadOnly, showErrors }) => {
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3">
      {/* ── Vendors, Sponsors & Guests ── */}
      <Step6VendorSponsor formData={formData} setFormData={setFormData} isReadOnly={isReadOnly} />
    </div>
  );
};

export default Step4PartnersTerms;

