import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import WebSidebar from "./components/WebSidebar";

import Home from "./features/public/pages/HomePage";
import AllEvents from "./features/events/pages/AllEventsPage";
import Login from "./features/auth/pages/LoginPage";
import Register from "./features/auth/pages/RegisterPage";
import OrganizerRegister from "./features/auth/pages/OrganizerRegisterPage";
import ExhibitorRegister from "./features/auth/pages/ExhibitorRegisterPage";
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

export default function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-events" element={<AllEvents />} />
        <Route path="/event-detail/:id" element={<EventDetail />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-passes" element={<MyPassesPage />} />
        <Route path="/my-bookings" element={<MyPassesPage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/organizer" element={<OrganizerRegister />} />
        <Route path="/register/exhibitor" element={<ExhibitorRegister />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Help_Center" element={<Help />} />
        <Route path="/Cancellation" element={<Cancellation />} />
        <Route path="/usersbooking/:id" element={<Userbooking />} />
        <Route path="/validate-booking/:id" element={<QRValidation />} />
        <Route path="/validate-booking" element={<QRValidation />} />
        <Route path="/QRValidation" element={<QRValidation />} />
        <Route path="/QRValidation/:id" element={<QRValidation />} />
        <Route path="/CreateEvent" element={<Navigate to="/OrganizerHome/CreateEvent" replace />} />
        <Route path="/OrganizerHome" element={<ProtectedRoute allowedRoles={["organizer"]}><WebSidebar role="organizer" /></ProtectedRoute>}>
          <Route index element={<ProtectedRoute allowedRoles={["organizer"]}><Organizerdashboard /></ProtectedRoute>} />
          <Route path="livedashboard" element={<ProtectedRoute allowedRoles={["organizer"]}><LiveDashboard /></ProtectedRoute>} />
          <Route path="livedashfoodboard" element={<ProtectedRoute allowedRoles={["organizer"]}><LiveFoodDashboard /></ProtectedRoute>} />
          <Route path="Organizerdashboard" element={<ProtectedRoute allowedRoles={["organizer"]}><Organizerdashboard /></ProtectedRoute>} />
          <Route path="Complaint_page" element={<ProtectedRoute allowedRoles={["organizer"]}><ComplaintPage /></ProtectedRoute>} />
          <Route path="Feedback_page" element={<ProtectedRoute allowedRoles={["organizer"]}><Feedback /></ProtectedRoute>} />
          <Route path="CreateProgram" element={<ProtectedRoute allowedRoles={["organizer"]}><CreateProgram /></ProtectedRoute>} />
          <Route path="Receipt" element={<ProtectedRoute allowedRoles={["organizer"]}><Receipt /></ProtectedRoute>} />
          <Route path="EventReports" element={<ProtectedRoute allowedRoles={["organizer"]}><EventReports /></ProtectedRoute>} />
          <Route path="Abstract_Verification" element={<ProtectedRoute allowedRoles={["organizer"]}><AbstractVerification /></ProtectedRoute>} />
          <Route path="Manage_Stall" element={<ProtectedRoute allowedRoles={["organizer"]}><ManageStall /></ProtectedRoute>} />
          <Route path="SponsorshipPage" element={<ProtectedRoute allowedRoles={["organizer"]}><SponsorshipPage /></ProtectedRoute>} />
          <Route path="AdminApproval" element={<ProtectedRoute allowedRoles={["organizer"]}><AdminApproval /></ProtectedRoute>} />
          <Route path="Billing" element={<ProtectedRoute allowedRoles={["organizer"]}><Billing /></ProtectedRoute>} />
          <Route path="Contacts" element={<ProtectedRoute allowedRoles={["organizer"]}><Contacts /></ProtectedRoute>} />
          <Route path="ProgramCheckin" element={<ProtectedRoute allowedRoles={["organizer"]}><ProgramCheckin /></ProtectedRoute>} />
          <Route path="ProgramVerification" element={<ProtectedRoute allowedRoles={["organizer"]}><ProgramVerification /></ProtectedRoute>} />
          <Route path="BulkPassPage" element={<ProtectedRoute allowedRoles={["organizer"]}><BulkPassPage /></ProtectedRoute>} />
          <Route path="Venu" element={<ProtectedRoute allowedRoles={["organizer"]}><Venuepage /></ProtectedRoute>} />
          <Route path="Vendor" element={<ProtectedRoute allowedRoles={["organizer"]}><VendorPage /></ProtectedRoute>} />
          <Route path="CreateEvent" element={<ProtectedRoute allowedRoles={["organizer"]}><Createvent /></ProtectedRoute>} />
          <Route path="EditEvent/:id" element={<ProtectedRoute allowedRoles={["organizer"]}><Createvent /></ProtectedRoute>} />
          <Route path="EditEvent" element={<ProtectedRoute allowedRoles={["organizer"]}><Createvent /></ProtectedRoute>} />
          <Route path="ViewEvent/:id" element={<ProtectedRoute allowedRoles={["organizer"]}><Createvent /></ProtectedRoute>} />
          <Route path="ViewEvent" element={<ProtectedRoute allowedRoles={["organizer"]}><Createvent /></ProtectedRoute>} />
          <Route path="PolicyPage" element={<ProtectedRoute allowedRoles={["organizer"]}><PolicyPage /></ProtectedRoute>} />
          <Route path="Coupon" element={<ProtectedRoute allowedRoles={["organizer"]}><Coupon /></ProtectedRoute>} />
          <Route path="EventCheckIn" element={<ProtectedRoute allowedRoles={["organizer"]}><EventCheckIn /></ProtectedRoute>} />
          <Route path="FoodCheckIn" element={<ProtectedRoute allowedRoles={["organizer"]}><FoodCheckIn /></ProtectedRoute>} />
          <Route path="Messages" element={<ProtectedRoute allowedRoles={["organizer"]}><Messagesgreeting /></ProtectedRoute>} />
          <Route path="Messages/:eventId" element={<ProtectedRoute allowedRoles={["organizer"]}><Messagesgreeting /></ProtectedRoute>} />
          <Route path="pass" element={<ProtectedRoute allowedRoles={["organizer"]}><Pass /></ProtectedRoute>} />
          <Route path="Todo_task" element={<ProtectedRoute allowedRoles={["organizer"]}><Todo_task /></ProtectedRoute>} />
          <Route path="Verify_Event" element={<ProtectedRoute allowedRoles={["organizer"]}><Verify_Event /></ProtectedRoute>} />
          <Route path="MyProfile" element={<ProtectedRoute allowedRoles={["organizer"]}><MyProfile /></ProtectedRoute>} />
          <Route path="MyPlan" element={<ProtectedRoute allowedRoles={["organizer"]}><Myplan /></ProtectedRoute>} />
          <Route path="ExhibitorSpotRegistration" element={<ProtectedRoute allowedRoles={["organizer"]}><Exhibitorspotregistration /></ProtectedRoute>} />
          <Route path="Exhibitor" element={<ProtectedRoute allowedRoles={["organizer"]}><Exhibitor /></ProtectedRoute>} />
    
          <Route path="RoleScreen" element={<ProtectedRoute allowedRoles={["organizer"]}><Rolescreen /></ProtectedRoute>} />
          <Route path="UserScreen" element={<ProtectedRoute allowedRoles={["organizer"]}><UserScreen /></ProtectedRoute>} />
          <Route path="User" element={<ProtectedRoute allowedRoles={["organizer"]}><User /></ProtectedRoute>} />
          <Route path="AddonCheckIn" element={<ProtectedRoute allowedRoles={["organizer"]}><Addoncheckinout /></ProtectedRoute>} />
          <Route path="Sportbooking" element={<ProtectedRoute allowedRoles={["organizer"]}><Sportbooking /></ProtectedRoute>} />

        </Route>


        <Route path="/exhibitor" element={<ProtectedRoute allowedRoles={["exhibitor"]}><WebSidebar role="exhibitor" /></ProtectedRoute>}>
          <Route path="dashboard" element={<ExhibitorHome />} />
          <Route path="my-bookings" element={<Exhibitormybooking />} />
          <Route path="my-bookings/:id" element={<ExhibitorBookingDetail />} />
          <Route path="upcoming-events" element={<ExhibitorUpcomingEvent />} />
          <Route path="event/:id" element={<ExhibitorEventDetail />} />
          <Route path="leads" element={<ExhibitorLeadsPage />} />
        </Route>
        <Route path="/book-stall/:id" element={<ProtectedRoute allowedRoles={["exhibitor"]}><Exhibitorstall /></ProtectedRoute>} />

        <Route path="/superuser" element={<ProtectedRoute allowedRoles={["superuser"]}><WebSidebar role="superuser" /></ProtectedRoute>}>
          <Route index element={<SuperUserDashboard />} />
          <Route path="dashboard" element={<SuperUserDashboard />} />
          <Route path="approvals" element={<EventApprovalQueue />} />
          <Route path="event/:eventId" element={<EventInspectionDetail />} />
          <Route path="approvals/:eventId" element={<EventInspectionDetail />} />
          <Route path="categories" element={<CategoryMaster />} />
          <Route path="kyc" element={<KycVerification />} />
          <Route path="payouts" element={<PayoutsQueue />} />
        </Route>
      </Routes>
      {location.pathname === "/" && <Chatbot />}

    </>

  );
}