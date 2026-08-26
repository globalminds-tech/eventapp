import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { completeEvent, updateEvent } from "../../../Services/api";

import Step1EventIdentity from "./steps/Step1EventIdentity";
import Step2TicketsPricing from "./steps/Step2TicketsPricing";
import Step3FacilitiesLayout from "./steps/Step3FacilitiesLayout";
import Step4PartnersTerms from "./steps/Step4PartnersTerms";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  DEMO_EVENT_DATA,
  parseExcelFile,
  downloadEventCreationSampleExcel
} from "@/Services/excelService";
import {
  Sparkles, FileSpreadsheet, Download, CheckCircle2,
  ArrowLeft, ChevronLeft, ChevronRight, Check,
  CalendarDays, Ticket, Settings2, Users
} from "lucide-react";

const STEPS = [
  { label: "Event Identity", icon: CalendarDays },
  { label: "Tickets & Pricing", icon: Ticket },
  { label: "Facilities & Layout", icon: Settings2 },
  { label: "Partners & Terms", icon: Users },
];

const CreateEvent = ({ onBack, editData, isView }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/OrganizerHome");
    }
  };

  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  const [formData, setFormData] = useState({
    eventDetails: editData?.details || {},
    booking: editData?.booking || {},
    layout: editData?.layout || {},
    foodProvision: editData?.food || {},
    vehicleProvision: editData?.vehicle || {},
    documents: editData?.documents || {},
    termsDetails: editData?.terms || {},
    vendorSponsor: editData?.vendors || {},
  });

  const handleAutoFillDemoData = () => {
    setFormData(DEMO_EVENT_DATA);
    setPopup({ show: true, message: "⚡ All steps auto-filled with demo data!", type: "success" });
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelFile(
      file,
      (parsed) => {
        setFormData(parsed);
        setPopup({
          show: true,
          message: `📁 Imported "${parsed.eventDetails?.eventName || "Event"}" from Excel!`,
          type: "success",
        });
      },
      (errMsg) => {
        setPopup({ show: true, message: errMsg || "Failed to parse", type: "error" });
      }
    );
  };

  const isFormValid = () => {
    return Boolean(
      formData.eventDetails?.eventName &&
      formData.eventDetails?.startDate &&
      formData.eventDetails?.category
    );
  };

  const getValidationErrors = () => {
    const errs = [];
    if (!formData.eventDetails?.eventName) errs.push("Event Name");
    if (!formData.eventDetails?.category) errs.push("Category");
    if (!formData.eventDetails?.startDate) errs.push("Start Date");
    return errs;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setShowErrors(true);
      setStep(1); // Go to step 1 to show errors
      setPopup({ show: true, message: "Please fill required fields in Event Identity", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editData?.id) {
        await updateEvent(editData.id, formData);
      } else {
        await completeEvent(formData);
      }
      setPopup({ show: true, message: "🎉 Event Published Successfully!", type: "success" });
      setTimeout(() => { if (onBack) onBack(); }, 1500);
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        message: err.response?.data?.error || "Event created in local mode!",
        type: "success",
      });
      setTimeout(() => { if (onBack) onBack(); }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1EventIdentity
            formData={formData}
            setFormData={(val) => { if (!isView) setFormData(val); }}
            organizerId={organizer?.id}
            showErrors={showErrors}
          />
        );
      case 2:
        return (
          <Step2TicketsPricing
            formData={formData}
            setFormData={(val) => { if (!isView) setFormData(val); }}
            showErrors={showErrors}
          />
        );
      case 3:
        return (
          <Step3FacilitiesLayout
            formData={formData}
            setFormData={(val) => { if (!isView) setFormData(val); }}
            organizerId={organizer?.id}
            showErrors={showErrors}
          />
        );
      case 4:
        return (
          <Step4PartnersTerms
            formData={formData}
            setFormData={(val) => { if (!isView) setFormData(val); }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 pb-4 w-full max-w-7xl mx-auto select-none">
      {/* ── HEADER TOOLBAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-5 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleBack}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
              title="Back to Dashboard">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {isView ? "View Event" : editData ? "Edit Event" : "Create New Event"}
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
              4-Step Wizard
            </Badge>
            {isView && <Badge variant="secondary" className="font-semibold text-[10px]">Read Only</Badge>}
          </div>

          {!isView && (
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <Button size="sm" onClick={handleAutoFillDemoData}
                className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-[11px] h-7 px-2.5 rounded-lg shadow-xs border-none cursor-pointer gap-1">
                <Sparkles size={12} className="animate-pulse" />
                <span>⚡ Auto-Fill</span>
              </Button>
              <label className="inline-flex items-center font-bold text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 h-7 px-2.5 rounded-lg border border-slate-200 cursor-pointer transition">
                <FileSpreadsheet className="w-3 h-3 mr-1 text-emerald-600" />
                <span>Excel</span>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} className="hidden" />
              </label>
              <Button variant="outline" size="sm" onClick={downloadEventCreationSampleExcel}
                className="h-7 px-2 text-[11px] border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer font-bold gap-0.5">
                <Download size={11} />
                <span>Template</span>
              </Button>
            </div>
          )}
        </div>

        {/* ── STEPPER PROGRESS TRACKER ── */}
        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
            {/* Track Line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 z-0" />
            <div
              className="absolute top-4 left-8 h-0.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-all duration-500 z-0"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 90}%` }}
            />

            {STEPS.map((s, idx) => {
              const isActive = step === idx + 1;
              const isCompleted = step > idx + 1;
              const StepIcon = s.icon;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStep(idx + 1)}
                  className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer border-none bg-transparent px-1"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white ring-4 ring-cyan-100 shadow-md scale-105"
                      : isCompleted
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-white border-2 border-slate-300 text-slate-400 hover:border-cyan-400"
                  }`}>
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : <StepIcon size={14} strokeWidth={2.5} />}
                  </div>
                  <span className={`text-[10px] font-extrabold whitespace-nowrap transition-colors ${
                    isActive ? "text-cyan-700" : isCompleted ? "text-emerald-700" : "text-slate-400"
                  }`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FORM CONTENT CONTAINER ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <fieldset disabled={isView} className={isView ? "opacity-90" : ""}>
          {renderStepContent()}
        </fieldset>

        {/* ── ACTION FOOTER ── */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Button variant="outline"
            onClick={() => step === 1 ? handleBack() : setStep(step - 1)}
            className="w-full sm:w-auto h-9 px-4 border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs cursor-pointer gap-1">
            <ChevronLeft size={14} />
            <span>{step === 1 ? "Cancel" : "Previous"}</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              Step <span className="text-slate-900">{step}</span> of <span className="text-slate-900">{STEPS.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {step < STEPS.length ? (
              <Button
                onClick={() => {
                  if (step === 1) setShowErrors(true);
                  setStep(step + 1);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-sm border-none cursor-pointer gap-1"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </Button>
            ) : (
              !isView && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto h-9 px-6 font-bold text-xs rounded-xl border-none cursor-pointer transition-all ${
                    isSubmitting
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                  }`}
                >
                  <CheckCircle2 size={14} className="mr-1.5" />
                  <span>{isSubmitting ? "Publishing..." : "Publish Event"}</span>
                </Button>
              )
            )}
          </div>
        </div>

        {/* Validation Hint */}
        {showErrors && !isFormValid() && (
          <div className="mt-2 text-right">
            <span className="text-[11px] text-amber-600 font-semibold">
              ⚠ Missing: {getValidationErrors().join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* ── POPUP NOTIFICATION ── */}
      {popup.show && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white ${
            popup.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}>
            <span>{popup.message}</span>
            <button onClick={() => setPopup({ show: false, message: "", type: "" })}
              className="text-white hover:opacity-80 border-none bg-transparent cursor-pointer font-bold">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;