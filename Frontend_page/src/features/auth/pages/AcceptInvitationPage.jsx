import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import { setCredentials } from "@/app/store/authSlice";
import { ShieldCheck, Users, Building, ArrowRight, CheckCircle2, AlertCircle, Lock, User } from "lucide-react";

import BrandLogo from "@/components/ui/BrandLogo";

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
      setError("No invitation token provided. Check your email link.");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/api/v1/auth/invitation/${token}`);
        setInvitation(res.data.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Invalid or expired invitation token.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleRegisterAndAccept = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const res = await axios.post(`${ENV.API_BASE_URL}/api/v1/auth/invitation/accept`, {
        token,
        name,
        password,
      });

      const resData = res.data?.data || res.data;
      const newToken = resData?.access_token || resData?.token;
      const userObj = resData?.user;

      if (newToken && userObj) {
        dispatch(setCredentials({ user: userObj, token: newToken, role: "organizer" }));
        localStorage.setItem("user", JSON.stringify(userObj));
        sessionStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("role", "organizer");
        sessionStorage.setItem("role", "organizer");
        setSuccess(true);
        setTimeout(() => {
          navigate("/OrganizerHome", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to accept invitation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExistingAccept = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/auth/invitation/accept-existing`,
        { token },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const resData = res.data?.data || res.data;
      if (resData?.role) {
        dispatch(setCredentials({ role: "organizer" }));
        localStorage.setItem("role", "organizer");
        sessionStorage.setItem("role", "organizer");
        setSuccess(true);
        setTimeout(() => {
          navigate("/OrganizerHome", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to setup account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-screen items-center justify-center bg-gradient-to-b from-slate-50 via-[#f8fafc] to-slate-100 text-slate-900 select-none px-4 overflow-hidden">
        <style>{`
          @keyframes bmeProgressSlideInv {
            0% { transform: translateX(-100%); width: 35%; }
            50% { transform: translateX(65%); width: 55%; }
            100% { transform: translateX(200%); width: 35%; }
          }
        `}</style>
        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-8 flex flex-col items-center text-center">
          <div className="mb-6">
            <BrandLogo textColor="text-slate-900 text-lg font-black" />
          </div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative my-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 rounded-full"
              style={{ animation: "bmeProgressSlideInv 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite" }}
            />
          </div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mt-3">
            Verifying Invitation
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Checking organization credentials...
          </p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-[#f8fafc] to-slate-100 p-4 select-none">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-center text-slate-900 shadow-2xl shadow-slate-200/60 backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Invitation Invalid</h2>
          <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">{error}</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 shadow-xs"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-[#f8fafc] to-slate-100 p-4 select-none">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60">
        {/* Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 p-7 sm:p-8 text-white border-b border-cyan-500/20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Official Team Invite</span>
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white">You're Invited to Join!</h1>
          <p className="mt-1 text-xs text-slate-300 font-medium">
            Collaborate on event operations, ticketing, and check-in workflows
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Welcome to the Team!</h2>
              <p className="mt-2 text-xs text-slate-500 font-medium">
                You have successfully joined <strong>{invitation?.organization_name}</strong>. Redirecting to your workspace...
              </p>
            </div>
          ) : (
            <>
              {/* Organization & Role Highlight */}
              <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/75 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Organization</div>
                    <div className="text-base font-extrabold text-slate-900">{invitation?.organization_name}</div>
                  </div>
                </div>

                <hr className="my-3.5 border-slate-200/80" />

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Role</div>
                    <div className="text-xs font-extrabold text-sky-700 mt-0.5">{invitation?.role_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invited Email</div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{invitation?.email}</div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
                  {error}
                </div>
              )}

              {/* Action Form */}
              {accessToken ? (
                <div>
                  <p className="mb-4 text-xs text-slate-500 font-medium">
                    You are currently signed in as <strong className="text-slate-900">{user?.email}</strong>.
                  </p>
                  <button
                    onClick={handleExistingAccept}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-3.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/25 transition hover:brightness-105 disabled:opacity-50 cursor-pointer border-none"
                  >
                    {isSubmitting ? "Joining..." : "Accept Invitation & Open Workspace"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterAndAccept} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Create a Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                    <span className="mt-1 block text-[11px] text-slate-400 font-medium">Minimum 6 characters</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-3.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/25 transition hover:brightness-105 disabled:opacity-50 cursor-pointer border-none"
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
