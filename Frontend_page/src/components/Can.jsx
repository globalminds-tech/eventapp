import React from "react";
import { usePermissions } from "@/shared/context/PermissionContext";

/**
 * Declarative component for granular UI access control.
 *
 * Usage:
 * <Can I="events.create" fallback={<p>Not allowed</p>}>
 *   <button>+ Create Event</button>
 * </Can>
 */
export default function Can({ I, anyOf, allOf, children, fallback = null }) {
  const { hasPermission } = usePermissions();

  if (I) {
    return hasPermission(I) ? <>{children}</> : fallback;
  }

  if (anyOf && Array.isArray(anyOf)) {
    const allowed = anyOf.some((perm) => hasPermission(perm));
    return allowed ? <>{children}</> : fallback;
  }

  if (allOf && Array.isArray(allOf)) {
    const allowed = allOf.every((perm) => hasPermission(perm));
    return allowed ? <>{children}</> : fallback;
  }

  return <>{children}</>;
}
