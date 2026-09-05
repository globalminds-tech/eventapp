import React, { useState, useEffect } from "react";
import { Database, Loader2, RefreshCw, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSelector } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import AddVendorModal from "../components/AddVendorModal";
import AddVenueModal from "../components/AddVenueModal";
import AddPolicyModal from "../components/AddPolicyModal";
import AddSponsorModal from "../components/AddSponsorModal";

export default function MasterDataPage() {
  const [selectedTab, setSelectedTab] = useState("vendor");
  const [loading, setLoading] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  const [vendors, setVendors] = useState([]);
  const [venues, setVenues] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const fetchData = async (tab) => {
    if (!organizerId) return;
    setLoading(true);
    try {
      if (tab === "vendor") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/all-vendors/${organizerId}`);
        setVendors(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } else if (tab === "venue") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/venues_details/${organizerId}`);
        setVenues(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } else if (tab === "policy") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/all-policies/${organizerId}`);
        setPolicies(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } else if (tab === "sponsor") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-sponsor-names/${organizerId}`);
        setSponsors(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      }
    } catch (err) {
      console.error(`Error fetching data for ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(selectedTab);
  }, [selectedTab, organizerId]);

  const getCurrentData = () => {
    let data = [];
    if (selectedTab === "vendor") data = vendors;
    else if (selectedTab === "venue") data = venues;
    else if (selectedTab === "policy") data = policies;
    else if (selectedTab === "sponsor") data = sponsors;
    
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return {
      currentData: data.slice(startIndex, endIndex),
      totalPages: Math.max(1, Math.ceil(data.length / rowsPerPage)),
      totalItems: data.length
    };
  };

  const { currentData, totalPages, totalItems } = getCurrentData();

  const tabs = [
    { label: "Vendor", value: "vendor" },
    { label: "Venue", value: "venue" },
    { label: "Policy", value: "policy" },
    { label: "Sponsor", value: "sponsor" },
  ];

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800 font-sans max-w-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Master Data
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
              <Database size={13} className="text-cyan-600" />
              <span>Configuration</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Manage your global vendors, venues, policies, and sponsors across all events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedTab === "vendor" && (
            <button
              onClick={() => setIsAddVendorOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer shadow-sm shadow-cyan-600/20"
            >
              <Plus size={14} />
              <span>Add Vendor</span>
            </button>
          )}
          {selectedTab === "venue" && (
            <button
              onClick={() => setIsAddVenueOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer shadow-sm shadow-cyan-600/20"
            >
              <Plus size={14} />
              <span>Add Venue</span>
            </button>
          )}
          {selectedTab === "policy" && (
            <button
              onClick={() => setIsAddPolicyOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer shadow-sm shadow-cyan-600/20"
            >
              <Plus size={14} />
              <span>Add Policy</span>
            </button>
          )}
          {selectedTab === "sponsor" && (
            <button
              onClick={() => setIsAddSponsorOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer shadow-sm shadow-cyan-600/20"
            >
              <Plus size={14} />
              <span>Add Sponsor</span>
            </button>
          )}
          <button
            onClick={() => fetchData(selectedTab)}
            className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-cyan-600" : "text-slate-500"} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-6 animate-in zoom-in-95 duration-500">
        {/* ── TABS ── */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedTab(t.value)}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                selectedTab === t.value
                  ? "bg-white text-cyan-700 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="pt-2 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-sm font-bold text-slate-500">Loading {selectedTab} data...</p>
            </div>
          ) : (
            <>
              {/* VENDOR TABLE */}
              {selectedTab === "vendor" && (
                <div className="animate-in fade-in duration-300">
                  {vendors.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                      <h3 className="text-lg font-bold text-slate-700">No Vendors Found</h3>
                      <p className="text-xs text-slate-500">You haven't added any vendors yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Vendor Name</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Company</th>
                            <th className="py-3 px-4">Contact</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {currentData.map((v, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 text-xs font-bold text-slate-800">{v.vendor_name || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600">{v.vendor_type || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600">{v.company_name || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                <div>{v.primary_contact || "-"}</div>
                                <div className="text-[10px] text-slate-400">{v.mail_id || ""}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200">
                                  {v.status || "Active"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                                    <Pencil size={14} />
                                  </button>
                                  <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* VENUE TABLE */}
              {selectedTab === "venue" && (
                <div className="animate-in fade-in duration-300">
                  {venues.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                      <h3 className="text-lg font-bold text-slate-700">No Venues Found</h3>
                      <p className="text-xs text-slate-500">You haven't added any venues yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Venue Name</th>
                            <th className="py-3 px-4">Location</th>
                            <th className="py-3 px-4">Address</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {currentData.map((v, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 text-xs font-bold text-slate-800">{v.venue_name || v.name || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                {v.city_name || v.city || "-"}, {v.state_name || v.state || ""}
                              </td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600 max-w-xs truncate" title={v.address}>
                                {v.address || "-"}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200">
                                  {v.status || "Active"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                                    <Pencil size={14} />
                                  </button>
                                  <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* POLICY TABLE */}
              {selectedTab === "policy" && (
                <div className="animate-in fade-in duration-300">
                  {policies.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                      <h3 className="text-lg font-bold text-slate-700">No Policies Found</h3>
                      <p className="text-xs text-slate-500">You haven't added any policies yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Policy Name</th>
                            <th className="py-3 px-4">Group</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {currentData.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 text-xs font-bold text-slate-800">{p.policy_name || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600">{p.policy_group || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600">{p.policy_type || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-500 max-w-md truncate" title={p.description}>
                                {p.description || "-"}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                                    <Pencil size={14} />
                                  </button>
                                  <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SPONSOR TABLE */}
              {selectedTab === "sponsor" && (
                <div className="animate-in fade-in duration-300">
                  {sponsors.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                      <h3 className="text-lg font-bold text-slate-700">No Sponsors Found</h3>
                      <p className="text-xs text-slate-500">You haven't added any sponsors yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Sponsor Name</th>
                            <th className="py-3 px-4">Contact</th>
                            <th className="py-3 px-4">Address</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {currentData.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 text-xs font-bold text-slate-800">{s.sponsor_name || "-"}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                <div>{s.primary_contact || "-"}</div>
                                <div className="text-[10px] text-slate-400">{s.mail_id || ""}</div>
                              </td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-600 max-w-xs truncate" title={s.address}>
                                {s.address || "-"}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200">
                                  {s.status || "Active"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                                    <Pencil size={14} />
                                  </button>
                                  <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {!loading && totalItems > 0 && (
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <label htmlFor="select-rows-per-page" className="text-xs font-semibold text-slate-600">Rows per page</label>
              <select 
                id="select-rows-per-page" 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="h-8 w-16 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-cyan-500 shadow-sm cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs font-semibold text-slate-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <AddVendorModal 
        isOpen={isAddVendorOpen} 
        onClose={() => setIsAddVendorOpen(false)} 
        onSuccess={() => fetchData("vendor")} 
      />

      <AddVenueModal 
        isOpen={isAddVenueOpen} 
        onClose={() => setIsAddVenueOpen(false)} 
        onSuccess={() => fetchData("venue")} 
      />

      <AddPolicyModal 
        isOpen={isAddPolicyOpen} 
        onClose={() => setIsAddPolicyOpen(false)} 
        onSuccess={() => fetchData("policy")} 
      />

      <AddSponsorModal 
        isOpen={isAddSponsorOpen} 
        onClose={() => setIsAddSponsorOpen(false)} 
        onSuccess={() => fetchData("sponsor")} 
      />
    </div>
  );
}
