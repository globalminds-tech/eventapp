import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import WebSidebar from "./components/WebSidebar";
import AuthInitializer from "./components/AuthInitializer";
import ErrorBoundary from "./components/ErrorBoundary";
import NetworkStatusWatcher from "./components/NetworkStatusWatcher";

import Home from "./features/public/pages/HomePage";
import AllEvents from "./features/events/pages/AllEventsPage";
import Login from "./features/auth/pages/LoginPage";
import Register from "./features/auth/pages/RegisterPage";
import UpgradeOrganizerPage from "./features/auth/pages/UpgradeOrganizerPage";
import UpgradeExhibitorPage from "./features/auth/pages/UpgradeExhibitorPage";
import ExhibitorLeadsPage from "./features/exhibitor/pages/ExhibitorLeadsPage";
import { LiveDashboard } from "./features/organizer/dashboard/pages/LiveDashboardPage";
import { LiveFoodDashboard } from "./features/organizer/dashboard/pages/LiveFoodDashboardPage";
import { Organizerdashboard } from "./features/organizer/dashboard/pages/OrganizerDashboardPage";
import ComplaintPage from "./features/organizer/support/pages/ComplaintPage";
import Feedback from "./features/organizer/support/pages/FeedbackPage";
import CreateProgram from "./features/organizer/programs/pages/CreateProgramPage";
import { Receipt } from "./features/organizer/settings/pages/ReceiptPage";
import { EventReports } from "./features/organizer/reports/pages/EventReportsPage";
import { AbstractVerification } from "./features/organizer/programs/pages/AbstractPage";
import { ManageStall } from "./features/organizer/stalls/pages/ManageStallPage";
import { SponsorshipPage } from "./features/sponsor/pages/SponsorshipPage";
import AdminApproval from "./features/organizer/settings/pages/ApprovalPage";
import { Billing } from "./features/organizer/settings/pages/BillingPage";
import { Contacts } from "./features/organizer/settings/pages/MyContactPage";
import { ProgramCheckin } from "./features/organizer/programs/pages/ProgramCheckinPage";
import { ProgramVerification } from "./features/organizer/programs/pages/ProgramVerificationPage";
import BulkPassPage from "./features/organizer/programs/pages/BulkPage";
import { Venuepage } from "./features/venue/pages/VenueListPage";
import { VendorPage } from "./features/vendor/pages/VendorPage";
import { PolicyPage } from "./features/organizer/settings/pages/PolicyPage";
import Createvent from "./features/organizer/events/create/EventsPage";
import { Userbooking } from "./features/users/pages/UserBookingPage";

import ExhibitorHome from "./features/exhibitor/pages/ExhibitorHomePage";
import Exhibitorstall from "./features/exhibitor/pages/StallBookingPage";
import Exhibitormybooking from "./features/exhibitor/pages/MyBookingPage";
import ExhibitorBookingDetail from "./features/exhibitor/pages/ExhibitorBookingDetailPage";
import ExhibitorUpcomingEvent from "./features/exhibitor/pages/UpcomingEventsPage";
import ExhibitorEventDetail from "./features/exhibitor/pages/ExhibitorEventDetailPage";

import SuperUserDashboard from "./features/superuser/pages/SuperUserDashboardPage";
import EventApprovalQueue from "./features/admin/approvals/pages/EventApprovalQueuePage";
import EventInspectionDetail from "./features/superuser/pages/EventInspectionDetailPage";
import CategoryMaster from "./features/catalog/pages/CategoryMasterPage";
import KycVerification from "./features/admin/kyc/pages/KycVerificationPage";
import PayoutsQueue from "./features/superuser/pages/PayoutsQueuePage";
import { ExhibitorBillingPage } from "./features/exhibitor/pages/ExhibitorBillingPage";
import { AdminPayoutsPage } from "./features/admin/pages/AdminPayoutsPage";

import ForgotPassword from "./features/auth/pages/ForgotPasswordPage";



import Coupon from "./features/organizer/events/pages/CouponPage";
import EventCheckIn from "./features/organizer/checkins/pages/EventCheckInPage";
import FoodCheckIn from "./features/organizer/checkins/pages/FoodCheckInPage";
import Messagesgreeting from "./features/organizer/events/pages/MessagesPage";
import Pass from "./features/organizer/events/pages/PassPage";
import Todo_task from "./features/organizer/events/pages/TodoTaskPage";
import Verify_Event from "./features/organizer/events/pages/VerifyEventPage";
import MyProfile from "./features/organizer/settings/pages/MyProfilePage";
import Myplan from "./features/organizer/settings/pages/MyPlanPage";
import Exhibitorspotregistration from "./features/users/pages/ExhibitorSpotRegistrationPage";
import Exhibitor from "./features/users/pages/ExhibitorPage";

import Rolescreen from "./features/users/pages/RoleScreenPage";
import UserScreen from "./features/users/pages/UserScreenPage";
import User from "./features/users/pages/UserPage";
import Addoncheckinout from "./features/organizer/checkins/pages/AddonCheckInPage";
import Sportbooking from "./features/organizer/events/pages/SportBookingPage";
import QRValidation from "./features/events/pages/QRValidationPage";
import Terms from "./features/public/pages/TermsPage";
import Help from "./features/public/pages/HelpCenterPage";
import Cancellation from "./features/public/pages/CancellationPage";
import Chatbot from "./components/chatbot";
import EventDetail from "./features/events/pages/EventDetailPage";
import Profile from "./features/organizer/settings/pages/ProfilePage";
import MyPassesPage from "./features/users/pages/MyPassesPage";
import AcceptInvitationPage from "./features/auth/pages/AcceptInvitationPage";
import TeamManagementPage from "./features/organizer/team/pages/TeamManagementPage";
import { PermissionProvider, usePermissions } from "./shared/context/PermissionContext";
import { useSelector } from "react-redux";
import FirstLoginPasswordModal from "./components/FirstLoginPasswordModal";
import MasterDataPage from "./features/organizer/master-data/pages/MasterDataPage";
import { isSuperUser } from "./shared/services/authHelper";

// Smart Root Redirect: Super Admin directly opens SuperUser Dashboard; others open standard Home
function SmartRootRedirect() {
  const authUser = useSelector((state) => state.auth?.user);
  const authRole = useSelector((state) => state.auth?.role);
  const userSliceUser = useSelector((state) => state.user);

  const isSuper = isSuperUser(authUser || userSliceUser, authRole);

  if (isSuper) {
    return <Navigate to="/superuser/dashboard" replace />;
  }

  return <Home />;
}

// Smart Index Redirect for Organizers: routes to first permitted tool if dashboard is prohibited
function OrganizerIndexRedirect() {
  const { hasPermission, loading, permissions } = usePermissions();

  if (loading && permissions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20 text-slate-400">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span>Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (hasPermission("dashboard.view")) {
    return <Organizerdashboard />;
  }

  if (hasPermission("checkin.scan") || hasPermission("checkin.view")) {
    return <Navigate to="/OrganizerHome/EventCheckIn" replace />;
  }
  if (hasPermission("stalls.view")) {
    return <Navigate to="/OrganizerHome/Manage_Stall" replace />;
  }
  if (hasPermission("team.view") || hasPermission("roles.view") || hasPermission("roles.manage")) {
    return <Navigate to="/OrganizerHome/TeamManagement" replace />;
  }
  if (hasPermission("finance.view")) {
    return <Navigate to="/OrganizerHome/Receipt" replace />;
  }
  if (hasPermission("master_data.view")) {
    return <Navigate to="/OrganizerHome/MasterData" replace />;
  }
  return <Organizerdashboard />;
}

// Smart Index Redirect for Exhibitors: routes to first permitted tool if booth dashboard is prohibited
function ExhibitorIndexRedirect() {
  const { hasPermission, loading, permissions } = usePermissions();

  if (loading && permissions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20 text-slate-400">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Loading portal...</span>
        </div>
      </div>
    );
  }

  if (hasPermission("exhibitor.dashboard.view")) {
    return <ExhibitorHome />;
  }

  if (hasPermission("exhibitor.stalls.view")) {
    return <Navigate to="/exhibitor/my-bookings" replace />;
  }
  if (hasPermission("exhibitor.events.browse")) {
    return <Navigate to="/exhibitor/upcoming-events" replace />;
  }
  if (hasPermission("exhibitor.leads.view")) {
    return <Navigate to="/exhibitor/leads" replace />;
  }
  if (hasPermission("exhibitor.team.view")) {
    return <Navigate to="/exhibitor/team" replace />;
  }
  return <Navigate to="/profile" replace />;
}

export default function App() {
  const location = useLocation();
  const authUser = useSelector((state) => state.auth?.user);
  const userSliceUser = useSelector((state) => state.user);
  const accessToken = useSelector((state) => state.auth?.accessToken);

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  } catch {
    storedUser = null;
  }

  const effectiveUser = authUser || storedUser || userSliceUser;
  const mustChangePassword = Boolean(
    effectiveUser?.must_change_password ||
    storedUser?.must_change_password ||
    authUser?.must_change_password
  );

  return (
    <ErrorBoundary>
      <AuthInitializer>
        <PermissionProvider>
          <Routes>
            {/* ── TIER 1: PUBLIC / DISCOVERY ROUTES (Unprotected) ── */}
            <Route path="/" element={<SmartRootRedirect />} />
            <Route path="/all-events" element={<AllEvents />} />
            <Route path="/event-detail/:id" element={<EventDetail />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/Terms" element={<Terms />} />
            <Route path="/Help_Center" element={<Help />} />
            <Route path="/Cancellation" element={<Cancellation />} />
            <Route path="/validate-booking/:id" element={<QRValidation />} />
            <Route path="/validate-booking" element={<QRValidation />} />
            <Route path="/QRValidation" element={<QRValidation />} />
            <Route path="/QRValidation/:id" element={<QRValidation />} />
            <Route path="/accept-invite" element={<AcceptInvitationPage />} />

            {/* Auth Routes */}
            <Route path="/Login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/partner" element={<Navigate to="/register" replace />} />
            <Route path="/register/organizer" element={<Navigate to="/upgrade/organizer" replace />} />
            <Route path="/register/exhibitor" element={<Navigate to="/upgrade/exhibitor" replace />} />
            <Route path="/reset-password" element={<ForgotPassword />} />

            {/* ── TIER 2: AUTHENTICATED ATTENDEE & ACCOUNT ROUTES ── */}
            {/* Ticket checkout requires logged-in user so passes bind to account */}
            <Route path="/usersbooking/:id" element={<ProtectedRoute allowedRoles={["user"]}><Userbooking /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["user"]}><Profile /></ProtectedRoute>} />
            <Route path="/my-passes" element={<ProtectedRoute allowedRoles={["user"]}><MyPassesPage /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={["user"]}><MyPassesPage /></ProtectedRoute>} />
            <Route path="/upgrade/organizer" element={<ProtectedRoute allowedRoles={["user"]}><UpgradeOrganizerPage /></ProtectedRoute>} />
            <Route path="/upgrade/exhibitor" element={<ProtectedRoute allowedRoles={["user"]}><UpgradeExhibitorPage /></ProtectedRoute>} />

            {/* ── TIER 3: ORGANIZER CONSOLE (Single Parent Guard) ── */}
            <Route path="/CreateEvent" element={<Navigate to="/OrganizerHome/CreateEvent" replace />} />
            <Route
              path="/OrganizerHome"
              element={
                <ProtectedRoute allowedRoles={["organizer"]}>
                  <WebSidebar role="organizer" />
                </ProtectedRoute>
              }
            >
              <Route index element={<OrganizerIndexRedirect />} />
              <Route path="Organizerdashboard" element={<PermissionRoute required="dashboard.view"><Organizerdashboard /></PermissionRoute>} />
              <Route path="livedashboard" element={<LiveDashboard />} />
              <Route path="livedashfoodboard" element={<LiveFoodDashboard />} />
              <Route path="Complaint_page" element={<ComplaintPage />} />
              <Route path="Feedback_page" element={<Feedback />} />
              <Route path="CreateProgram" element={<CreateProgram />} />
              <Route path="Receipt" element={<PermissionRoute required="finance.view"><Receipt /></PermissionRoute>} />
              <Route path="EventReports" element={<EventReports />} />
              <Route path="Abstract_Verification" element={<AbstractVerification />} />
              <Route path="Manage_Stall" element={<PermissionRoute required="stalls.view"><ManageStall /></PermissionRoute>} />
              <Route path="SponsorshipPage" element={<SponsorshipPage />} />
              <Route path="AdminApproval" element={<AdminApproval />} />
              <Route path="Billing" element={<PermissionRoute required="finance.view"><Billing /></PermissionRoute>} />
              <Route path="Contacts" element={<Contacts />} />
              <Route path="ProgramCheckin" element={<ProgramCheckin />} />
              <Route path="ProgramVerification" element={<ProgramVerification />} />
              <Route path="BulkPassPage" element={<BulkPassPage />} />
              <Route path="Venu" element={<PermissionRoute required="venues.view"><Venuepage /></PermissionRoute>} />
              <Route path="Vendor" element={<VendorPage />} />
              <Route path="CreateEvent" element={<PermissionRoute required="events.create"><Createvent /></PermissionRoute>} />
              <Route path="EditEvent/:id" element={<PermissionRoute required="events.edit"><Createvent /></PermissionRoute>} />
              <Route path="EditEvent" element={<PermissionRoute required="events.edit"><Createvent /></PermissionRoute>} />
              <Route path="ViewEvent/:id" element={<PermissionRoute required="events.view"><Createvent /></PermissionRoute>} />
              <Route path="ViewEvent" element={<PermissionRoute required="events.view"><Createvent /></PermissionRoute>} />
              <Route path="PolicyPage" element={<PolicyPage />} />
              <Route path="Coupon" element={<Coupon />} />
              <Route path="EventCheckIn" element={<PermissionRoute required="checkin.view"><EventCheckIn /></PermissionRoute>} />
              <Route path="FoodCheckIn" element={<PermissionRoute required="checkin.view"><FoodCheckIn /></PermissionRoute>} />
              <Route path="Messages" element={<Messagesgreeting />} />
              <Route path="Messages/:eventId" element={<Messagesgreeting />} />
              <Route path="pass" element={<Pass />} />
              <Route path="Todo_task" element={<Todo_task />} />
              <Route path="Verify_Event" element={<Verify_Event />} />
              <Route path="MyProfile" element={<MyProfile />} />
              <Route path="MyPlan" element={<Myplan />} />
              <Route path="ExhibitorSpotRegistration" element={<Exhibitorspotregistration />} />
              <Route path="Exhibitor" element={<Exhibitor />} />
              <Route path="TeamManagement" element={<PermissionRoute required={["team.view", "roles.view", "roles.manage"]}><TeamManagementPage /></PermissionRoute>} />
              <Route path="RoleScreen" element={<PermissionRoute required={["roles.view", "roles.manage", "team.view"]}><TeamManagementPage /></PermissionRoute>} />
              <Route path="UserScreen" element={<PermissionRoute required={["team.view", "roles.view", "roles.manage"]}><TeamManagementPage /></PermissionRoute>} />
              <Route path="User" element={<User />} />
              <Route path="AddonCheckIn" element={<Addoncheckinout />} />
              <Route path="Sportbooking" element={<Sportbooking />} />
              <Route path="MasterData" element={<PermissionRoute required="master_data.view"><MasterDataPage /></PermissionRoute>} />
            </Route>

            {/* ── TIER 4: EXHIBITOR PORTAL (Single Parent Guard) ── */}
            <Route
              path="/exhibitor"
              element={
                <ProtectedRoute allowedRoles={["exhibitor"]}>
                  <WebSidebar role="exhibitor" />
                </ProtectedRoute>
              }
            >
              <Route index element={<ExhibitorIndexRedirect />} />
              <Route path="dashboard" element={<PermissionRoute required="exhibitor.dashboard.view"><ExhibitorHome /></PermissionRoute>} />
              <Route path="my-bookings" element={<PermissionRoute required="exhibitor.stalls.view"><Exhibitormybooking /></PermissionRoute>} />
              <Route path="my-bookings/:id" element={<PermissionRoute required="exhibitor.stalls.view"><ExhibitorBookingDetail /></PermissionRoute>} />
              <Route path="upcoming-events" element={<PermissionRoute required="exhibitor.events.browse"><ExhibitorUpcomingEvent /></PermissionRoute>} />
              <Route path="event/:id" element={<PermissionRoute required="exhibitor.events.browse"><ExhibitorEventDetail /></PermissionRoute>} />
              <Route path="leads" element={<PermissionRoute required="exhibitor.leads.view"><ExhibitorLeadsPage /></PermissionRoute>} />
              <Route path="billing" element={<PermissionRoute required="exhibitor.billing.view"><ExhibitorBillingPage /></PermissionRoute>} />
              <Route path="team" element={<PermissionRoute required="exhibitor.team.view"><TeamManagementPage userScope="exhibitor" /></PermissionRoute>} />
            </Route>
            <Route
              path="/book-stall/:id"
              element={
                <ProtectedRoute allowedRoles={["exhibitor"]}>
                  <Exhibitorstall />
                </ProtectedRoute>
              }
            />

            {/* ── TIER 5: SUPERUSER / PLATFORM ADMIN ── */}
            <Route
              path="/superuser"
              element={
                <ProtectedRoute allowedRoles={["superuser", "superadmin"]}>
                  <WebSidebar role="superuser" />
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperUserDashboard />} />
              <Route path="dashboard" element={<SuperUserDashboard />} />
              <Route path="approvals" element={<EventApprovalQueue />} />
              <Route path="event/:eventId" element={<EventInspectionDetail />} />
              <Route path="approvals/:eventId" element={<EventInspectionDetail />} />
              <Route path="inspection/:eventId" element={<EventInspectionDetail />} />
              <Route path="categories" element={<CategoryMaster />} />
              <Route path="kyc" element={<KycVerification />} />
              <Route path="payouts" element={<AdminPayoutsPage />} />
            </Route>
            <Route path="/superadmin/*" element={<Navigate to="/superuser/dashboard" replace />} />

            <Route path="/superadmin" element={<Navigate to="/superuser/dashboard" replace />} />

            {/* ── CATCH-ALL 404 ROUTE ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {location.pathname === "/" && <Chatbot />}
          <NetworkStatusWatcher />

          {/* Mandatory First-Login Password Reset Dialog (Locks interactions until password is set) */}
          {mustChangePassword && !["/login", "/Login"].includes(location.pathname) && (
            <FirstLoginPasswordModal
              isOpen={true}
              user={effectiveUser}
              token={accessToken}
              onSuccess={(user) => {
                const roles = user?.roles || [];
                const role = user?.active_role || user?.role || (roles.includes("organizer") ? "organizer" : "user");
                if (roles.includes("superuser") || roles.includes("superadmin")) {
                  window.location.replace("/superuser/dashboard");
                } else if (role === "organizer" || roles.includes("organizer")) {
                  window.location.replace("/OrganizerHome");
                } else if (role === "exhibitor" || roles.includes("exhibitor")) {
                  window.location.replace("/exhibitor");
                } else {
                  window.location.replace("/");
                }
              }}
            />
          )}
        </PermissionProvider>
      </AuthInitializer>
    </ErrorBoundary>
  );
}