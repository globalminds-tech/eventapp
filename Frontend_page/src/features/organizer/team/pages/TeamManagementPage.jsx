import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { ENV } from "@/config/env";
import {
  Users, Shield, Plus, Mail, Trash2, CheckCircle, Clock, AlertCircle,
  X, Check, Lock, UserPlus, Layers, Key, ArrowLeft, Edit3, Sparkles,
  AlertTriangle, XCircle, UserCheck, UserX, Eye, CheckCircle2, Calendar,
  Store, QrCode, Landmark, Building2, Loader2
} from "lucide-react";
import { Select, SelectItem } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "@/components/ui/Table";
import Can from "@/components/Can";
import { usePermissions } from "@/shared/context/PermissionContext";

export default function TeamManagementPage({ userScope }) {
  const { accessToken, role: authRole } = useSelector((state) => state.auth);
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const isExhibitor =
    userScope === "exhibitor" ||
    location.pathname.startsWith("/exhibitor") ||
    String(authRole).toLowerCase() === "exhibitor";

  const workspaceScope = isExhibitor ? "EXHIBITOR" : "ORGANIZER";

  const canViewTeam = hasPermission(isExhibitor ? "exhibitor.team.view" : "team.view");
  const canViewRoles = hasPermission(isExhibitor ? "exhibitor.roles.manage" : ["roles.view", "roles.manage", "roles.create", "roles.edit"]);
  const canCreateRole = hasPermission(isExhibitor ? "exhibitor.roles.manage" : ["roles.create", "roles.manage"]);
  const canEditRole = hasPermission(isExhibitor ? "exhibitor.roles.manage" : ["roles.edit", "roles.manage"]);
  const canDeleteRole = hasPermission(isExhibitor ? "exhibitor.roles.manage" : ["roles.delete", "roles.manage"]);

  const [activeTab, setActiveTab] = useState(() => {
    return (!canViewTeam && canViewRoles) ? "roles" : "members";
  });

  useEffect(() => {
    if (!canViewTeam && canViewRoles && activeTab === "members") {
      setActiveTab("roles");
    }
  }, [canViewTeam, canViewRoles, activeTab]);

  const [viewMode, setViewMode] = useState("list"); // 'list' | 'role-editor' | 'role-view'
  const [viewingRole, setViewingRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  // Role Editor State (Full Page View)
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");

  // Role Deletion Guard State & Member Status Toggling State
  const [roleDeleteWarning, setRoleDeleteWarning] = useState({
    isOpen: false,
    role: null,
    assignedMembers: [],
    customMessage: "",
  });
  const [roleDeleteConfirm, setRoleDeleteConfirm] = useState({
    isOpen: false,
    role: null,
  });
  const [roleDeleteLoading, setRoleDeleteLoading] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);

  // Member Deletion Confirmation State (Replaces native window.confirm & alert)
  const [memberDeleteModal, setMemberDeleteModal] = useState({
    isOpen: false,
    member: null,
    isHardDelete: true, // Default to hard delete for now
    error: null,
    loading: false,
  });

  // Theme configuration based on role
  const theme = isExhibitor
    ? {
        roleBadge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        primaryBtn:
          "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/25 hover:brightness-110",
        avatarBg: "bg-emerald-100 text-emerald-800",
        rolePill: "bg-emerald-50 text-emerald-700",
        checkboxActive: "border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold",
        checkboxTick: "text-emerald-600 focus:ring-emerald-500",
        focusBorder: "focus:border-emerald-500",
        dotColor: "bg-emerald-500",
        activeTabRing: "ring-1 ring-emerald-500/20 border-slate-200/60 text-emerald-800",
        activeTabBadge: "bg-emerald-100 text-emerald-800",
      }
    : {
        roleBadge: "bg-cyan-50 text-cyan-700 border-cyan-100",
        primaryBtn:
          "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 hover:brightness-110",
        avatarBg: "bg-cyan-100 text-cyan-800",
        rolePill: "bg-blue-50 text-blue-700",
        checkboxActive: "border-cyan-500 bg-cyan-50/60 text-cyan-900 font-bold",
        checkboxTick: "text-cyan-600 focus:ring-cyan-500",
        focusBorder: "focus:border-cyan-500",
        dotColor: "bg-cyan-500",
        activeTabRing: "ring-1 ring-cyan-500/20 border-slate-200/60 text-cyan-800",
        activeTabBadge: "bg-cyan-100 text-cyan-800",
      };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 
        Authorization: `Bearer ${accessToken}`,
        "X-Workspace-Scope": workspaceScope
      };
      const [membersRes, rolesRes, permsRes] = await Promise.all([
        canViewTeam
          ? axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/team/members`, { headers }).catch(() => ({ data: { data: [] } }))
          : Promise.resolve({ data: { data: [] } }),
        canViewRoles
          ? axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/roles`, { headers }).catch(() => ({ data: { data: [] } }))
          : Promise.resolve({ data: { data: [] } }),
        axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/permissions?scope=${workspaceScope}`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);

      const fetchedMembers = membersRes.data?.data || [];
      const rawRoles = rolesRes.data?.data || [];
      // Filter out super_admin, superadmin, org_owner, organizer_owner
      const fetchedRoles = rawRoles.filter(
        (r) =>
          r.code !== "super_admin" &&
          r.code !== "superadmin" &&
          r.code !== "org_owner" &&
          r.code !== "organizer_owner" &&
          !r.name?.toLowerCase().includes("super administrator") &&
          !r.name?.toLowerCase().includes("organization owner") &&
          !r.name?.toLowerCase().includes("organizer owner")
      );
      const fetchedPerms = permsRes.data?.data || [];

      setMembers(fetchedMembers);
      setRoles(fetchedRoles);
      setPermissions(fetchedPerms);

      if (fetchedRoles.length > 0 && !inviteRoleId) {
        setInviteRoleId(String(fetchedRoles[0].id));
      }
    } catch (err) {
      console.error("Failed to load RBAC data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken, isExhibitor]);

  // Lookup map: permission code -> user-friendly display name
  const permCodeToName = useMemo(() => {
    const map = {};
    permissions.forEach((p) => {
      map[p.code] = p.name;
    });
    return map;
  }, [permissions]);

  // Group permissions by module
  const permsByModule = useMemo(() => {
    return permissions.reduce((acc, p) => {
      acc[p.module] = acc[p.module] || [];
      acc[p.module].push(p);
      return acc;
    }, {});
  }, [permissions]);

  // Handle Send Invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteRoleId) {
      setInviteError("Please select a role to assign.");
      return;
    }
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/rbac/team/invite`,
        { email: inviteEmail, name: inviteName, role_id: inviteRoleId },
        { headers: { Authorization: `Bearer ${accessToken}`, "X-Workspace-Scope": workspaceScope } }
      );
      if (res.data?.success) {
        setInviteSuccess(`Invitation sent successfully to ${inviteEmail}!`);
        setInviteEmail("");
        setInviteName("");
        fetchData();
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteSuccess("");
        }, 1500);
      }
    } catch (err) {
      setInviteError(err.response?.data?.detail || "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Open Create Role Page
  const handleOpenCreateRole = () => {
    if (!canCreateRole) return;
    setEditingRoleId(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPerms([]);
    setRoleError("");
    setViewMode("role-editor");
  };

  // Open Edit Role Page
  const handleOpenEditRole = (role) => {
    if (!canEditRole) return;
    setEditingRoleId(role.id);
    setRoleName(role.name || "");
    setRoleDescription(role.description || "");
    setSelectedPerms(role.permissions || []);
    setRoleError("");
    setViewMode("role-editor");
  };

  // Handle Save / Update Custom Role
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setRoleError("Role name is required.");
      return;
    }
    setRoleLoading(true);
    setRoleError("");
    try {
      const headers = { 
        Authorization: `Bearer ${accessToken}`,
        "X-Workspace-Scope": workspaceScope
      };
      if (editingRoleId) {
        // Update existing role
        await axios.put(
          `${ENV.API_BASE_URL}/api/v1/rbac/roles/${editingRoleId}`,
          { name: roleName, description: roleDescription, permissions: selectedPerms },
          { headers }
        );
      } else {
        // Create new role
        await axios.post(
          `${ENV.API_BASE_URL}/api/v1/rbac/roles`,
          { name: roleName, description: roleDescription, permissions: selectedPerms },
          { headers }
        );
      }
      fetchData();
      setViewMode("list");
      setActiveTab("roles");
    } catch (err) {
      setRoleError(err.response?.data?.detail || "Failed to save role.");
    } finally {
      setRoleLoading(false);
    }
  };

  // Open Member Delete Confirmation Dialog (No window.confirm/alert)
  const handleInitiateRemoveMember = (member) => {
    setMemberDeleteModal({
      isOpen: true,
      member,
      isHardDelete: true, // Default to hard delete
      error: null,
      loading: false,
    });
  };

  // Execute Confirmed Delete of Team Member
  const handleExecuteRemoveMember = async () => {
    if (!memberDeleteModal.member) return;
    setMemberDeleteModal((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const memberId = memberDeleteModal.member.id;
      const isHard = memberDeleteModal.isHardDelete;
      await axios.delete(
        `${ENV.API_BASE_URL}/api/v1/rbac/team/members/${memberId}?hard_delete=${isHard}`,
        {
          headers: { Authorization: `Bearer ${accessToken}`, "X-Workspace-Scope": workspaceScope },
        }
      );
      setMemberDeleteModal({ isOpen: false, member: null, isHardDelete: true, error: null, loading: false });
      fetchData();
    } catch (err) {
      setMemberDeleteModal((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.detail || "Failed to remove member.",
      }));
    }
  };

  // Toggle Member Active / Deactivated Status
  const handleToggleMemberStatus = async (member) => {
    const newStatus = member.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    setStatusTogglingId(member.id);
    try {
      await axios.put(
        `${ENV.API_BASE_URL}/api/v1/rbac/team/members/${member.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}`, "X-Workspace-Scope": workspaceScope } }
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update member status.");
    } finally {
      setStatusTogglingId(null);
    }
  };

  // Open View Role Permissions Page
  const handleOpenViewRole = (role) => {
    setViewingRole(role);
    setViewMode("role-view");
  };

  // Initiate Delete Custom Role (Guarded check against root owner, system roles, and active assignments)
  const handleInitiateDeleteRole = (role) => {
    // 1. Root Organization Owner guard
    if (role.is_default || role.code === "org_owner") {
      setRoleDeleteWarning({
        isOpen: true,
        role,
        assignedMembers: [],
        customMessage: "The Organization Owner role is the fundamental root account of your organization and cannot be deleted.",
      });
      return;
    }

    // 2. Built-in platform system role guard
    if (role.is_system_role) {
      setRoleDeleteWarning({
        isOpen: true,
        role,
        assignedMembers: [],
        customMessage: "This is a built-in platform template role. Built-in template roles cannot be deleted to ensure default system integrity.",
      });
      return;
    }

    // 3. Check for active assigned team members
    const assigned = members.filter(
      (m) =>
        String(m.role_id) === String(role.id) ||
        (m.role_name && role.name && m.role_name.toLowerCase() === role.name.toLowerCase())
    );

    if (assigned.length > 0) {
      setRoleDeleteWarning({
        isOpen: true,
        role,
        assignedMembers: assigned,
        customMessage: "This role is currently assigned to team member(s). You cannot delete a role while it is actively in use.",
      });
    } else {
      setRoleDeleteConfirm({
        isOpen: true,
        role,
      });
    }
  };

  // Execute Confirmed Delete of Unassigned Custom Role
  const handleExecuteDeleteRole = async () => {
    const role = roleDeleteConfirm.role;
    if (!role) return;
    setRoleDeleteLoading(true);
    try {
      await axios.delete(`${ENV.API_BASE_URL}/api/v1/rbac/roles/${role.id}`, {
        headers: { Authorization: `Bearer ${accessToken}`, "X-Workspace-Scope": workspaceScope },
        data: {},
      });
      setRoleDeleteConfirm({ isOpen: false, role: null });
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.data?.assigned_members) {
        setRoleDeleteConfirm({ isOpen: false, role: null });
        setRoleDeleteWarning({
          isOpen: true,
          role,
          assignedMembers: err.response.data.assigned_members.map((name) => ({ user_name: name })),
        });
      } else {
        alert(detail || "Failed to delete role.");
      }
    } finally {
      setRoleDeleteLoading(false);
    }
  };

  const togglePerm = (code) => {
    setSelectedPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Toggle all permissions for a module
  const toggleAllModulePerms = (modPerms) => {
    const modCodes = modPerms.map((p) => p.code);
    const allSelected = modCodes.every((c) => selectedPerms.includes(c));
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((c) => !modCodes.includes(c)));
    } else {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...modCodes])));
    }
  };

  // Helper for module icon & styling in permissions view
  const getModuleMeta = (mod) => {
    switch (mod) {
      // Organizer Modules
      case "events":
        return { label: "Events Management", icon: Calendar, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "stalls":
        return { label: "Stalls & Exhibitor Booths", icon: Store, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      case "checkin":
        return { label: "Gate & Food Check-In", icon: QrCode, color: "text-purple-600 bg-purple-50 border-purple-200" };
      case "finance":
        return { label: "Finance, Billing & Payouts", icon: Landmark, color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "team":
      case "roles":
        return { label: "Organization & Team Governance", icon: Shield, color: "text-cyan-600 bg-cyan-50 border-cyan-200" };
      case "venues":
        return { label: "Venue & Hall Management", icon: Building2, color: "text-indigo-600 bg-indigo-50 border-indigo-200" };

      // Exhibitor Modules
      case "exhibitor_events":
        return { label: "Upcoming Expos & Floorplans", icon: Calendar, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "exhibitor_stalls":
        return { label: "Stall Bookings & Amenities", icon: Store, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      case "exhibitor_leads":
        return { label: "Visitor Leads & Badge Scanning", icon: QrCode, color: "text-purple-600 bg-purple-50 border-purple-200" };
      case "exhibitor_booth":
        return { label: "Booth Staff & Badges", icon: Users, color: "text-cyan-600 bg-cyan-50 border-cyan-200" };
      case "exhibitor_billing":
        return { label: "Invoices & Receipts", icon: Landmark, color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "exhibitor_team":
        return { label: "Exhibitor Team & Roles", icon: Shield, color: "text-teal-600 bg-teal-50 border-teal-200" };

      default:
        return { label: `${mod ? mod.charAt(0).toUpperCase() + mod.slice(1) : "General"} Module`, icon: Layers, color: "text-slate-600 bg-slate-50 border-slate-200" };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: DEDICATED FULL PAGE ROLE ACCESS & PERMISSIONS VIEWER (READ-ONLY)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === "role-view" && viewingRole) {
    const rolePermList = viewingRole.permissions || [];
    const assignedRoleMembers = members.filter(
      (m) =>
        String(m.role_id) === String(viewingRole.id) ||
        (m.role_name && viewingRole.name && m.role_name.toLowerCase() === viewingRole.name.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
        {/* Top Breadcrumb & Return Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setViewingRole(null);
              setViewMode("list");
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team & Roles
          </button>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Role Governance / Access Overview
          </div>
        </div>

        {/* Role Header Banner Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isExhibitor ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-cyan-500 to-blue-600"} text-white shrink-0 shadow-md shadow-cyan-500/20`}>
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {viewingRole.name}
                </h1>
                {viewingRole.is_default ? (
                  <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-extrabold text-cyan-700 border border-cyan-200/60">
                    Default Owner
                  </span>
                ) : viewingRole.is_system_role ? (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                    System Template
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    Custom Role
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-500 max-w-2xl leading-relaxed">
                {viewingRole.description || "No description specified for this role."}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {canEditRole && (
              <button
                onClick={() => handleOpenEditRole(viewingRole)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Role
              </button>
            )}
            {!viewingRole.is_default && canDeleteRole && (
              <button
                onClick={() => handleInitiateDeleteRole(viewingRole)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100/60 transition"
                title="Delete this role"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Executive KPI Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Granted Permissions</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {rolePermList.length} <span className="text-xs font-semibold text-slate-400">/ {permissions.length}</span>
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Team Members</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {assignedRoleMembers.length} <span className="text-xs font-semibold text-slate-400">active</span>
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Access Scope</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {viewingRole.is_default ? "Full Organization Authority" : viewingRole.is_system_role ? "Standard Functional Scope" : "Custom Configured Scope"}
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Permissions Matrix by Functional Module */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-400" />
              Screen & Action Permission Breakdown
            </h2>
            <div className="text-xs text-slate-500">
              Showing active capabilities across all modules
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(permsByModule).map(([mod, perms]) => {
              const meta = getModuleMeta(mod);
              const ModIcon = meta.icon;
              const grantedInMod = perms.filter((p) => rolePermList.includes(p.code));

              return (
                <div
                  key={mod}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Module Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${meta.color}`}>
                          <ModIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{meta.label}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{perms.length} capabilities</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          grantedInMod.length > 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {grantedInMod.length} of {perms.length} Granted
                      </span>
                    </div>

                    {/* Permissions list in this module */}
                    <div className="space-y-2">
                      {perms.map((p) => {
                        const isGranted = rolePermList.includes(p.code);
                        return (
                          <div
                            key={p.code}
                            className={`flex items-start justify-between gap-3 p-2.5 rounded-xl border transition-all text-xs ${
                              isGranted
                                ? "bg-emerald-50/40 border-emerald-200/70 text-slate-800"
                                : "bg-slate-50/40 border-slate-200/50 text-slate-400 opacity-60"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {isGranted ? (
                                <div className="mt-0.5 rounded-full bg-emerald-100 text-emerald-700 p-0.5 shrink-0">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="mt-0.5 rounded-full bg-slate-200 text-slate-400 p-0.5 shrink-0">
                                  <X className="h-3 w-3 stroke-[2]" />
                                </div>
                              )}
                              <div>
                                <div className={`font-semibold ${isGranted ? "text-slate-900" : "text-slate-500"}`}>
                                  {p.name}
                                </div>
                                {p.description && (
                                  <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                                    {p.description}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                                isGranted
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-50 text-slate-400 border-slate-200"
                              }`}
                            >
                              {isGranted ? "Authorized" : "No Access"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Team Members Card if any */}
        {assignedRoleMembers.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Team Members Assigned to this Role ({assignedRoleMembers.length})
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {assignedRoleMembers.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/50"
                >
                  <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shadow-2xs">
                    {(m.user_name || m.title || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{m.user_name || m.title || "Team Member"}</div>
                    {m.user_email && <div className="text-[10px] text-slate-400 truncate">{m.user_email}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Return Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              setViewingRole(null);
              setViewMode("list");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team & Roles
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 2: DEDICATED FULL PAGE ROLE EDITOR (CREATE & EDIT)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === "role-editor") {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-6">
        {/* Top Breadcrumb & Return Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode("list")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team & Roles
          </button>
          <div className="text-[11px] font-bold text-slate-400">
            {editingRoleId ? "Role Configuration / Edit" : "Role Configuration / New"}
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {editingRoleId ? `Edit Role: ${roleName || "Custom Role"}` : "Create Custom Role"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Define role identity and configure granular screen & action permissions for your team members.
          </p>
        </div>

        <form onSubmit={handleSaveRole} className="space-y-6">
          {roleError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {roleError}
            </div>
          )}

          {/* Section 1: Role Identity Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-400" />
              Role Credentials
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Role Name *</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder={isExhibitor ? "e.g. Lead Scanner & Demo Host" : "e.g. VIP Receptionist"}
                  required
                  className={`w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none ${theme.focusBorder}`}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Short Description</label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder={isExhibitor ? "Manages attendee inquiries and product demos" : "Handles VIP guest reception and badge printing"}
                  className={`w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none ${theme.focusBorder}`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Permissions Matrix Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  Select Screen & Action Permissions
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Check all actions this role is authorized to perform
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                {selectedPerms.length} Permissions Selected
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Object.entries(permsByModule).map(([mod, perms]) => {
                const modCodes = perms.map((p) => p.code);
                const allChecked = modCodes.every((c) => selectedPerms.includes(c));
                const someChecked = modCodes.some((c) => selectedPerms.includes(c));

                return (
                  <div
                    key={mod}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 space-y-3 transition hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${theme.dotColor}`} />
                        {getModuleMeta(mod).label}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAllModulePerms(perms)}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-900"
                      >
                        {allChecked ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {perms.map((p) => {
                        const isChecked = selectedPerms.includes(p.code);
                        return (
                          <label
                            key={p.id}
                            onClick={() => togglePerm(p.code)}
                            className={`flex items-center gap-2.5 rounded-lg border p-2 cursor-pointer transition text-xs ${
                              isChecked
                                ? theme.checkboxActive
                                : "border-slate-200/60 bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className={`h-3.5 w-3.5 rounded border-slate-300 ${theme.checkboxTick}`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 truncate" title={p.description || p.name}>
                                {p.name}
                              </div>
                              {p.description && (
                                <div className="text-[10px] text-slate-400 truncate leading-snug">
                                  {p.description}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* In-Flow Action Footer */}
          <div className="flex items-center justify-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={roleLoading}
              className={`rounded-xl px-6 py-2.5 text-xs font-bold transition disabled:opacity-50 ${theme.primaryBtn}`}
            >
              {roleLoading ? "Saving Role..." : editingRoleId ? "Update Role" : "Save Custom Role"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 1: TEAM MEMBERS & ROLES LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-bold border mb-1.5 ${theme.roleBadge}`}>
            <Shield className="h-3.5 w-3.5" />
            {isExhibitor ? "Booth Delegation & Access" : "Organization Governance"}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {isExhibitor ? "Booth Team & Access Control" : "Team & Access Control"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {isExhibitor
              ? "Manage booth representatives, lead capture staff, and assign granular exhibition roles."
              : "Manage organization team members, assign predefined responsibilities, and create custom roles."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "members" ? (
            <Can anyOf={["team.invite", "exhibitor.team.invite"]}>
              <button
                onClick={() => setIsInviteOpen(true)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${theme.primaryBtn}`}
              >
                <UserPlus className="h-4 w-4" />
                Invite Team Member
              </button>
            </Can>
          ) : (
            <Can anyOf={["roles.create", "roles.manage", "exhibitor.roles.manage"]}>
              <button
                onClick={handleOpenCreateRole}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${theme.primaryBtn}`}
              >
                <Plus className="h-4 w-4" />
                Create Custom Role
              </button>
            </Can>
          )}
        </div>
      </div>

      {/* Redesigned Sleek Segmented Tab Navigation with Zero-Jerk Transitions */}
      {(canViewTeam || canViewRoles) && (
        <div className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1.5 shadow-inner">
          {canViewTeam && (
            <button
              onClick={() => setActiveTab("members")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors duration-150 border ${
                activeTab === "members"
                  ? `bg-white shadow-xs ${theme.activeTabRing}`
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Users className="h-4 w-4" />
              Team Members
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === "members" ? theme.activeTabBadge : "bg-slate-200 text-slate-600"
                }`}
              >
                {members.length}
              </span>
            </button>
          )}

          {canViewRoles && (
            <button
              onClick={() => setActiveTab("roles")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors duration-150 border ${
                activeTab === "roles"
                  ? `bg-white shadow-xs ${theme.activeTabRing}`
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Shield className="h-4 w-4" />
              Roles & Permissions
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === "roles" ? theme.activeTabBadge : "bg-slate-200 text-slate-600"
                }`}
              >
                {roles.length}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === "members" && canViewTeam ? (
        /* Team Members Table (Unified Shadcn Table) */
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Member Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28 rounded" />
                          <Skeleton className="h-2.5 w-16 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3.5 w-36 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3.5 w-20 rounded" />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Skeleton className="h-7 w-7 rounded-lg ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    No team members found. Click "Invite Team Member" to add your first collaborator.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${theme.avatarBg}`}>
                          {(m.user_name || m.title || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{m.user_name || m.title || "Team Member"}</div>
                          {m.department && <div className="text-[10px] text-slate-400 font-normal">{m.department}</div>}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-600 font-medium">
                      {m.user_email || "Pending Acceptance"}
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${theme.rolePill}`}>
                        {m.role_name || "Custom Role"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            m.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : m.status === "DEACTIVATED"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {m.status === "ACTIVE" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : m.status === "DEACTIVATED" ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {m.status}
                        </span>

                        {m.status !== "PENDING" && (
                          <Can anyOf={["team.manage", "team.edit", "exhibitor.team.edit"]}>
                            <button
                              type="button"
                              onClick={() => handleToggleMemberStatus(m)}
                              disabled={statusTogglingId === m.id}
                              title={m.status === "ACTIVE" ? "Deactivate team member" : "Activate team member"}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md transition border ${
                                m.status === "ACTIVE"
                                  ? "border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {statusTogglingId === m.id ? (
                                "Updating..."
                              ) : m.status === "ACTIVE" ? (
                                <>
                                  <UserX className="h-2.5 w-2.5" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-2.5 w-2.5" />
                                  Activate
                                </>
                              )}
                            </button>
                          </Can>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-500">
                      {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "Pending"}
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <Can anyOf={["team.remove", "exhibitor.team.remove"]}>
                        <button
                          onClick={() => handleInitiateRemoveMember(m)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : activeTab === "roles" && canViewRoles ? (
        /* Roles & Permissions Table (Cleaned: No Type column, No code under name, User-friendly permissions, Edit Button) */
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Granted Permissions</TableHead>
                <TableHead>Total Scope</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell className="pl-6">
                      <Skeleton className="h-4 w-32 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3.5 w-48 rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Skeleton className="h-7 w-12 rounded-lg ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-700">No Custom Roles Created Yet</div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Roles define granular screen and action access for your team. Click the button below to create your organization's first role.
                      </p>
                      <button
                        onClick={handleOpenCreateRole}
                        className={`mt-1 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${theme.primaryBtn}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create Custom Role
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((r) => {
                  const permList = r.permissions || [];
                  const previewPerms = permList.slice(0, 4);
                  const remainingCount = permList.length - previewPerms.length;

                  return (
                    <TableRow key={r.id}>
                      {/* Role Name only (no code printed underneath!) */}
                      <TableCell className="pl-6">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {r.name}
                          {r.is_default && (
                            <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                              Default Owner
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-500 max-w-xs truncate" title={r.description || ""}>
                        {r.description || "No description provided."}
                      </TableCell>

                      {/* User-friendly permission display (e.g. "Create Events", "View Stalls") */}
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                          {previewPerms.map((p) => (
                            <span
                              key={p}
                              className="rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                            >
                              {permCodeToName[p] || p}
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 cursor-help"
                              title={permList.slice(4).map((p) => permCodeToName[p] || p).join(", ")}
                            >
                              +{remainingCount} more
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {permList.length} permissions
                        </span>
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Access & Permissions (Eye) button */}
                          <button
                            onClick={() => handleOpenViewRole(r)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600 transition"
                            title="View role permissions and access"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit button */}
                          <Can anyOf={["roles.edit", "roles.manage", "exhibitor.roles.manage"]}>
                            <button
                              onClick={() => handleOpenEditRole(r)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                              title="Edit role"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </Can>

                          {/* Delete button (available on all non-default roles) */}
                          {!r.is_default && (
                            <Can anyOf={["roles.delete", "roles.manage", "exhibitor.roles.manage"]}>
                              <button
                                onClick={() => handleInitiateDeleteRole(r)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                title="Delete role"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Can>
                          )}
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400">
          You do not have permission to view this section.
        </div>
      )}

      {/* Role Deletion Guard Warning Modal (When Role has Assigned Team Members or is Protected) */}
      {roleDeleteWarning.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-amber-50/60">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0 shadow-2xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cannot Delete Role: <span className="text-amber-800 font-extrabold">{roleDeleteWarning.role?.name}</span>
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    {roleDeleteWarning.customMessage || "This role is currently assigned to team member(s). You cannot delete a role while it is actively in use."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoleDeleteWarning({ isOpen: false, role: null, assignedMembers: [], customMessage: "" })}
                className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: List of Assigned Members if any */}
            {roleDeleteWarning.assignedMembers.length > 0 && (
              <div className="p-6 space-y-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    Assigned Team Members
                  </span>
                  <span className="text-[11px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {roleDeleteWarning.assignedMembers.length} member{roleDeleteWarning.assignedMembers.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                  {roleDeleteWarning.assignedMembers.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200/60 shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {(m.user_name || m.title || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{m.user_name || m.title || "Team Member"}</div>
                          {m.user_email && <div className="text-[10px] text-slate-400">{m.user_email}</div>}
                        </div>
                      </div>
                      {m.status && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {m.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-blue-50/80 p-3.5 text-xs text-blue-900 border border-blue-100 flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Recommended Resolution:</span> Please reassign these team members to another role in the <strong>Team Members</strong> tab, or remove them before deleting this role.
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: If Protected Template Role */}
            {roleDeleteWarning.assignedMembers.length === 0 && (
              <div className="p-6 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                  <p>
                    Built-in platform roles provide essential default operational definitions for the system. They cannot be permanently deleted.
                  </p>
                  <p className="text-slate-800 font-semibold">
                    If you need tailored permissions for your team, please create a new role with the <strong className="text-cyan-700 font-bold">+ Create Custom Role</strong> button.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setRoleDeleteWarning({ isOpen: false, role: null, assignedMembers: [], customMessage: "" })}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition"
              >
                Understood, Keep Role
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Role Deletion Confirm Modal (For Unassigned Custom Roles) */}
      {roleDeleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0 shadow-2xs">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Custom Role</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete the custom role{" "}
                <strong className="text-slate-900 font-bold">"{roleDeleteConfirm.role?.name}"</strong>? This role is not currently assigned to any team members.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setRoleDeleteConfirm({ isOpen: false, role: null })}
                disabled={roleDeleteLoading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteRole}
                disabled={roleDeleteLoading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {roleDeleteLoading ? "Deleting..." : "Yes, Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Deletion Confirm Modal (Replaces window.confirm & alert) */}
      {memberDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0 shadow-2xs">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Remove Team Member</h3>
                  <p className="text-xs text-slate-500">Revoke access and remove from team</p>
                </div>
              </div>

              {memberDeleteModal.error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{memberDeleteModal.error}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove{" "}
                <strong className="text-slate-900 font-bold">
                  {memberDeleteModal.member?.user_name || memberDeleteModal.member?.name || memberDeleteModal.member?.title || "this member"}
                </strong>
                {memberDeleteModal.member?.user_email && (
                  <span className="text-slate-500"> ({memberDeleteModal.member.user_email})</span>
                )}
                {" "}from your organization?
              </p>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer select-none hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={memberDeleteModal.isHardDelete}
                  onChange={(e) => setMemberDeleteModal((prev) => ({ ...prev, isHardDelete: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">Hard Delete (Permanent Removal)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Purges member and invitation records completely so you can re-invite this email immediately.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setMemberDeleteModal({ isOpen: false, member: null, isHardDelete: true, error: null, loading: false })}
                disabled={memberDeleteModal.loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRemoveMember}
                disabled={memberDeleteModal.loading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {memberDeleteModal.loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Yes, Remove Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal (Guaranteed Role Name Display, No UUID) */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-visible">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Invite Team Member</h2>
                <p className="text-[11px] text-slate-400">Send an email invitation with assigned role</p>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 space-y-4">
              {inviteSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2 border border-emerald-100">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {inviteSuccess}
                </div>
              )}
              {inviteError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2 border border-red-100">
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
                  className={`w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none ${theme.focusBorder}`}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className={`w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none ${theme.focusBorder}`}
                />
              </div>

              {/* Role Select Dropdown - Explicit options guarantee role name display */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Assign Role *</label>
                <Select
                  value={inviteRoleId}
                  onValueChange={(val) => setInviteRoleId(val)}
                  options={roles.map((r) => ({ value: String(r.id), label: r.name }))}
                  placeholder="Select a role..."
                  triggerClassName={`rounded-xl border border-slate-200 px-3.5 py-2 text-xs h-9 ${theme.focusBorder}`}
                >
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
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
                  className={`rounded-xl px-5 py-2 text-xs font-bold transition disabled:opacity-50 ${theme.primaryBtn}`}
                >
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
