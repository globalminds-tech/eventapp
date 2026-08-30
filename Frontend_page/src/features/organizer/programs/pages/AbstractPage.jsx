import { useEffect, useState, useMemo } from "react";
import { getAbstract } from "@/Services/api";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

function parseDate(d) {
  const [dd, mm, yy] = d.split("/");
  return new Date(yy, mm - 1, dd);
}

export const AbstractVerification = () => {
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
        const resData = await getAbstract();
        console.log("Abstract", resData);

        const formatted = resData.map((item) => ({
          code: item.event_code,
          name: item.event_name,
          start: new Date(item.start_date).toLocaleDateString("en-GB"),
          end: new Date(item.end_date).toLocaleDateString("en-GB"),
          approved: 0,
          rejected: 0,
          pending: 0,
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
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Abstract Verification
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search"
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
                  { key: "code", label: "Event Code" },
                  { key: "name", label: "Event Name" },
                  { key: "start", label: "Event StartDate" },
                  { key: "end", label: "Event EndDate" },
                  { key: "approved", label: "Approved" },
                  { key: "rejected", label: "Rejected" },
                  { key: "pending", label: "Pending" },
                ].map(({ key, label }) => (
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-sky-700 transition-colors"
                    key={key}
                    onClick={() => handleSort(key)}
                  >
                    {label}{" "}
                    <span style={{ fontSize: 11 }}>{sortIcon(key)}</span>
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
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{row.code}</td>
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{row.name}</td>
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{row.start}</td>
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{row.end}</td>
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{row.approved}</td>
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{row.rejected}</td>
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{row.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-4 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-sm font-medium">
                Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm font-medium">Records per page:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-sky-600 text-white shadow-lg shadow-sky-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}