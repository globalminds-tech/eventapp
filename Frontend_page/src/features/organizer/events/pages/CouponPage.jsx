import { useState } from "react";

const ChevronUpDown = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L10 6H2L6 2Z" fill="#64748b" />
    <path d="M6 14L2 10H10L6 14Z" fill="#64748b" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const columns = [
  { key: "action", label: "Action" },
  { key: "event", label: "Event" },
  { key: "couponCode", label: "Coupon Code" },
  { key: "applicableUser", label: "Applicable User" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "couponType", label: "Coupon Type" },
  { key: "discountPercentage", label: "Discount Percentage" },
  { key: "discountAmount", label: "Discount Amount" },
  { key: "status", label: "Status" },
  { key: "createdBy", label: "Created By" },
  { key: "createdOn", label: "Created On" },
];

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1" style={{ gap: "1px" }}>
    <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 0L8 5H0L4 0Z" fill="#94a3b8" /></svg>
    <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 5L0 0H8L4 5Z" fill="#94a3b8" /></svg>
  </span>
);

const ListPage = ({ onAdd }) => {
  const [search, setSearch] = useState("");

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Coupon Code
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Keyword..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 flex items-center justify-center">
              <SearchIcon />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <div className="flex items-center justify-center w-5 h-5"><PlusIcon /></div>
              Add Coupon
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 900 }}>
              <thead>
                <tr className="bg-sky-600 text-white">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                    >
                      <div className="flex items-center">
                        {col.label}
                        {col.key !== "action" && <SortIcon />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-sky-50/50 transition-colors duration-200 group">
                  <td
                    colSpan={columns.length}
                    className="text-center py-8 text-sm"
                    style={{ color: "#94a3b8" }}
                  >
                    No Data Found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid #e2e8f0" }}
          >
            <div className="flex-1" />
            <div className="flex items-center gap-3 ml-6">
              <span className="text-sm" style={{ color: "#64748b" }}>Showing 0 to 0 of 0 entries</span>
              <div className="flex gap-1">
                {["«", "‹", "›", "»"].map((arrow, i) => (
                  <button
                    key={i}
                    className="rounded px-2 py-1 text-sm hover:bg-gray-100"
                    style={{ border: "1px solid #e2e8f0", color: "#64748b", minWidth: 28 }}
                  >
                    {arrow}
                  </button>
                ))}
              </div>
              <div
                className="flex items-center gap-1 rounded px-2 py-1"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <span className="text-sm" style={{ color: "#334155" }}>10</span>
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormPage = ({ onBack }) => {
  const [discountType, setDiscountType] = useState("percentage");

  const inputClass = "w-full rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200";
  const inputStyle = { border: "1px solid #cbd5e1", color: "#334155", background: "#fff", height: 40 };
  const labelClass = "block text-sm font-medium mb-1";
  const labelStyle = { color: "#1e293b" };
  const required = <span style={{ color: "#ef4444" }}>*</span>;

  return (
    <div className="min-h-screen" style={{ background: "#eef2f7" }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold" style={{ color: "#1e3a5f" }}>Coupon Code</h1>
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center rounded text-white transition-all hover:opacity-90"
              style={{ width: 34, height: 34, background: "#2563eb", border: "none", cursor: "pointer" }}
            >
              <SaveIcon />
            </button>
            <button
              className="flex items-center justify-center rounded text-white transition-all hover:opacity-90"
              style={{ width: 34, height: 34, background: "#ef4444", border: "none", cursor: "pointer" }}
            >
              <DeleteIcon />
            </button>
            <button
              className="flex items-center justify-center rounded text-white transition-all hover:opacity-90"
              style={{ width: 34, height: 34, background: "#64748b", border: "none", cursor: "pointer" }}
              onClick={onBack}
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* Three-column form */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {/* Basic Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
            <h2 className="text-lg font-semibold mb-5" style={{ color: "#2563eb" }}>Basic Details</h2>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Event {required}</label>
              <div className="relative">
                <select
                  className={inputClass}
                  style={{ ...inputStyle, appearance: "none", paddingRight: 32 }}
                >
                  <option value="">Select Event</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown />
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Coupon Code {required}</label>
              <input
                type="text"
                placeholder="Enter Coupon Code"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Applicable User {required}</label>
              <div className="relative">
                <select
                  className={inputClass}
                  style={{ ...inputStyle, appearance: "none", paddingRight: 32 }}
                >
                  <option value="">Select User</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown />
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Validity {required}</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Start Date"
                    className={inputClass}
                    style={{ ...inputStyle, paddingRight: 36 }}
                  />
                  <button
                    className="absolute right-0 top-0 h-full flex items-center justify-center rounded-r"
                    style={{ width: 36, background: "#2563eb", border: "none", cursor: "pointer" }}
                  >
                    <CalendarIcon />
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Start Time"
                    className={inputClass}
                    style={{ ...inputStyle, paddingRight: 36 }}
                  />
                  <button
                    className="absolute right-0 top-0 h-full flex items-center justify-center rounded-r"
                    style={{ width: 36, background: "#2563eb", border: "none", cursor: "pointer" }}
                  >
                    <CalendarIcon />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="End Date"
                    className={inputClass}
                    style={{ ...inputStyle, paddingRight: 36 }}
                  />
                  <button
                    className="absolute right-0 top-0 h-full flex items-center justify-center rounded-r"
                    style={{ width: 36, background: "#2563eb", border: "none", cursor: "pointer" }}
                  >
                    <CalendarIcon />
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="End Time"
                    className={inputClass}
                    style={{ ...inputStyle, paddingRight: 36 }}
                  />
                  <button
                    className="absolute right-0 top-0 h-full flex items-center justify-center rounded-r"
                    style={{ width: 36, background: "#2563eb", border: "none", cursor: "pointer" }}
                  >
                    <CalendarIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <label className={labelClass} style={labelStyle}>Status {required}</label>
              <div className="relative">
                <select
                  className={inputClass}
                  style={{ ...inputStyle, appearance: "none", paddingRight: 32, background: "#f1f5f9" }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown />
                </span>
              </div>
            </div>
          </div>

          {/* Coupon Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
            <h2 className="text-lg font-semibold mb-5" style={{ color: "#2563eb" }}>Coupon Details</h2>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Minimum Ticket Quantity {required}</label>
              <input
                type="text"
                placeholder="Enter Minimum Ticket Quantity"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Minimum Booking Amount Required {required}</label>
              <input
                type="text"
                placeholder="Enter Minimum Booking Amount"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Maximum Booking Amount Allowed</label>
              <input
                type="text"
                placeholder="Enter Maximum Booking Amount"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Deduction Amount (If Max Booking Amount Reached)</label>
              <input
                type="text"
                placeholder="Enter Deduction Amount"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Coupon Description</label>
              <textarea
                placeholder="Enter Coupon Description"
                className={inputClass}
                style={{ ...inputStyle, height: 100, resize: "vertical", paddingTop: 8 }}
              />
            </div>
          </div>

          {/* Discounts + Usage Limit */}
          <div className="bg-white rounded-lg p-6 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
            <h2 className="text-lg font-semibold mb-5" style={{ color: "#2563eb" }}>Discounts</h2>

            {/* Radio buttons */}
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#334155" }}>
                <input
                  type="radio"
                  name="discountType"
                  value="percentage"
                  checked={discountType === "percentage"}
                  onChange={() => setDiscountType("percentage")}
                  className="w-4 h-4"
                  style={{ accentColor: "#2563eb" }}
                />
                Percentage
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#334155" }}>
                <input
                  type="radio"
                  name="discountType"
                  value="amount"
                  checked={discountType === "amount"}
                  onChange={() => setDiscountType("amount")}
                  className="w-4 h-4"
                  style={{ accentColor: "#2563eb" }}
                />
                Amount
              </label>
            </div>

            <div className="mb-8">
              <input
                type="text"
                placeholder={discountType === "percentage" ? "Enter Discount Percentage" : "Enter Discount Amount"}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <h2 className="text-lg font-semibold mb-5" style={{ color: "#2563eb" }}>Usage Limit</h2>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Maximum usage per event {required}</label>
              <input
                type="text"
                placeholder="Enter Maximum usage per event"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass} style={labelStyle}>Maximum usage per visitor {required}</label>
              <input
                type="text"
                placeholder="Enter Maximum usage per visitor"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CouponCode() {
  const [view, setView] = useState("list");

  return view === "list"
    ? <ListPage onAdd={() => setView("form")} />
    : <FormPage onBack={() => setView("list")} />;
}