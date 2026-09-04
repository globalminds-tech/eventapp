import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";

const PermissionContext = createContext({
  permissions: [],
  hasPermission: () => false,
  loading: false,
  refreshPermissions: () => {},
});

export function PermissionProvider({ children }) {
  const { accessToken, user, role } = useSelector((state) => state.auth);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const lastFetchedKeyRef = useRef(null);
  const isFetchingRef = useRef(false);

  const rolesSignature = Array.isArray(user?.roles) ? user.roles.slice().sort().join(",") : "user";
  const userId = user?.id || "";

  const fetchPermissions = useCallback(async (force = false) => {
    if (!accessToken) {
      setPermissions([]);
      lastFetchedKeyRef.current = null;
      return;
    }

    // Cache key based on auth state primitives to prevent redundant duplicate calls
    const cacheKey = `${userId}_${role || "user"}_${rolesSignature}_${accessToken.slice(-10)}`;
    if (!force && lastFetchedKeyRef.current === cacheKey) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    // Immediate Super Admin check
    const userRoles = Array.isArray(user?.roles) ? user.roles : ["user"];
    if (userRoles.some((r) => ["superuser", "superadmin", "admin"].includes(String(r).toLowerCase()))) {
      setPermissions(["*"]);
      lastFetchedKeyRef.current = cacheKey;
      return;
    }

    // Exhibitors and regular attendees do not have organizer team RBAC permissions
    const isOrganizer = userRoles.some((r) => String(r).toLowerCase() === "organizer");
    if (!isOrganizer) {
      setPermissions([]);
      lastFetchedKeyRef.current = cacheKey;
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    try {
      const res = await axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/me/permissions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPermissions(res.data.data);
        lastFetchedKeyRef.current = cacheKey;
      }
    } catch (err) {
      console.warn("[PermissionContext] Failed to load permissions:", err);
      // Fallback: If Organizer Owner, grant standard organizer permissions
      if (userRoles.includes("organizer")) {
        setPermissions([
          "events.view", "events.create", "events.edit", "events.delete", "events.publish",
          "stalls.view", "stalls.create", "stalls.edit", "stalls.approve", "stalls.delete",
          "checkin.view", "checkin.scan", "finance.view", "team.view", "roles.view"
        ]);
        lastFetchedKeyRef.current = cacheKey;
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [accessToken, userId, role, rolesSignature]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback(
    (requiredPermission) => {
      if (!requiredPermission) return true;
      if (permissions.includes("*")) return true;

      // Direct match
      if (permissions.includes(requiredPermission)) return true;

      // Module wildcard match: e.g. "events.*" satisfies "events.create"
      const [module] = requiredPermission.split(".");
      if (module && permissions.includes(`${module}.*`)) return true;

      return false;
    },
    [permissions]
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
