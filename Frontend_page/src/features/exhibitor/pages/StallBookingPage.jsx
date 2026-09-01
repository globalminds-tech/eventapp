import React, { useState, useEffect, useRef } from "react";
import {
  Send, Upload, User, Mail, Phone, Building2, MapPin,
  X, ChevronDown, Briefcase, Package, Hash, Home,
  CreditCard, MessageSquare, FileText, Store, ArrowLeft, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { bookStall, getEventById, getCountries, getStates, getCities } from "@/Services/api";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/* ── Searchable Dropdown ─────────────────────────────────────────── */
const SearchableDropdown = ({ label, placeholder, value, options, displayKey, onSelect, onClear, error, disabled, emptyMessage }) => {
  const [search, setSearch] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ""); }, [value]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter((o) => o[displayKey].toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full flex flex-col gap-1" ref={ref}>
      {label && <label className="text-[11px] font-semibold text-slate-600 tracking-wide uppercase">{label}</label>}
      <div className="relative">
        <input
          type="text" value={search} placeholder={placeholder} disabled={disabled}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className={`flex h-9 w-full rounded-lg border bg-white px-3 py-2 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 transition-all ${error ? "border-red-400" : "border-slate-200"}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {search && (
            <button type="button" onClick={() => { setSearch(""); onClear?.(); setOpen(true); }}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X size={12} />
            </button>
          )}
          <button type="button" onClick={() => setOpen((o) => !o)} className="p-0.5 text-slate-400">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-36 overflow-y-auto">
            {filtered.length > 0 ? filtered.map((item) => (
              <div key={item.id}
                onMouseDown={(e) => { e.preventDefault(); onSelect(item); setSearch(item[displayKey]); setOpen(false); }}
                className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-sky-50 hover:text-sky-700 transition-colors ${item[displayKey] === value ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-700"}`}>
                {item[displayKey]}
              </div>
            )) : (
              <div className="px-3 py-2 text-xs text-slate-400 italic">{emptyMessage || "No results"}</div>
            )}
          </div>
        )}
      </div>
      {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
    </div>
  );
};

/* ── Compact Input wrapper with smaller label ─────────────────────── */
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-[11px] font-semibold text-slate-600 tracking-wide uppercase">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
  </div>
);

/* ── Toast ────────────────────────────────────────────────────────── */
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border-l-4 bg-white max-w-xs animate-in fade-in slide-in-from-right-4 duration-300 ${ok ? "border-emerald-500" : "border-rose-500"}`}>
      <div className={`p-1 rounded-lg shrink-0 ${ok ? "bg-emerald-100" : "bg-rose-100"}`}>
        {ok ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-800">{ok ? "Success" : "Error"}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────────────── */
const Stall = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const initial = {
    title: "Mr.", firstName: "", lastName: "", email: "", mobile: "",
    designation: "", companyName: "", country: "", state: "", city: "",
    address: "", message: "", pinCode: "", stallArea: "", products: "", visitingCard: null,
  };
  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (location.state?.event) setEventName(location.state.event.title);
    else fetchEvent();
    loadCountries();
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 5000); return () => clearTimeout(t); }
  }, [toast]);

  useEffect(() => { if (eventName) setFormData((p) => ({ ...p, eventName })); }, [eventName]);

  const fetchEvent = async () => { try { const r = await getEventById(id); setEventName(r.event_name); } catch (e) { console.error(e); } };
  const loadCountries = async () => { try { setCountries(await getCountries()); } catch (e) { console.error(e); } };
  const loadStates = async (cId) => { try { setStates(await getStates(cId)); setCities([]); } catch (e) { console.error(e); } };
  const loadCities = async (cId, sId) => { try { setCities(await getCities(cId, sId)); } catch (e) { console.error(e); } };

  const handleChange = (e) => {
    let { name, value, type, files } = e.target;
    setErrors({ ...errors, [name]: "" });
    if (type === "file") { setFormData({ ...formData, [name]: files[0] }); return; }
    if (typeof value === "string") {
      if (["email", "mobile", "pinCode"].includes(name)) value = value.replace(/\s/g, "");
      else value = value.trimStart();
    }
    if (["mobile", "pinCode"].includes(name)) {
      if (value !== "" && !/^\d*$/.test(value)) return;
      if (name === "mobile" && value.length > 10) return;
      if (name === "pinCode" && value.length > 6) return;
    }
    if (["firstName", "lastName"].includes(name)) {
      if (value !== "" && !/^[a-zA-Z\s]*$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newErrors = {};
    const required = ["firstName", "lastName", "email", "mobile", "companyName", "country", "state", "city", "address", "stallArea", "products", "pinCode"];
    const labels = { firstName: "First Name", lastName: "Last Name", email: "Email", mobile: "Mobile", companyName: "Company", country: "Country", state: "State", city: "City", address: "Address", stallArea: "Stall Area", products: "Products", pinCode: "Pin Code" };
    required.forEach((f) => { if (!formData[f]?.toString().trim()) newErrors[f] = `${labels[f]} is required`; });
    if (formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) newErrors.email = "Invalid email";
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Must be 10 digits";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setLoading(false); return; }

    const fd = new FormData();
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
    fd.append("event_id", id); fd.append("user_id", user.id); fd.append("eventName", eventName);

    try {
      await bookStall(fd);
      setToast({ message: "Stall booked! Redirecting to dashboard…", type: "success" });
      setFormData(initial);
      setTimeout(() => navigate("/exhibitor/dashboard"), 3000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to book stall.", type: "error" });
    } finally { setLoading(false); }
  };

  const inp = (name, placeholder, extra = {}) => (
    <input
      name={name} value={formData[name]} placeholder={placeholder}
      onChange={handleChange} {...extra}
      className={`flex h-9 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all ${errors[name] ? "border-red-400" : "border-slate-200"}`}
    />
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Top Header Bar ─────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Exhibition Stall Reservation</h1>
            <p className="text-[11px] text-slate-500 leading-tight">{eventName || "Reserve your exhibition booth"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Exhibitor Portal</Badge>
        </div>
      </div>

      {/* ── 3-Column Form Body ─────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full max-w-[1600px] mx-auto">

            {/* ── COLUMN 1: Personal Information ─────────── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-sky-100 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">Personal Info</span>
                <Badge variant="default" className="ml-auto text-[10px] py-0">Step 1</Badge>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Title + Name */}
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Title">
                    <select name="title" value={formData.title} onChange={handleChange}
                      className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all">
                      <option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option>
                    </select>
                  </Field>
                  <Field label="First Name" required>
                    {inp("firstName", "John")}
                    {errors.firstName && <span className="text-[10px] text-red-500">{errors.firstName}</span>}
                  </Field>
                  <Field label="Last Name" required>
                    {inp("lastName", "Doe")}
                    {errors.lastName && <span className="text-[10px] text-red-500">{errors.lastName}</span>}
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email" required>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input name="email" type="email" value={formData.email} placeholder="john@company.com"
                      onChange={handleChange}
                      className={`flex h-9 w-full rounded-lg border bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all ${errors.email ? "border-red-400" : "border-slate-200"}`} />
                  </div>
                  {errors.email && <span className="text-[10px] text-red-500">{errors.email}</span>}
                </Field>

                {/* Mobile + Designation */}
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Mobile" required>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input name="mobile" type="tel" value={formData.mobile} placeholder="10 digits" maxLength="10"
                        onChange={handleChange}
                        className={`flex h-9 w-full rounded-lg border bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all ${errors.mobile ? "border-red-400" : "border-slate-200"}`} />
                    </div>
                    {errors.mobile && <span className="text-[10px] text-red-500">{errors.mobile}</span>}
                  </Field>
                  <Field label="Designation">
                    {inp("designation", "Sales Manager")}
                  </Field>
                </div>

                {/* Company */}
                <Field label="Company Name" required>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input name="companyName" value={formData.companyName} placeholder="Your company"
                      onChange={handleChange}
                      className={`flex h-9 w-full rounded-lg border bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all ${errors.companyName ? "border-red-400" : "border-slate-200"}`} />
                  </div>
                  {errors.companyName && <span className="text-[10px] text-red-500">{errors.companyName}</span>}
                </Field>

                {/* Stall Area + Products */}
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Stall Area" required>
                    {inp("stallArea", "e.g. Hall A, 3×3m")}
                    {errors.stallArea && <span className="text-[10px] text-red-500">{errors.stallArea}</span>}
                  </Field>
                  <Field label="Products" required>
                    {inp("products", "e.g. Electronics")}
                    {errors.products && <span className="text-[10px] text-red-500">{errors.products}</span>}
                  </Field>
                </div>
              </div>
            </div>

            {/* ── COLUMN 2: Location ──────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">Location</span>
                <Badge variant="purple" className="ml-auto text-[10px] py-0">Step 2</Badge>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <SearchableDropdown
                  label={<>Country <span className="text-red-500">*</span></>}
                  placeholder="Search country…"
                  value={formData.country}
                  options={countries}
                  displayKey="country_name"
                  error={errors.country}
                  onSelect={(c) => {
                    setFormData((p) => ({ ...p, country: c.country_name, state: "", city: "" }));
                    setErrors((p) => ({ ...p, country: "", state: "", city: "" }));
                    loadStates(c.id);
                  }}
                  onClear={() => { setFormData((p) => ({ ...p, country: "", state: "", city: "" })); setStates([]); setCities([]); }}
                />
                <SearchableDropdown
                  label={<>State <span className="text-red-500">*</span></>}
                  placeholder="Search state…"
                  value={formData.state}
                  options={states}
                  displayKey="state_name"
                  error={errors.state}
                  disabled={!formData.country}
                  emptyMessage={!formData.country ? "Select a country first" : "No results"}
                  onSelect={(s) => {
                    setFormData((p) => ({ ...p, state: s.state_name, city: "" }));
                    setErrors((p) => ({ ...p, state: "", city: "" }));
                    const c = countries.find((c) => c.country_name === formData.country);
                    if (c) loadCities(c.id, s.id);
                  }}
                  onClear={() => { setFormData((p) => ({ ...p, state: "", city: "" })); setCities([]); }}
                />
                <SearchableDropdown
                  label={<>City <span className="text-red-500">*</span></>}
                  placeholder="Search city…"
                  value={formData.city}
                  options={cities}
                  displayKey="city_name"
                  error={errors.city}
                  disabled={!formData.state}
                  emptyMessage={!formData.state ? "Select a state first" : "No results"}
                  onSelect={(c) => { setFormData((p) => ({ ...p, city: c.city_name })); setErrors((p) => ({ ...p, city: "" })); }}
                  onClear={() => setFormData((p) => ({ ...p, city: "" }))}
                />

                {/* Pin Code */}
                <Field label="Pin Code" required>
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input name="pinCode" value={formData.pinCode} placeholder="6-digit pin" maxLength="6"
                      onChange={handleChange}
                      className={`flex h-9 w-full rounded-lg border bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all ${errors.pinCode ? "border-red-400" : "border-slate-200"}`} />
                  </div>
                  {errors.pinCode && <span className="text-[10px] text-red-500">{errors.pinCode}</span>}
                </Field>

                {/* Address */}
                <Field label="Address" required>
                  <textarea name="address" value={formData.address} placeholder="Street address, building, area…"
                    maxLength={100} rows={3} onChange={handleChange}
                    className={`flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 resize-none transition-all ${errors.address ? "border-red-400" : "border-slate-200"}`} />
                  {errors.address
                    ? <span className="text-[10px] text-red-500">{errors.address}</span>
                    : <span className="text-[10px] text-slate-400">{formData.address.length}/100</span>}
                </Field>
              </div>
            </div>

            {/* ── COLUMN 3: Additional + Actions ─────────── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">Details & Submit</span>
                <Badge variant="warning" className="ml-auto text-[10px] py-0">Step 3</Badge>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Visiting Card Upload */}
                <Field label={<span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Visiting Card <Badge variant="secondary" className="text-[9px] py-0 ml-1">Optional</Badge></span>}>
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 hover:bg-sky-50 hover:border-sky-300 cursor-pointer transition-all group">
                    <input type="file" name="visitingCard" onChange={handleChange} className="hidden" accept="image/*,.pdf" />
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-sky-500 mb-1 transition-colors" />
                    <span className="text-xs text-slate-500 group-hover:text-sky-600 font-medium transition-colors text-center px-2">
                      {formData.visitingCard ? formData.visitingCard.name : "Click to upload"}
                    </span>
                    {!formData.visitingCard && <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF</span>}
                  </label>
                  {formData.visitingCard && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-50 border border-sky-100">
                      <CheckCircle className="w-3 h-3 text-sky-600 shrink-0" />
                      <span className="text-[11px] text-sky-700 font-medium truncate">{formData.visitingCard.name}</span>
                    </div>
                  )}
                </Field>

                {/* Message */}
                <Field label={<span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Message</span>}>
                  <textarea name="message" value={formData.message}
                    placeholder="Any special requirements or questions…"
                    maxLength={100} rows={4} onChange={handleChange}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 resize-none transition-all" />
                  <span className="text-[10px] text-slate-400">{formData.message.length}/100</span>
                </Field>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Summary strip */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Booking Summary</p>
                  <div className="flex flex-col gap-1">
                    {[
                      { label: "Event", val: eventName || "—" },
                      { label: "Exhibitor", val: formData.firstName ? `${formData.title} ${formData.firstName} ${formData.lastName}`.trim() : "—" },
                      { label: "Company", val: formData.companyName || "—" },
                      { label: "Stall", val: formData.stallArea || "—" },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500">{label}</span>
                        <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[60%] text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="default" onClick={() => navigate(-1)} className="gap-1.5 flex-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Cancel
                  </Button>
                  <Button type="submit" variant="gradient" size="default" disabled={loading} className="gap-1.5 flex-[2]">
                    {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</> : <><Send className="w-3.5 h-3.5" /> Reserve Stall</>}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">By submitting, you agree to our terms</p>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default Stall;