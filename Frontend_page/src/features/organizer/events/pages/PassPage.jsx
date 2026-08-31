import { useState, useRef } from "react";

// ── Sample data ──────────────────────────────────────────────
const EVENTS = [
  { id: 1, code: "EVT-25", name: "MRC Event", visitors: 11 },
  { id: 2, code: "EVT-22", name: "VALLUVAR KOTTAM PARK", visitors: 71 },
  { id: 3, code: "EVT-9", name: "Furniture and Home Products Expo", visitors: 1 },
  { id: 4, code: "EVT-12", name: "LOGMAT EXPO - 2025", visitors: 2 },
  { id: 5, code: "EVT-11", name: "DISTRICT CONFERENCE 2025", visitors: 2 },
  { id: 6, code: "EVT-10", name: "Global Startup Networking", visitors: 1 },
  { id: 7, code: "EVT-6", name: "Interactive Art Installation or Digital Art Show", visitors: 4 },
  { id: 8, code: "EVT-5", name: "MedTech for CSI: Advancements in Medicine", visitors: 2 },
  { id: 9, code: "EVT-4", name: "Comic Con 2025", visitors: 1 },
  { id: 10, code: "EVT-3", name: "Flower Show At Semmozhi Poonga", visitors: 1 },
  { id: 11, code: "EVT-1", name: "Tech Summit 2025", visitors: 5 },
];

// ── Visitor Pass Card (image 3) ───────────────────────────────
function PassCard({ visitor, event, onClose }) {
  const cardRef = useRef(null);

  const downloadPass = async () => {
    const html2canvas = (await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")).default;
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = `pass-${visitor.code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        {/* The actual pass card */}
        <div
          ref={cardRef}
          style={{
            width: 280,
            background: "white",
            borderRadius: 12,
            overflow: "hidden",
            fontFamily: "'Segoe UI', sans-serif",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          {/* Top orange wave */}
          <div style={{ background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)", height: 48, position: "relative", overflow: "hidden" }}>
            <svg viewBox="0 0 280 48" style={{ position: "absolute", bottom: -1, left: 0, width: "100%" }} preserveAspectRatio="none">
              <path d="M0,24 Q70,48 140,24 Q210,0 280,24 L280,48 L0,48 Z" fill="white" />
            </svg>
          </div>

          {/* Body */}
          <div style={{ padding: "16px 24px", textAlign: "center" }}>
            <p style={{ color: "#1e3a8a", fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
              {event?.name || "MRC Event"}
            </p>

            {/* Logo placeholder */}
            <div style={{ margin: "0 auto 12px", width: 90, height: 90, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>🎭</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#1e40af", letterSpacing: 1 }}>SAMAVESHA</div>
                <div style={{ fontSize: 9, color: "#64748b" }}>2025</div>
              </div>
            </div>

            <p style={{ color: "#1e3a8a", fontSize: 11, fontWeight: 500, marginBottom: 4 }}>
              01-08-2025 To 01-08-2025
            </p>
            <p style={{ color: "#1e3a8a", fontSize: 11, marginBottom: 16 }}>MRC Nagar</p>

            <p style={{ fontWeight: 800, fontSize: 22, color: "#111827", letterSpacing: 2, marginBottom: 4 }}>
              {(visitor.name || "VISITOR").toUpperCase()}
            </p>
            <div style={{ height: 3, background: "#111827", width: 80, margin: "0 auto 12px" }} />

            {/* QR placeholder */}
            <div style={{ width: 72, height: 72, background: "#f1f5f9", margin: "0 auto 10px", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>QR Code</div>
            </div>

            <p style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{visitor.code}</p>
          </div>

          {/* Bottom orange bar */}
          <div style={{ background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)", position: "relative", overflow: "hidden" }}>
            <svg viewBox="0 0 280 32" style={{ position: "absolute", top: -1, left: 0, width: "100%" }} preserveAspectRatio="none">
              <path d="M0,16 Q70,0 140,16 Q210,32 280,16 L280,0 L0,0 Z" fill="white" />
            </svg>
            <div style={{ paddingTop: 20, paddingBottom: 14, textAlign: "center" }}>
              <p style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>Visitors</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={downloadPass}
            className="flex-1 py-2 rounded-lg text-white font-semibold text-sm"
            style={{ background: "#2563eb" }}
          >
            ⬇ Download Pass
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg font-semibold text-sm border border-gray-300 text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page 2: Event detail with visitor table ───────────────────
function EventDetailPage({ event, onBack }) {
  const [search, setSearch] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [passCard, setPassCard] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const nextCode = `VIS-${4595 - visitors.length}`;

  const handleGetPass = () => {
    const q = search.trim();
    if (!q) return;
    const newVisitor = {
      code: nextCode,
      name: q,
      contact: "",
      email: q.includes("@") ? q : "",
      id: Date.now(),
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    setSearch("");
  };

  const handleClear = () => setSearch("");

  const totalPages = Math.max(1, Math.ceil(visitors.length / perPage));
  const paged = visitors.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Pass</h1>
      </div>

      <div className="flex gap-6 flex-wrap">
        {/* Left: Search panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" style={{ minWidth: 280, flex: "0 0 320px" }}>
          <h2 className="text-blue-600 font-semibold text-lg mb-4">Search / Scan QR Here to Get Pass</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGetPass()}
            placeholder="Contactno / Name / Mail ID / Visitor Code"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex gap-3">
            <button
              onClick={handleGetPass}
              className="px-4 py-2 border-2 border-blue-700 text-blue-700 rounded text-sm font-medium hover:bg-blue-50 transition"
            >
              Get Pass
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border-2 border-blue-700 text-blue-700 rounded text-sm font-medium hover:bg-blue-50 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right: Visitors table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1" style={{ minWidth: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-blue-600 font-semibold text-base">No. of Passes</h2>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-sky-600 text-white">
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Visitor Code <span className="text-sky-200">↑↓</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Name <span className="text-sky-200">↑↓</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Contact No <span className="text-sky-200">↑↓</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Mail ID <span className="text-sky-200">↑↓</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-500 py-10 text-sm">
                        No passes yet. Search above to add a visitor.
                      </td>
                    </tr>
                  ) : (
                    paged.map((v, i) => (
                      <tr key={v.id} className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setPassCard(v)}
                            className="text-gray-500 hover:text-blue-600 transition"
                            title="Print Pass"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-6 py-4 font-medium text-sky-900">{v.code}</td>
                        <td className="px-6 py-4 text-slate-700">{v.name}</td>
                        <td className="px-6 py-4 text-slate-600">{v.contact}</td>
                        <td className="px-6 py-4 text-slate-600">{v.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-600 border-t border-gray-100">
            <span>Showing {visitors.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, visitors.length)} of {visitors.length} entries</span>
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">‹</button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-7 h-7 rounded text-sm font-medium"
                style={{ background: page === i + 1 ? "#2563eb" : "transparent", color: page === i + 1 ? "white" : "#374151" }}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">»</button>
            <select
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {passCard && (
        <PassCard visitor={passCard} event={event} onClose={() => setPassCard(null)} />
      )}
    </div>
  );
}

// ── Page 1: Event list ────────────────────────────────────────
export default function Pass() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("code");
  const [sortDir, setSortDir] = useState("asc");

  if (selectedEvent) {
    return <EventDetailPage event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  const filtered = EVENTS.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = sortField === "code" ? a.code : a.name;
    const vb = sortField === "code" ? b.code : b.name;
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paged = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pass</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Keyword..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <svg className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sky-600 text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("code")}
                  >
                    Event Code <span className="text-sky-200 ml-1">↑↓</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    Event Name <span className="text-sky-200 ml-1">↑↓</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Visitor Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paged.map((ev, i) => (
                  <tr key={ev.id} className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View Passes"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-sky-900">{ev.code}</td>
                    <td className="px-6 py-4 text-slate-700">{ev.name}</td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{ev.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-600 border-t border-gray-100">
          <span>
            Showing {sorted.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, sorted.length)} of {sorted.length} entries
          </span>
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">‹</button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className="w-7 h-7 rounded text-sm font-medium"
              style={{ background: page === i + 1 ? "#2563eb" : "transparent", color: page === i + 1 ? "#374151" : "#374151" }}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">»</button>
          <select
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}