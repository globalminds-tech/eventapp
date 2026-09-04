import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import WebSidebar from "./components/WebSidebar";
import AuthInitializer from "./components/AuthInitializer";
import ErrorBoundary from "./components/ErrorBoundary";

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
import { PermissionProvider } from "./shared/context/PermissionContext";

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <AuthInitializer>
        <PermissionProvider>
          <Routes>
            {/* ── TIER 1: PUBLIC / DISCOVERY ROUTES (Unprotected) ── */}
            <Route path="/" element={<Home />} />
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
              <Route index element={<Organizerdashboard />} />
              <Route path="Organizerdashboard" element={<Organizerdashboard />} />
              <Route path="livedashboard" element={<LiveDashboard />} />
              <Route path="livedashfoodboard" element={<LiveFoodDashboard />} />
              <Route path="Complaint_page" element={<ComplaintPage />} />
              <Route path="Feedback_page" element={<Feedback />} />
              <Route path="CreateProgram" element={<CreateProgram />} />
              <Route path="Receipt" element={<Receipt />} />
              <Route path="EventReports" element={<EventReports />} />
              <Route path="Abstract_Verification" element={<AbstractVerification />} />
              <Route path="Manage_Stall" element={<ManageStall />} />
              <Route path="SponsorshipPage" element={<SponsorshipPage />} />
              <Route path="AdminApproval" element={<AdminApproval />} />
              <Route path="Billing" element={<Billing />} />
              <Route path="Contacts" element={<Contacts />} />
              <Route path="ProgramCheckin" element={<ProgramCheckin />} />
              <Route path="ProgramVerification" element={<ProgramVerification />} />
              <Route path="BulkPassPage" element={<BulkPassPage />} />
              <Route path="Venu" element={<Venuepage />} />
              <Route path="Vendor" element={<VendorPage />} />
              <Route path="CreateEvent" element={<Createvent />} />
              <Route path="EditEvent/:id" element={<Createvent />} />
              <Route path="EditEvent" element={<Createvent />} />
              <Route path="ViewEvent/:id" element={<Createvent />} />
              <Route path="ViewEvent" element={<Createvent />} />
              <Route path="PolicyPage" element={<PolicyPage />} />
              <Route path="Coupon" element={<Coupon />} />
              <Route path="EventCheckIn" element={<EventCheckIn />} />
              <Route path="FoodCheckIn" element={<FoodCheckIn />} />
              <Route path="Messages" element={<Messagesgreeting />} />
              <Route path="Messages/:eventId" element={<Messagesgreeting />} />
              <Route path="pass" element={<Pass />} />
              <Route path="Todo_task" element={<Todo_task />} />
              <Route path="Verify_Event" element={<Verify_Event />} />
              <Route path="MyProfile" element={<MyProfile />} />
              <Route path="MyPlan" element={<Myplan />} />
              <Route path="ExhibitorSpotRegistration" element={<Exhibitorspotregistration />} />
              <Route path="Exhibitor" element={<Exhibitor />} />
              <Route path="TeamManagement" element={<TeamManagementPage />} />
              <Route path="RoleScreen" element={<TeamManagementPage />} />
              <Route path="UserScreen" element={<TeamManagementPage />} />
              <Route path="User" element={<User />} />
              <Route path="AddonCheckIn" element={<Addoncheckinout />} />
              <Route path="Sportbooking" element={<Sportbooking />} />
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
              <Route index element={<ExhibitorHome />} />
              <Route path="dashboard" element={<ExhibitorHome />} />
              <Route path="my-bookings" element={<Exhibitormybooking />} />
              <Route path="my-bookings/:id" element={<ExhibitorBookingDetail />} />
              <Route path="upcoming-events" element={<ExhibitorUpcomingEvent />} />
              <Route path="event/:id" element={<ExhibitorEventDetail />} />
              <Route path="leads" element={<ExhibitorLeadsPage />} />
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
              <Route path="payouts" element={<PayoutsQueue />} />
            </Route>
            <Route path="/superadmin/*" element={<Navigate to="/superuser/dashboard" replace />} />
            <Route path="/superadmin" element={<Navigate to="/superuser/dashboard" replace />} />

            {/* ── CATCH-ALL 404 ROUTE ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {location.pathname === "/" && <Chatbot />}
        </PermissionProvider>
      </AuthInitializer>
    </ErrorBoundary>
  );
}