import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "@/app/store/userSlice";
import { CalendarDays, Store, LogOut } from "lucide-react";


const ExhibitorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

   const handleLogout = () => {
    // Clear Session Storage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userName");

    // Clear Redux State
    dispatch(clearUser());

    // Navigate to Login
    navigate("/");
  };

  const navItem = (path) =>
    `px-4 py-2 rounded-lg cursor-pointer ${
      location.pathname === path
        ? "bg-purple-600 text-white"
        : "text-gray-300 hover:bg-slate-800"
    }`;

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 px-6 py-3 flex justify-between items-center">

      <h1 className="text-xl font-bold">Exhibitor Panel</h1>

      <div className="flex gap-4">
        <div
          className={navItem("/exhibitor/my-bookings")}
          onClick={() => navigate("/exhibitor/my-bookings")}
        >
          <Store size={16} className="inline mr-1" />
          My Bookings
        </div>
        <div
          className={navItem("/exhibitor/upcoming-events")}
          onClick={() => navigate("/exhibitor/upcoming-events")}
        >
          <Store size={16} className="inline mr-1" />
          UpComing Event
        </div>

        <button
   onClick={() => setShowLogoutModal(true)}
  className="ml-2 flex items-center gap-2 px-3 py-2 
             text-red-600 bg-red-50 
             hover:bg-red-100 hover:text-red-700
             rounded-lg transition-all duration-300 group 
             border border-red-100"
>
  <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
  
  <span className="text-xs font-semibold hidden md:block">
    Logout
  </span>
</button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-8 h-8 text-red-600 ml-1" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Logout</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 font-semibold rounded-xl shadow-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ExhibitorNavbar;