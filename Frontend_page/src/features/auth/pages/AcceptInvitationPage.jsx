import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import { setCredentials } from "@/app/store/authSlice";
import { ShieldCheck, Users, Building, ArrowRight, CheckCircle2, AlertCircle, Lock, User } from "lucide-react";

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { accessToken, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState(null);

  // Form fields for new account creation
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Missing invitation token. Please check the link from your email.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/api/v1/rbac/invitations/verify?token=${encodeURIComponent(token)}`);
        if (res.data?.success) {
          setInvitation(res.data.data);
          if (res.data.data.name) setName(res.data.data.name);
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Invalid or expired invitation token.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleExistingAccept = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/rbac/invitations/accept`,
        { token },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => navigate("/OrganizerHome"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to accept invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAndAccept = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await axios.post(`${ENV.API_BASE_URL}/api/v1/rbac/invitations/register-and-accept`, {
        token,
        password,
        name: name || invitation?.name || "",
      });

      if (res.data?.success) {
        const authData = res.data.data;
        dispatch(
          setCredentials({
            user: authData.user,
            token: authData.token || authData.access_token,
            role: authData.user?.role,
          })
        );
        setSuccess(true);
        setTimeout(() => navigate("/OrganizerHome"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to setup account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Verifying your team invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center text-white shadow-2xl backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Invitation Invalid</h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Banner */}
        <div className="relative bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 p-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Official Team Invite
          </div>
          <h1 className="mt-4 text-2xl font-black">You're Invited to Join!</h1>
          <p className="mt-1 text-sm text-cyan-50 opacity-90">
            Collaborate on event operations and management
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome to the Team!</h2>
              <p className="mt-2 text-sm text-slate-400">
                You have successfully joined <strong>{invitation?.organization_name}</strong>. Redirecting to your workspace...
              </p>
            </div>
          ) : (
            <>
              {/* Organization & Role Highlight */}
              <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Organization</div>
                    <div className="text-base font-bold text-white">{invitation?.organization_name}</div>
                  </div>
                </div>

                <hr className="my-3 border-slate-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-400">Assigned Role</div>
                    <div className="text-sm font-bold text-cyan-400">{invitation?.role_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-400">Invited Email</div>
                    <div className="text-sm font-medium text-slate-300">{invitation?.email}</div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              {/* Action Form */}
              {accessToken ? (
                <div>
                  <p className="mb-4 text-xs text-slate-400">
                    You are currently signed in as <strong>{user?.email}</strong>.
                  </p>
                  <button
                    onClick={handleExistingAccept}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmitting ? "Joining..." : "Accept Invitation & Open Workspace"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterAndAccept} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">Create a Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <span className="mt-1 block text-[11px] text-slate-500">Minimum 6 characters</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmitting ? "Setting up..." : "Create Account & Join Team"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
