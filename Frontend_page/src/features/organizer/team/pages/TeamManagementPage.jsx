import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import {
  Users, Shield, Plus, Mail, Trash2, CheckCircle, Clock, AlertCircle,
  X, Check, Lock, ChevronRight, UserPlus, Info
} from "lucide-react";
import { Select, SelectItem } from "@/components/ui/Select";

export default function TeamManagementPage() {
  const { accessToken } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("members"); // 'members' | 'roles'
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  // Create Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [membersRes, rolesRes, permsRes] = await Promise.all([
        axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/team/members`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/roles`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/permissions`).catch(() => ({ data: { data: [] } })),
      ]);

      setMembers(membersRes.data?.data || []);
      setRoles(rolesRes.data?.data || []);
      setPermissions(permsRes.data?.data || []);
      if (rolesRes.data?.data?.length > 0 && !inviteRoleId) {
        setInviteRoleId(rolesRes.data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load RBAC data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  // Handle Send Invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/rbac/team/invite`,
        { email: inviteEmail, name: inviteName, role_id: inviteRoleId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data?.success) {
        setInviteSuccess(`Invitation sent successfully to ${inviteEmail}!`);
        setInviteEmail("");
        setInviteName("");
        fetchData();
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteSuccess("");
        }, 2000);
      }
    } catch (err) {
      setInviteError(err.response?.data?.detail || "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle Create Custom Role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setRoleError("Role name is required.");
      return;
    }
    setRoleLoading(true);
    setRoleError("");
    try {
      const res = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/rbac/roles`,
        { name: roleName, description: roleDescription, permissions: selectedPerms },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data?.success) {
        setIsRoleModalOpen(false);
        setRoleName("");
        setRoleDescription("");
        setSelectedPerms([]);
        fetchData();
      }
    } catch (err) {
      setRoleError(err.response?.data?.detail || "Failed to create role.");
    } finally {
      setRoleLoading(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName || "this member"} from the organization?`)) return;
    try {
      await axios.delete(`${ENV.API_BASE_URL}/api/v1/rbac/team/members/${memberId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to remove member.");
    }
  };

  // Handle Delete Custom Role
  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the custom role "${roleName}"?`)) return;
    try {
      await axios.delete(`${ENV.API_BASE_URL}/api/v1/rbac/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {},
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete role.");
    }
  };

  // Group permissions by module
  const permsByModule = permissions.reduce((acc, p) => {
    acc[p.module] = acc[p.module] || [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const togglePerm = (code) => {
    setSelectedPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Team & Access Control</h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage organization team members, assign predefined responsibilities, and create custom roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "members" ? (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 transition hover:brightness-110"
            >
              <UserPlus className="h-4 w-4" />
              Invite Team Member
            </button>
          ) : (
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Create Custom Role
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "members"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          Team Members ({members.length})
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "roles"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Shield className="h-4 w-4" />
          Roles & Permissions ({roles.length})
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : activeTab === "members" ? (
        /* Team Members Table */
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Member Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No team members found. Click "Invite Team Member" to add your first collaborator.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="transition hover:bg-slate-50/50">
                    <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs">
                        {(m.user_name || m.title || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{m.user_name || m.title || "Team Member"}</div>
                        {m.department && <div className="text-[10px] text-slate-400">{m.department}</div>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{m.user_email || "Pending Acceptance"}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                        {m.role_name || "Custom Role"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          m.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {m.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "Pending"}
                    </td>
                    <td className="py-3.5 pr-6 text-right">
                      <button
                        onClick={() => handleRemoveMember(m.id, m.user_name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Roles & Permissions Grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      r.is_system_role ? "bg-slate-100 text-slate-700" : "bg-cyan-50 text-cyan-700"
                    }`}
                  >
                    {r.is_system_role ? "System Role" : "Custom Role"}
                  </span>
                  {!r.is_system_role && (
                    <button
                      onClick={() => handleDeleteRole(r.id, r.name)}
                      className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete custom role"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{r.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{r.description || "No description provided."}</p>

                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Granted Permissions ({r.permissions?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {r.permissions?.map((p) => (
                      <span
                        key={p}
                        className="rounded-md bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Code: <code>{r.code}</code></span>
                {r.is_default && <span className="font-semibold text-cyan-600">Default Owner</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Invite Team Member</h2>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 space-y-4">
              {inviteSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {inviteSuccess}
                </div>
              )}
              {inviteError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {inviteError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <Select
                  label="Assign Role *"
                  value={inviteRoleId}
                  onValueChange={(val) => setInviteRoleId(val)}
                  placeholder="Select Role"
                  triggerClassName="rounded-xl border border-slate-200 px-3.5 py-2 text-xs h-9 focus:border-cyan-500"
                >
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name} ({r.is_system_role ? "System" : "Custom"})
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-8 overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Create Custom Role</h2>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              {roleError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {roleError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Role Name *</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. VIP Receptionist"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Short Description</label>
                  <input
                    type="text"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Handles guest reception and badge printing"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Permissions Matrix */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Screen & Action Permissions ({selectedPerms.length} selected)
                </label>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 p-3 space-y-4">
                  {Object.entries(permsByModule).map(([mod, perms]) => (
                    <div key={mod} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="text-xs font-bold text-slate-800 capitalize mb-2 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-cyan-500" />
                        {mod} Module
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {perms.map((p) => {
                          const isChecked = selectedPerms.includes(p.code);
                          return (
                            <label
                              key={p.id}
                              onClick={() => togglePerm(p.code)}
                              className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition text-[11px] ${
                                isChecked
                                  ? "border-cyan-500 bg-cyan-50/50 text-cyan-900 font-bold"
                                  : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <span className="truncate" title={p.description || p.name}>
                                {p.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleLoading}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {roleLoading ? "Creating..." : "Save Custom Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
