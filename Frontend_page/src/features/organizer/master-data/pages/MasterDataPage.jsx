import React, { useState, useEffect } from "react";
import {
  Database,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  ScrollText,
  Award,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSelector } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";
import AddVendorModal from "../components/AddVendorModal";
import AddVenueModal from "../components/AddVenueModal";
import AddPolicyModal from "../components/AddPolicyModal";
import AddSponsorModal from "../components/AddSponsorModal";
import { usePermissions } from "@/shared/context/PermissionContext";

export default function MasterDataPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(["master_data.create", "master_data.manage"]);
  const canEdit = hasPermission(["master_data.edit", "master_data.manage"]);
  const canDelete = hasPermission(["master_data.delete", "master_data.manage"]);

  const [selectedTab, setSelectedTab] = useState("vendor");
  const [loading, setLoading] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);

  // Edit state — stores the row data being edited
  const [editVendor, setEditVendor] = useState(null);
  const [editVenue, setEditVenue] = useState(null);
  const [editPolicy, setEditPolicy] = useState(null);
  const [editSponsor, setEditSponsor] = useState(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [vendors, setVendors] = useState([]);
  const [venues, setVenues] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  // Sort list in descending order: latest addition always on top
  const sortLatestFirst = (list) => {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      const dateA = a?.created_at || a?.createdAt || a?.created_on || a?.createdOn || null;
      const dateB = b?.created_at || b?.createdAt || b?.created_on || b?.createdOn || null;

      const timeA = dateA ? new Date(dateA).getTime() : null;
      const timeB = dateB ? new Date(dateB).getTime() : null;

      const validA = timeA !== null && !isNaN(timeA);
      const validB = timeB !== null && !isNaN(timeB);

      if (validA && validB && timeA !== timeB) {
        return timeB - timeA;
      }
      if (validB && !validA) return 1;
      if (validA && !validB) return -1;

      const numA = Number(a?.id);
      const numB = Number(b?.id);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numB - numA;
      }

      return 0;
    });
  };

  const fetchData = async (tab) => {
    if (!organizerId) return;
    setLoading(true);
    try {
      if (tab === "vendor") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/all-vendors/${organizerId}`);
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setVendors(sortLatestFirst(raw));
      } else if (tab === "venue") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/venues_details/${organizerId}`);
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setVenues(sortLatestFirst(raw));
      } else if (tab === "policy") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/all-policies/${organizerId}`);
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setPolicies(sortLatestFirst(raw));
      } else if (tab === "sponsor") {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-sponsor-names/${organizerId}`);
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSponsors(sortLatestFirst(raw));
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
    let raw = [];
    if (selectedTab === "vendor") raw = vendors;
    else if (selectedTab === "venue") raw = venues;
    else if (selectedTab === "policy") raw = policies;
    else if (selectedTab === "sponsor") raw = sponsors;

    const data = sortLatestFirst(raw);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return {
      currentData: data.slice(startIndex, endIndex),
      totalPages: Math.max(1, Math.ceil(data.length / rowsPerPage)),
      totalItems: data.length,
    };
  };

  const { currentData, totalPages, totalItems } = getCurrentData();

  const tabs = [
    { label: "Vendors", value: "vendor", icon: Store, count: vendors.length },
    { label: "Venues", value: "venue", icon: MapPin, count: venues.length },
    { label: "Policies", value: "policy", icon: ScrollText, count: policies.length },
    { label: "Sponsors", value: "sponsor", icon: Award, count: sponsors.length },
  ];

  const handleOpenAddModal = () => {
    if (selectedTab === "vendor") { setEditVendor(null); setIsAddVendorOpen(true); }
    else if (selectedTab === "venue") { setEditVenue(null); setIsAddVenueOpen(true); }
    else if (selectedTab === "policy") { setEditPolicy(null); setIsAddPolicyOpen(true); }
    else if (selectedTab === "sponsor") { setEditSponsor(null); setIsAddSponsorOpen(true); }
  };

  const handleEdit = (type, row) => {
    if (type === "vendor") { setEditVendor(row); setIsAddVendorOpen(true); }
    else if (type === "venue") { setEditVenue(row); setIsAddVenueOpen(true); }
    else if (type === "policy") { setEditPolicy(row); setIsAddPolicyOpen(true); }
    else if (type === "sponsor") { setEditSponsor(row); setIsAddSponsorOpen(true); }
  };

  const handleDeleteConfirm = (type, id, name) => {
    setDeleteTarget({ type, id, name });
  };

  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { type, id } = deleteTarget;
      const urlMap = {
        vendor: `${ENV.API_BASE_URL}/superadmin/api/delete-vendor/${id}`,
        venue: `${ENV.API_BASE_URL}/superadmin/api/delete-venue/${id}`,
        policy: `${ENV.API_BASE_URL}/superadmin/api/delete-policy/${id}`,
        sponsor: `${ENV.API_BASE_URL}/superadmin/api/delete-sponsor/${id}`,
      };
      await axios.delete(urlMap[type]);
      setDeleteTarget(null);
      fetchData(type);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. Please try again: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const getAddButtonLabel = () => {
    if (selectedTab === "vendor") return "Add Vendor";
    if (selectedTab === "venue") return "Add Venue";
    if (selectedTab === "policy") return "Add Policy";
    if (selectedTab === "sponsor") return "Add Sponsor";
    return "Add Item";
  };

  return (
    <div className="space-y-4 pb-8 select-none text-slate-800 font-sans max-w-full">
      {/* ── HEADER TOOLBAR (Matching Create Event & Organizer Layout) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-5 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Master Data
              </h1>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                <Database size={12} className="text-cyan-600" />
                <span>Configuration</span>
              </Badge>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Manage your global vendors, venues, policies, and sponsors across all events.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canCreate && (
              <Button
                onClick={handleOpenAddModal}
                className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-xs border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Plus size={14} />
                <span>{getAddButtonLabel()}</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(selectedTab)}
              className="h-9 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs cursor-pointer gap-1.5 rounded-xl transition-colors"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-cyan-600" : "text-slate-500"} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── CARD CONTAINER (Matching Create Event Cards) ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        {/* ── TABS BAR (Clean Pill Style matching Create Event) ── */}
        <div className="flex items-center overflow-x-auto touch-scroll bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 max-w-full gap-1">
          {tabs.map((t) => {
            const TabIcon = t.icon;
            const isActive = selectedTab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setSelectedTab(t.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer border-none ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <TabIcon size={14} className={isActive ? "text-white" : "text-slate-500"} />
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="min-h-[360px]">
          {loading ? (
            <div className="space-y-4 pt-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <Skeleton className="h-4 w-1/4 rounded-md bg-slate-200/60" />
                <Skeleton className="h-4 w-1/5 rounded-md bg-slate-200/60" />
                <Skeleton className="h-4 w-1/4 rounded-md bg-slate-200/60" />
                <Skeleton className="h-4 w-20 rounded-md bg-slate-200/60" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-1/4 rounded-sm bg-slate-100" />
                    <Skeleton className="h-3 w-1/5 rounded-sm bg-slate-100" />
                    <Skeleton className="h-3 w-1/4 rounded-sm bg-slate-100" />
                    <Skeleton className="h-5 w-16 rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ── VENDOR TABLE ── */}
              {selectedTab === "vendor" && (
                <div className="animate-in fade-in duration-200">
                  <ResponsiveTableView
                    data={currentData}
                    keyField="id"
                    loading={false}
                    emptyMessage="No vendors registered yet."
                    emptyAction={
                      canCreate ? (
                        <Button
                          size="sm"
                          onClick={() => setIsAddVendorOpen(true)}
                          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-8 px-4 rounded-xl shadow-xs border-none cursor-pointer mt-2"
                        >
                          <Plus size={13} className="mr-1" />
                          <span>Add First Vendor</span>
                        </Button>
                      ) : null
                    }
                    renderDesktopTable={() => (
                      <div className="responsive-table-wrap rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <table className="w-full min-w-[620px] text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">Vendor Name</th>
                              <th className="py-3 px-4">Company</th>
                              <th className="py-3 px-4">Contact</th>
                              <th className="py-3 px-4">Status</th>
                              {(canEdit || canDelete) && <th className="py-3 px-4 text-right">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {currentData.map((v, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-4 text-xs font-bold text-slate-900">{v.vendor_name || "-"}</td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600">{v.company_name || "-"}</td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                  <div>{v.primary_contact || "-"}</div>
                                  <div className="text-[10px] text-slate-400">{v.mail_id || ""}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant={v.status === "Inactive" ? "secondary" : "success"} className="text-[10px] font-bold px-2 py-0.5">
                                    {v.status || "Active"}
                                  </Badge>
                                </td>
                                {(canEdit || canDelete) && (
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {canEdit && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Edit"
                                          onClick={() => handleEdit("vendor", v)}
                                        >
                                          <Pencil size={14} />
                                        </button>
                                      )}
                                      {canDelete && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Delete"
                                          onClick={() => handleDeleteConfirm("vendor", v.id, v.vendor_name || v.name)}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    renderMobileCard={(v) => (
                      <MobileDataCard key={v.id}>
                        <MobileDataCard.Header
                          title={v.vendor_name || "Vendor"}
                          subtitle={v.company_name}
                          statusBadge={
                            <Badge variant={v.status === "Inactive" ? "secondary" : "success"} className="text-[10px] font-bold px-2 py-0.5">
                              {v.status || "Active"}
                            </Badge>
                          }
                        />
                        <MobileDataCard.Grid
                          items={[
                            { label: "Contact", value: v.primary_contact || "—" },
                            { label: "Email", value: v.mail_id || "—" }
                          ]}
                        />
                        {(canEdit || canDelete) && (
                          <MobileDataCard.Actions>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("vendor", v)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                              >
                                <Pencil size={13} />
                                <span>Edit</span>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteConfirm("vendor", v.id, v.vendor_name || v.name)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-rose-700 border-rose-200 hover:bg-rose-50"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </Button>
                            )}
                          </MobileDataCard.Actions>
                        )}
                      </MobileDataCard>
                    )}
                  />
                </div>
              )}

              {/* ── VENUE TABLE ── */}
              {selectedTab === "venue" && (
                <div className="animate-in fade-in duration-200">
                  <ResponsiveTableView
                    data={currentData}
                    keyField="id"
                    loading={false}
                    emptyMessage="No venues added yet."
                    emptyAction={
                      canCreate ? (
                        <Button
                          size="sm"
                          onClick={() => setIsAddVenueOpen(true)}
                          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-8 px-4 rounded-xl shadow-xs border-none cursor-pointer mt-2"
                        >
                          <Plus size={13} className="mr-1" />
                          <span>Add First Venue</span>
                        </Button>
                      ) : null
                    }
                    renderDesktopTable={() => (
                      <div className="responsive-table-wrap rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <table className="w-full min-w-[620px] text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">Venue Name</th>
                              <th className="py-3 px-4">Location</th>
                              <th className="py-3 px-4">Address</th>
                              <th className="py-3 px-4">Status</th>
                              {(canEdit || canDelete) && <th className="py-3 px-4 text-right">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {currentData.map((v, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-4 text-xs font-bold text-slate-900">{v.venue_name || v.name || "-"}</td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                  {v.city_name || v.city || "-"}, {v.state_name || v.state || ""}
                                </td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600 max-w-xs truncate" title={v.address}>
                                  {v.address || "-"}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant={v.status === "Inactive" ? "secondary" : "success"} className="text-[10px] font-bold px-2 py-0.5">
                                    {v.status || "Active"}
                                  </Badge>
                                </td>
                                {(canEdit || canDelete) && (
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {canEdit && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Edit"
                                          onClick={() => handleEdit("venue", v)}
                                        >
                                          <Pencil size={14} />
                                        </button>
                                      )}
                                      {canDelete && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Delete"
                                          onClick={() => handleDeleteConfirm("venue", v.id, v.venue_name || v.name)}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    renderMobileCard={(v) => (
                      <MobileDataCard key={v.id}>
                        <MobileDataCard.Header
                          title={v.venue_name || v.name || "Venue"}
                          subtitle={`${v.city_name || v.city || ""}, ${v.state_name || v.state || ""}`}
                          statusBadge={
                            <Badge variant={v.status === "Inactive" ? "secondary" : "success"} className="text-[10px] font-bold px-2 py-0.5">
                              {v.status || "Active"}
                            </Badge>
                          }
                        />
                        <MobileDataCard.Grid
                          items={[
                            { label: "Address", value: v.address || "—" }
                          ]}
                        />
                        {(canEdit || canDelete) && (
                          <MobileDataCard.Actions>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("venue", v)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                              >
                                <Pencil size={13} />
                                <span>Edit</span>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteConfirm("venue", v.id, v.venue_name || v.name)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-rose-700 border-rose-200 hover:bg-rose-50"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </Button>
                            )}
                          </MobileDataCard.Actions>
                        )}
                      </MobileDataCard>
                    )}
                  />
                </div>
              )}

              {/* ── POLICY TABLE ── */}
              {selectedTab === "policy" && (
                <div className="animate-in fade-in duration-200">
                  <ResponsiveTableView
                    data={currentData}
                    keyField="id"
                    loading={false}
                    emptyMessage="No policies created yet."
                    emptyAction={
                      canCreate ? (
                        <Button
                          size="sm"
                          onClick={() => setIsAddPolicyOpen(true)}
                          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-8 px-4 rounded-xl shadow-xs border-none cursor-pointer mt-2"
                        >
                          <Plus size={13} className="mr-1" />
                          <span>Add First Policy</span>
                        </Button>
                      ) : null
                    }
                    renderDesktopTable={() => (
                      <div className="responsive-table-wrap rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <table className="w-full min-w-[620px] text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">Policy Name</th>
                              <th className="py-3 px-4">Group</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4">Description</th>
                              {(canEdit || canDelete) && <th className="py-3 px-4 text-right">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {currentData.map((p, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-4 text-xs font-bold text-slate-900">{p.policy_name || "-"}</td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                  <Badge className="bg-sky-50 text-sky-800 border-sky-200 font-bold text-[10px]">
                                    {p.policy_group || "General"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600">{p.policy_type || "-"}</td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-500 max-w-md truncate" title={p.description}>
                                  {p.description || "-"}
                                </td>
                                {(canEdit || canDelete) && (
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {canEdit && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Edit"
                                          onClick={() => handleEdit("policy", p)}
                                        >
                                          <Pencil size={14} />
                                        </button>
                                      )}
                                      {canDelete && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Delete"
                                          onClick={() => handleDeleteConfirm("policy", p.id, p.policy_name)}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    renderMobileCard={(p) => (
                      <MobileDataCard key={p.id}>
                        <MobileDataCard.Header
                          title={p.policy_name || "Policy"}
                          subtitle={p.policy_type}
                          statusBadge={
                            <Badge className="bg-sky-50 text-sky-800 border-sky-200 font-bold text-[10px]">
                              {p.policy_group || "General"}
                            </Badge>
                          }
                        />
                        <MobileDataCard.Grid
                          items={[
                            { label: "Description", value: p.description || "—" }
                          ]}
                        />
                        {(canEdit || canDelete) && (
                          <MobileDataCard.Actions>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("policy", p)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                              >
                                <Pencil size={13} />
                                <span>Edit</span>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteConfirm("policy", p.id, p.policy_name)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-rose-700 border-rose-200 hover:bg-rose-50"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </Button>
                            )}
                          </MobileDataCard.Actions>
                        )}
                      </MobileDataCard>
                    )}
                  />
                </div>
              )}

              {/* ── SPONSOR TABLE ── */}
              {selectedTab === "sponsor" && (
                <div className="animate-in fade-in duration-200">
                  <ResponsiveTableView
                    data={currentData}
                    keyField="id"
                    loading={false}
                    emptyMessage="No sponsors added yet."
                    emptyAction={
                      canCreate ? (
                        <Button
                          size="sm"
                          onClick={() => setIsAddSponsorOpen(true)}
                          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-8 px-4 rounded-xl shadow-xs border-none cursor-pointer mt-2"
                        >
                          <Plus size={13} className="mr-1" />
                          <span>Add First Sponsor</span>
                        </Button>
                      ) : null
                    }
                    renderDesktopTable={() => (
                      <div className="responsive-table-wrap rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <table className="w-full min-w-[620px] text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">Sponsor Name</th>
                              <th className="py-3 px-4">Contact</th>
                              <th className="py-3 px-4">Address</th>
                              <th className="py-3 px-4">Status</th>
                              {(canEdit || canDelete) && <th className="py-3 px-4 text-right">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {currentData.map((s, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-4 text-xs font-bold text-slate-900">{s.sponsor_name || "-"}</td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                  <div>{s.primary_contact || "-"}</div>
                                  <div className="text-[10px] text-slate-400">{s.mail_id || ""}</div>
                                </td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600 max-w-xs truncate" title={s.address}>
                                  {s.address || "-"}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant={s.status === "Inactive" ? "secondary" : "success"} className="text-[10px] font-bold px-2 py-0.5">
                                    {s.status || "Active"}
                                  </Badge>
                                </td>
                                {(canEdit || canDelete) && (
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {canEdit && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Edit"
                                          onClick={() => handleEdit("sponsor", s)}
                                        >
                                          <Pencil size={14} />
                                        </button>
                                      )}
                                      {canDelete && (
                                        <button
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                          title="Delete"
                                          onClick={() => handleDeleteConfirm("sponsor", s.id, s.sponsor_name)}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    renderMobileCard={(s) => (
                      <MobileDataCard key={s.id}>
                        <MobileDataCard.Header
                          title={s.sponsor_name || "Sponsor"}
                          subtitle={s.primary_contact ? `Contact: ${s.primary_contact}` : undefined}
                          statusBadge={
                            <Badge variant={s.status === "Inactive" ? "secondary" : "success"} className="text-[10px] font-bold px-2 py-0.5">
                              {s.status || "Active"}
                            </Badge>
                          }
                        />
                        <MobileDataCard.Grid
                          items={[
                            { label: "Email", value: s.mail_id || "—" },
                            { label: "Address", value: s.address || "—" }
                          ]}
                        />
                        {(canEdit || canDelete) && (
                          <MobileDataCard.Actions>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("sponsor", s)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                              >
                                <Pencil size={13} />
                                <span>Edit</span>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteConfirm("sponsor", s.id, s.sponsor_name)}
                                className="text-xs font-bold gap-1 rounded-xl h-8 text-rose-700 border-rose-200 hover:bg-rose-50"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </Button>
                            )}
                          </MobileDataCard.Actions>
                        )}
                      </MobileDataCard>
                    )}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* ── PAGINATION BAR (Shadcn style with Button & clean layout) ── */}
        {!loading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Rows per page</span>
              <select
                id="select-rows-per-page"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none focus:border-cyan-500 shadow-2xs cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs font-semibold text-slate-400 ml-2">
                Showing {Math.min((page - 1) * rowsPerPage + 1, totalItems)}–{Math.min(page * rowsPerPage, totalItems)} of {totalItems}
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs font-bold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── MODALS (Using identical Shadcn design and tokens) ── */}
      <AddVendorModal
        isOpen={isAddVendorOpen}
        onClose={() => { setIsAddVendorOpen(false); setEditVendor(null); }}
        onSuccess={() => fetchData("vendor")}
        editData={editVendor}
      />

      <AddVenueModal
        isOpen={isAddVenueOpen}
        onClose={() => { setIsAddVenueOpen(false); setEditVenue(null); }}
        onSuccess={() => fetchData("venue")}
        editData={editVenue}
      />

      <AddPolicyModal
        isOpen={isAddPolicyOpen}
        onClose={() => { setIsAddPolicyOpen(false); setEditPolicy(null); }}
        onSuccess={() => fetchData("policy")}
        editData={editPolicy}
      />

      <AddSponsorModal
        isOpen={isAddSponsorOpen}
        onClose={() => { setIsAddSponsorOpen(false); setEditSponsor(null); }}
        onSuccess={() => fetchData("sponsor")}
        editData={editSponsor}
      />

      {/* ── DELETE CONFIRM DIALOG ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-sm w-full mx-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Confirm Delete</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-slate-800">&ldquo;{deleteTarget.name}&rdquo;</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="h-8 px-4 font-bold text-xs rounded-xl border-slate-200 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteExecute}
                disabled={isDeleting}
                className="h-8 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl border-none cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
