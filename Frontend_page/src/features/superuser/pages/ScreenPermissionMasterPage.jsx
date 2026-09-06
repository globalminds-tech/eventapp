import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import {
  Shield, Plus, Search, Filter, Trash2, Edit3, CheckCircle,
  AlertCircle, X, Check, Layers, Sparkles, RefreshCw, Key
} from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ScreenPermissionMasterPage() {
  const { accessToken } = useSelector((state) => state.auth);

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModuleFilter, setSelectedModuleFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState(null);
  const [formModule, setFormModule] = useState("");
  const [formAction, setFormAction] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/permissions`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPermissions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load permissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Distinct modules for filtering
  const distinctModules = useMemo(() => {
    const set = new Set(permissions.map((p) => p.module));
    return Array.from(set).sort();
  }, [permissions]);

  // Filtered permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchModule = selectedModuleFilter === "all" || p.module === selectedModuleFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        p.name?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.module?.toLowerCase().includes(term) ||
        p.action?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term);
      return matchModule && matchSearch;
    });
  }, [permissions, selectedModuleFilter, searchTerm]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingPerm(null);
    setFormModule("");
    setFormAction("view");
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (perm) => {
    setEditingPerm(perm);
    setFormModule(perm.module);
    setFormAction(perm.action);
    setFormCode(perm.code);
    setFormName(perm.name);
    setFormDescription(perm.description || "");
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  // Auto-fill code when module or action changes
  const handleModuleChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    setFormModule(clean);
    if (!editingPerm) {
      const act = formAction || "view";
      setFormCode(`${clean}.${act}`);
    }
  };

  const handleActionChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    setFormAction(clean);
    if (!editingPerm && formModule) {
      setFormCode(`${formModule}.${clean}`);
    }
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      if (editingPerm) {
        // Update
        const res = await axios.put(
          `${ENV.API_BASE_URL}/api/v1/rbac/permissions/${editingPerm.id}`,
          { name: formName, description: formDescription },
          { headers }
        );
        if (res.data?.success) {
          setFormSuccess("Permission updated successfully!");
          fetchPermissions();
          setTimeout(() => setIsModalOpen(false), 1200);
        }
      } else {
        // Create
        const res = await axios.post(
          `${ENV.API_BASE_URL}/api/v1/rbac/permissions`,
          {
            module: formModule,
            action: formAction,
            code: formCode || `${formModule}.${formAction}`,
            name: formName,
            description: formDescription,
          },
          { headers }
        );
        if (res.data?.success) {
          setFormSuccess("New screen & action permission registered!");
          fetchPermissions();
          setTimeout(() => setIsModalOpen(false), 1200);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to save permission.");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (perm) => {
    if (!window.confirm(`Are you sure you want to delete permission "${perm.code}"?`)) return;
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      await axios.delete(`${ENV.API_BASE_URL}/api/v1/rbac/permissions/${perm.id}`, { headers });
      fetchPermissions();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete permission.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 mb-1.5 border border-purple-100">
            <Shield className="h-3.5 w-3.5" />
            Universal Platform Governance
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Screens & Actions Master
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Define platform screens, modules, and granular action permissions dynamically across all tenant roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPermissions}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-xs hover:bg-slate-50 transition"
            title="Refresh Permissions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-900/25 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Screen / Action
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Functional Modules</div>
          <div className="mt-1 text-2xl font-black text-purple-700">{distinctModules.length}</div>
          <div className="mt-0.5 text-[10px] text-slate-400">Events, Stalls, Checkin, Finance, etc.</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Actions</div>
          <div className="mt-1 text-2xl font-black text-indigo-700">{permissions.length}</div>
          <div className="mt-0.5 text-[10px] text-slate-400">Granular permission codes</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Taxonomy</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">Dynamic</div>
          <div className="mt-0.5 text-[10px] text-slate-400">Instantly synced with roles</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Engine</div>
          <div className="mt-1 text-2xl font-black text-slate-900">RBAC 2.0</div>
          <div className="mt-0.5 text-[10px] text-slate-400">Multi-tenant token verified</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search screens, actions, codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2 text-xs focus:border-purple-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-purple-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Modules ({permissions.length})</option>
            {distinctModules.map((mod) => (
              <option key={mod} value={mod}>
                {mod.toUpperCase()} Module
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Screen / Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Permission Code</TableHead>
              <TableHead>Display Label</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="pr-6 text-right">Controls</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-6">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48 rounded" />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Skeleton className="h-6 w-16 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                  No screen permissions found matching the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-100/80 px-2.5 py-1 text-[11px] font-bold text-purple-800 capitalize">
                      <Layers className="h-3 w-3 text-purple-600" />
                      {p.module}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      {p.action}
                    </span>
                  </TableCell>

                  <TableCell>
                    <code className="rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[11px] font-mono text-slate-800 font-semibold">
                      {p.code}
                    </code>
                  </TableCell>

                  <TableCell className="font-bold text-slate-900">{p.name}</TableCell>

                  <TableCell className="text-slate-500 max-w-xs truncate" title={p.description || ""}>
                    {p.description || "—"}
                  </TableCell>

                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="Edit permission details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete permission"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Permission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-visible">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingPerm ? "Edit Screen Permission" : "Add Screen / Action Permission"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {editingPerm ? "Update display name and description" : "Register a new functional screen action"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2 border border-emerald-100">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Screen / Module *</label>
                  <input
                    type="text"
                    value={formModule}
                    onChange={(e) => handleModuleChange(e.target.value)}
                    disabled={Boolean(editingPerm)}
                    placeholder="e.g. sponsors, polls"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-purple-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <div className="mt-1 text-[10px] text-slate-400">Lowercase screen name</div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Action Verb *</label>
                  <input
                    type="text"
                    value={formAction}
                    onChange={(e) => handleActionChange(e.target.value)}
                    disabled={Boolean(editingPerm)}
                    placeholder="e.g. view, create, export"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-purple-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <div className="mt-1 text-[10px] text-slate-400">Verb: view, create, edit...</div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Unique Permission Code</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  disabled={Boolean(editingPerm)}
                  placeholder="e.g. sponsors.view"
                  required
                  className="w-full rounded-xl border border-slate-200 font-mono text-xs px-3.5 py-2 text-slate-800 focus:border-purple-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
                <div className="mt-1 text-[10px] text-slate-400">Used programmatically via &lt;Can I="..."&gt;</div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Display Label *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. View Sponsors Directory"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What can a user with this permission perform?"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 hover:brightness-110"
                >
                  {formLoading ? "Saving..." : editingPerm ? "Update Permission" : "Register Permission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
