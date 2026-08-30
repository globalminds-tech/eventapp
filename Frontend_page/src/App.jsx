import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import WebSidebar from "./components/WebSidebar";

import Home from "./pages/Home";
import AllEvents from "./pages/AllEvents";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrganizerRegister from "./pages/OrganizerRegister";
import ExhibitorRegister from "./pages/ExhibitorRegister";
import { Sidebar } from "./Organizer/Homepage"
import { LiveDashboard } from "./Organizer/Dashboard/LiveDashboard";
import { LiveFoodDashboard } from "./Organizer/Dashboard/LiveFooddashboard";
import { Organizerdashboard } from "./Organizer/Dashboard/Organizerdashboard";
import ComplaintPage from "./Organizer/Help&support/ComplaintFrom";
import  Feedback  from "./Organizer/Help&support/Feedback"
import CreateProgram  from "./Organizer/Program/CreateProgram"
import { Receipt } from "./Organizer/Accounts/Receipt"
import { EventReports } from "./Organizer/Reports/EventReports"
import { AbstractVerification } from "./Organizer/Program/Abstract"
import { ManageStall } from "./Organizer/Stall/Manage-stall"
import { SponsorshipPage } from "./Organizer/Master/Sponsorship"
import AdminApproval from "./Organizer/Approval/Approval"
import { Billing } from "./Organizer/User Setting/Billing"
import { Contacts } from "./Organizer/User Setting/My_contact"
import { ProgramCheckin } from "./Organizer/Program/ProgramCheckin"
import { ProgramVerification } from "./Organizer/Program/program_verification"
import BulkPassPage  from "./Organizer/Program/Bulk"
import { Venuepage } from "./Organizer/Master/VenueList"
import { VendorPage } from "./Organizer/Master/Vendor"
import { PolicyPage } from "./Organizer/Master/policy"
import Createvent from "./Organizer/MyEvent/CreateEvent/EventsPage"
import { Userbooking } from "./users/users"

import { OrganizerWelcome } from "./Organizer/OrganizerWelcome";

import ExhibitorHome from "./Exhibitor/Exhibitor_Home"
import Exhibitorstall from "./Exhibitor/Stall_Booking"
import Exhibitormybooking from "./Exhibitor/Mybooking"
import ExhibitorUpcomingEvent from "./Exhibitor/UpcomingEvent"

import SuperUserDashboard from "./Super_User/SuperUserDashboard";
import EventApprovalQueue from "./Super_User/EventApprovalQueue";
import EventInspectionDetail from "./Super_User/EventInspectionDetail";
import CategoryMaster from "./Super_User/CategoryMaster";
import KycVerification from "./Super_User/KycVerification";
import PayoutsQueue from "./Super_User/PayoutsQueue";

import ForgotPassword from "./pages/Forgetpsw"

import Coupon from "./Organizer/MyEvent/Coupon"
import EventCheckIn from "./Organizer/MyEvent/EventCheckin&Checkout"
import FoodCheckIn from "./Organizer/MyEvent/FoodCheckin&Checkout"
import Messagesgreeting from "./Organizer/MyEvent/Messages_&_greeting"
import Pass from "./Organizer/MyEvent/pass"
import Todo_task from "./Organizer/MyEvent/Todo_task"
import Verify_Event from "./Organizer/MyEvent/Verify_Event"
import MyProfile from "./Organizer/User Setting/My Profile"
import Myplan from "./Organizer/User Setting/My Plan"
import Exhibitorspotregistration from "./Organizer/Users/Exhibitor spot registration"
import Exhibitor from "./Organizer/Users/Exhibitor";

import Rolescreen from "./Organizer/Users/Rolescreen";
import UserScreen from "./Organizer/Users/UserScreen";
import User from "./Organizer/Users/User";
import Addoncheckinout from "./Organizer/MyEvent/Addon_Chekin&out";
import Sportbooking from "./Organizer/MyEvent/Sportbooking";
import QRValidation from "./pages/QRValidation";
import Terms  from "./pages/Term";
import Help from "./pages/Help_Center"
import Cancellation from "./pages/cancellation"
import Chatbot from "./components/chatbot";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";

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
          <Route path="upcoming-events" element={<ExhibitorUpcomingEvent />} />
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