import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import { getUserAvailableRoles } from "@/shared/services/authHelper";

const DEFAULT_ORGANIZER_PERMS = [
  "dashboard.view", "events.view", "events.create", "events.edit", "events.delete", "events.publish",
  "stalls.view", "stalls.create", "stalls.edit", "stalls.approve", "stalls.delete",
  "checkin.view", "checkin.scan", "finance.view", "team.view", "roles.view", "roles.manage",
  "master_data.view", "master_data.create", "master_data.edit", "master_data.delete",
  "venues.view", "venues.manage", "organizer.*"
];

const DEFAULT_EXHIBITOR_PERMS = [
  "exhibitor.dashboard.view", "exhibitor.events.browse", "exhibitor.stalls.book", "exhibitor.stalls.view", "exhibitor.stalls.manage",
  "exhibitor.leads.view", "exhibitor.leads.export", "exhibitor.leads.scan",
  "exhibitor.booth.manage", "exhibitor.billing.view",
  "exhibitor.team.view", "exhibitor.team.invite", "exhibitor.team.edit", "exhibitor.team.remove", "exhibitor.roles.manage", "exhibitor.*"
];

const PermissionContext = createContext({
  permissions: [],
  hasPermission: () => false,
  loading: false,
  refreshPermissions: () => {},
});

export function PermissionProvider({ children }) {
  const location = useLocation();
  const { accessToken, user, role } = useSelector((state) => state.auth);

  const rolesSignature = Array.isArray(user?.roles) ? user.roles.slice().sort().join(",") : "user";
  const userId = user?.id || "";

  // Determine current active workspace scope based on route or role
  const isExhibitorPortal = location.pathname.toLowerCase().startsWith("/exhibitor") || String(role || "").toLowerCase() === "exhibitor";
  const activeScope = isExhibitorPortal ? "exhibitor" : "organizer";

  // Pre-seed permissions if user is organizer or exhibitor to prevent any lockout
  const [permissions, setPermissions] = useState(() => {
    const rawRole = String(role || user?.active_role || user?.role || "").toLowerCase();
    const hasOrg = rawRole === "organizer" || (Array.isArray(user?.roles) && user.roles.includes("organizer"));
    if (hasOrg && !isExhibitorPortal) return DEFAULT_ORGANIZER_PERMS;
    const hasExh = rawRole === "exhibitor" || (Array.isArray(user?.roles) && user.roles.includes("exhibitor"));
    if (hasExh && isExhibitorPortal) return DEFAULT_EXHIBITOR_PERMS;
    return [];
  });
  const [loading, setLoading] = useState(false);

  const lastFetchedKeyRef = useRef(null);
  const isFetchingRef = useRef(false);

  const allUserRoles = useMemo(() => {
    const fromHelper = getUserAvailableRoles(user);
    const active = String(role || user?.active_role || user?.role || "").toLowerCase();
    const list = new Set([
      ...fromHelper,
      ...(Array.isArray(user?.roles) ? user.roles.map((r) => String(r).toLowerCase()) : [])
    ]);
    if (active) list.add(active);
    return Array.from(list);
  }, [user, role]);

  const applyDefaults = useCallback((cacheKey) => {
    if (allUserRoles.includes("organizer") && !isExhibitorPortal) {
      setPermissions(DEFAULT_ORGANIZER_PERMS);
      if (cacheKey) lastFetchedKeyRef.current = cacheKey;
    } else if (allUserRoles.includes("exhibitor") && isExhibitorPortal) {
      setPermissions(DEFAULT_EXHIBITOR_PERMS);
      if (cacheKey) lastFetchedKeyRef.current = cacheKey;
    }
  }, [allUserRoles, isExhibitorPortal]);

  const fetchPermissions = useCallback(async (force = false) => {
    if (!accessToken) {
      setPermissions([]);
      lastFetchedKeyRef.current = null;
      return;
    }

    // Cache key based on auth state primitives AND activeScope to prevent redundant calls
    const cacheKey = `${userId}_${activeScope}_${rolesSignature}_${accessToken.slice(-10)}`;
    if (!force && lastFetchedKeyRef.current === cacheKey) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    // Immediate Super Admin check
    if (allUserRoles.some((r) => ["superuser", "superadmin", "admin"].includes(String(r).toLowerCase()))) {
      setPermissions(["*"]);
      lastFetchedKeyRef.current = cacheKey;
      return;
    }

    // Allow both Organizers and Exhibitors to load their workspace team RBAC permissions
    const hasRbacAccess = allUserRoles.some((r) => ["organizer", "exhibitor"].includes(String(r).toLowerCase()));
    if (!hasRbacAccess) {
      setPermissions([]);
      lastFetchedKeyRef.current = cacheKey;
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    try {
      const res = await axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/me/permissions`, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          "X-Workspace-Scope": activeScope
        },
      });
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setPermissions(res.data.data);
        lastFetchedKeyRef.current = cacheKey;
      } else {
        // Apply robust default workspace permissions if backend returned empty array
        applyDefaults(cacheKey);
      }
    } catch (err) {
      console.warn("[PermissionContext] Failed to load permissions:", err);
      applyDefaults(cacheKey);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [accessToken, userId, activeScope, rolesSignature, allUserRoles, applyDefaults]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback(
    (requiredPermission) => {
      if (!requiredPermission) return true;
      if (permissions.includes("*")) return true;

      // Handle array of required permissions (anyOf logic)
      if (Array.isArray(requiredPermission)) {
        return requiredPermission.some((p) => hasPermission(p));
      }

      // Check workspace wildcard: "organizer.*" covers all organizer permissions
      if (permissions.includes("organizer.*") && !String(requiredPermission).startsWith("exhibitor.")) {
        return true;
      }

      // Check workspace wildcard: "exhibitor.*" covers all exhibitor permissions
      if (permissions.includes("exhibitor.*") && String(requiredPermission).startsWith("exhibitor.")) {
        return true;
      }

      // Fallback: If user has confirmed organizer role and is accessing organizer portal, grant organizer-scoped permissions
      if (allUserRoles.includes("organizer") && !isExhibitorPortal && !String(requiredPermission).startsWith("exhibitor.")) {
        return true;
      }

      // Direct match
      if (permissions.includes(requiredPermission)) return true;

      // Module wildcard match: e.g. "events.*" satisfies "events.create"
      const [module] = String(requiredPermission).split(".");
      if (module && permissions.includes(`${module}.*`)) return true;

      return false;
    },
    [permissions, allUserRoles, isExhibitorPortal]
  );

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasPermission,
        loading,
        refreshPermissions: fetchPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
