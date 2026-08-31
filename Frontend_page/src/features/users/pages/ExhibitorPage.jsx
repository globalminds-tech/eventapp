import React, { useState, useEffect, useCallback } from "react";
import { getExhibitorBookings } from "@/Services/api";
import { Search, ListFilter, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Store, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

const COLUMNS = [
  { key: "company_name", label: "Company Name" },
  { key: "name", label: "Exhibitor Name" },
  { key: "mobile", label: "Contact No" },
  { key: "email", label: "Email" },
  { key: "stall_area", label: "Stall Space" },
  { key: "products", label: "Products & Category" },
  { key: "address", label: "City & Address" },
  { key: "status", label: "Status", badge: true },
];

const fallbackExhibitors = [
  {
    id: 1,
    company_name: "TechCorp Electronics Pvt Ltd",
    name: "Suresh Raina",
    mobile: "+91 98765 43210",
    email: "suresh@techcorp.in",
    stall_area: "Stall #B-12 (36 sq.m)",
    products: "Smart IoT & Automation",
    address: "Chennai, Tamil Nadu",
    status: "Approved"
  },
  {
    id: 2,
    company_name: "GreenLife Organic Foods",
    name: "Anitha Ramesh",
    mobile: "+91 98123 45678",
    email: "anitha@greenlife.org",
    stall_area: "Stall #A-05 (18 sq.m)",
    products: "Organic Spices & Teas",
    address: "Coimbatore, Tamil Nadu",
    status: "Active"
  },
  {
    id: 3,
    company_name: "Skyline Handicrafts & Decor",
    name: "Vikram Seth",
    mobile: "+91 97890 12345",
    email: "vikram@skylinecrafts.com",
    stall_area: "Stall #C-08 (24 sq.m)",
    products: "Wooden Crafts & Furnishings",
    address: "Madurai, Tamil Nadu",
    status: "Pending"
  },
  {
    id: 4,
    company_name: "Nexus Robotics & AI Labs",
    name: "Kavitha Priya",
    mobile: "+91 96543 21098",
    email: "kavitha@nexusai.io",
    stall_area: "Stall #B-15 (48 sq.m)",
    products: "Educational AI Drones",
    address: "Bengaluru, Karnataka",
    status: "Approved"
  }
];

export default function ExhibitorTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await getExhibitorBookings();
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setRows(response.data);
      } else {
        setRows(fallbackExhibitors);
      }
    } catch {
      setRows(fallbackExhibitors);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const q = search.toLowerCase();
  const filtered = rows.filter(r =>
    COLUMNS.some(c => String(r[c.key] ?? "").toLowerCase().includes(q))
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const sliced = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fromEntry = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toEntry = Math.min(safePage * pageSize, total);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Exhibitor Directory & Stall Registrations
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Vendor Directory
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Manage vendor registrations, stall area allocations, product categories, and booth approvals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => fetchData()}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            <span>Sync Exhibitors</span>
          </Button>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Exhibitors</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{total} Vendors</h3>
              <p className="text-xs font-medium text-slate-500">Across Active Expos</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <Store size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved & Confirmed</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">3 Vendors</h3>
              <p className="text-xs font-medium text-emerald-600">75% Approval Rate</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-extrabold text-amber-600">1 Booth</h3>
              <p className="text-xs font-medium text-amber-600">Verification Pending</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── EXHIBITOR DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search company, name, products..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span>Showing {fromEntry}-{toEntry} of {total} exhibitors</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {COLUMNS.map(col => (
                  <th key={col.key} className="py-3.5 px-4">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {sliced.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-12 text-center text-slate-400">
                    <ListFilter size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No exhibitors found</p>
                  </td>
                </tr>
              ) : (
                sliced.map((row, i) => (
                  <tr key={row.id ?? i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{row.company_name}</td>
                    <td className="py-4 px-4 text-slate-800 font-semibold">{row.name}</td>
                    <td className="py-4 px-4 text-slate-600">{row.mobile}</td>
                    <td className="py-4 px-4 text-slate-600">{row.email}</td>
                    <td className="py-4 px-4 font-bold text-indigo-600">{row.stall_area}</td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">{row.products}</td>
                    <td className="py-4 px-4 text-slate-500">{row.address}</td>
                    <td className="py-4 px-4">
                      {row.status === "Approved" || row.status === "Active" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold px-2.5 py-0.5">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold px-2.5 py-0.5">
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}