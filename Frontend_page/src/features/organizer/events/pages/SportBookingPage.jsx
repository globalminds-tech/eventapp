import { useEffect, useState, useMemo } from "react";
import { getAddOnEvents } from "@/Services/api"; // adjust path
import { Search } from "lucide-react";

function parseDate(d) {
  const [dd, mm, yy] = d.split("/");
  return new Date(yy, mm - 1, dd);
}

export default function AddOnSpotBooking() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ✅ API CALL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await getAddOnEvents();

        const formatted = resData.map((item) => ({
          code: item.event_code,
          name: item.event_name,
          start: new Date(item.start_date).toLocaleDateString("en-GB"),
          end: new Date(item.end_date).toLocaleDateString("en-GB"),
        }));

        setData(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d * -1);
    else {
      setSortKey(key);
      setSortDir(1);
    }
    setPage(1);
  };

  const sortIcon = (key) =>
    sortKey === key ? (sortDir === 1 ? "↑" : "↓") : "↑↓";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    let filteredData = data.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.start.includes(q) ||
        r.end.includes(q)
    );

    if (sortKey) {
      filteredData = [...filteredData].sort((a, b) => {
        let av = a[sortKey],
          bv = b[sortKey];

        if (sortKey === "start" || sortKey === "end") {
          av = parseDate(av);
          bv = parseDate(bv);
        }

        return av > bv ? sortDir : av < bv ? -sortDir : 0;
      });
    }

    return filteredData;
  }, [search, sortKey, sortDir, data]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const startIndex = (page - 1) * perPage;
  const slice = filtered.slice(startIndex, startIndex + perPage);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Add-On Spot Booking
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Keyword..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-600 text-white">
                {[
                  { key: "Code", label: "Event Code" },
                  { key: "Name", label: "Event Name" },
                  { key: "start", label: "Event StartDate" },
                  { key: "end", label: "Event EndDate" },
                ].map(({ key, label }) => (
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    key={key}
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <span style={{ fontSize: 11 }}>{sortIcon(key)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {slice.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white"
                >
                  <td className="px-6 py-4 font-medium text-sky-900">{row.code}</td>
                  <td className="px-6 py-4 text-slate-700">{row.name}</td>
                  <td className="px-6 py-4 text-slate-600">{row.start}</td>
                  <td className="px-6 py-4 text-slate-600">{row.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          <span style={{ flex: 1 }}>
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + perPage, filtered.length)} of{" "}
            {filtered.length} entries
          </span>

          <div style={{ display: "flex", gap: 4 }}>
            {[["«", 1], ["‹", page - 1], [page, page], ["›", page + 1], ["»", totalPages]].map(
              ([label, p], idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(p)}
                  disabled={p < 1 || p > totalPages || p === page}
                  style={{
                    width: 28,
                    height: 28,
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    background: p === page ? "#2563EB" : "#fff",
                    color: p === page ? "#fff" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>

          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(+e.target.value);
              setPage(1);
            }}
            style={{
              height: 32,
              padding: "0 8px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}