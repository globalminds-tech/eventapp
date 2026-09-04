import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const fetchPermissions = useCallback(async () => {
    if (!accessToken) {
      setPermissions([]);
      return;
    }

    // Immediate Super Admin check
    const userRoles = Array.isArray(user?.roles) ? user.roles : ["user"];
    if (userRoles.some((r) => ["superuser", "superadmin", "admin"].includes(String(r).toLowerCase()))) {
      setPermissions(["*"]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/me/permissions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPermissions(res.data.data);
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
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, user, role]);

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
