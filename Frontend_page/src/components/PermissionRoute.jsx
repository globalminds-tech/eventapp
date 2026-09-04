import React from "react";
import { usePermissions } from "@/shared/context/PermissionContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PermissionRoute({ required, children }) {
  const { hasPermission, loading } = usePermissions();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs font-bold text-slate-600">Verifying security permissions...</span>
        </div>
      </div>
    );
  }

  if (!hasPermission(required)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-red-50 p-4 ring-8 ring-red-50/50">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          You do not have the required permission (<code>{required}</code>) to access this section. 
          Please contact your organization administrator to request access.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
