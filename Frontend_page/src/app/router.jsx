import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth Pages
import Login from "../features/auth/pages/LoginPage";
import Register from "../features/auth/pages/RegisterPage";
import OrganizerRegister from "../features/auth/pages/OrganizerRegisterPage";
import ExhibitorRegister from "../features/auth/pages/ExhibitorRegisterPage";

// Admin Role Feature Pages
import CategoriesPage from "../features/catalog/pages/CategoryMasterPage";
import EventApprovalQueuePage from "../features/admin/approvals/pages/EventApprovalQueuePage";
import KycVerificationPage from "../features/admin/kyc/pages/KycVerificationPage";

// Organizer Role Feature Pages
import OrganizerDashboardPage from "../features/organizer/dashboard/pages/OrganizerDashboardPage";
import Createvent from "../features/organizer/events/create/EventsPage";
import MyProfile from "../features/organizer/settings/pages/MyProfilePage";

// Exhibitor Role Feature Pages
import ExhibitorHome from "../features/exhibitor/pages/ExhibitorHomePage";
import Exhibitorstall from "../features/exhibitor/pages/StallBookingPage";
import Exhibitormybooking from "../features/exhibitor/pages/MyBookingPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/organizer" element={<OrganizerRegister />} />
      <Route path="/register/exhibitor" element={<ExhibitorRegister />} />

      {/* Super Admin Role Routes */}
      <Route path="/superuser" element={<ProtectedRoute allowedRoles={["superuser", "admin"]}><EventApprovalQueuePage /></ProtectedRoute>} />
      <Route path="/superuser/dashboard" element={<ProtectedRoute allowedRoles={["superuser", "admin"]}><EventApprovalQueuePage /></ProtectedRoute>} />
      <Route path="/superuser/events" element={<ProtectedRoute allowedRoles={["superuser", "admin"]}><EventApprovalQueuePage /></ProtectedRoute>} />
      <Route path="/superuser/approvals" element={<ProtectedRoute allowedRoles={["superuser", "admin"]}><EventApprovalQueuePage /></ProtectedRoute>} />
      <Route path="/superuser/categories" element={<ProtectedRoute allowedRoles={["superuser", "admin"]}><CategoriesPage /></ProtectedRoute>} />

      {/* Organizer Role Routes */}
      <Route path="/OrganizerHome" element={<ProtectedRoute allowedRoles={["organizer", "admin"]}><OrganizerDashboardPage /></ProtectedRoute>} />
      <Route path="/CreateEvent" element={<ProtectedRoute allowedRoles={["organizer", "admin"]}><Createvent /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["organizer", "admin"]}><MyProfile /></ProtectedRoute>} />

      {/* Exhibitor Role Routes */}
      <Route path="/exhibitor" element={<ProtectedRoute allowedRoles={["exhibitor", "admin"]}><ExhibitorHome /></ProtectedRoute>} />
      <Route path="/exhibitor/book-stall" element={<ProtectedRoute allowedRoles={["exhibitor", "admin"]}><Exhibitorstall /></ProtectedRoute>} />
      <Route path="/exhibitor/my-bookings" element={<ProtectedRoute allowedRoles={["exhibitor", "admin"]}><Exhibitormybooking /></ProtectedRoute>} />

      {/* Default Fallback */}
      <Route path="*" element={<OrganizerDashboardPage />} />
    </Routes>
  );
}
