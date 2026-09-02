import React from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import store from "./src/Redux/store";

// Pages
import Home from "./src/pages/Home";
import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import AllEvents from "./src/pages/AllEvents";
import EventDetail from "./src/pages/EventDetail";
import Help_Center from "./src/pages/Help_Center";
import Term from "./src/pages/Term";
import QRValidation from "./src/pages/QRValidation";
import Forgetpsw from "./src/pages/Forgetpsw";
import UserBooking from "./src/pages/UserBooking";
import MyPasses from "./src/pages/MyPasses";

// Organizer
import OrganizerWelcome from "./src/Organizer/OrganizerWelcome";
import Organizerdashboard from "./src/Organizer/Dashboard/Organizerdashboard";
import CreateEvent from "./src/Organizer/MyEvent/CreateEvent/CreateEvent";
import EventsPage from "./src/Organizer/MyEvent/EventsPage";
import Venu from "./src/Organizer/Master/VenueList";
import BulkPassPage from "./src/Organizer/Program/Bulk";
import LiveDashboard from "./src/Organizer/Dashboard/LiveDashboard";
import LiveFoodDashboard from "./src/Organizer/Dashboard/LiveFooddashboard";
import AddonCheckIn from "./src/Organizer/MyEvent/AddonCheckinout";
import SportBooking from "./src/Organizer/MyEvent/Sportbooking";
import Coupon from "./src/Organizer/MyEvent/Coupon";
import EventCheckIn from "./src/Organizer/MyEvent/EventCheckinCheckout";
import FoodCheckIn from "./src/Organizer/MyEvent/FoodCheckinCheckout";
import Messages from "./src/Organizer/MyEvent/MessagesGreeting";
import Pass from "./src/Organizer/MyEvent/Pass";
import TodoTask from "./src/Organizer/MyEvent/TodoTask";
import VerifyEvent from "./src/Organizer/MyEvent/VerifyEvent";
import AbstractVerification from "./src/Organizer/Program/Abstract";
import CreateProgram from "./src/Organizer/Program/CreateProgram";
import ProgramCheckin from "./src/Organizer/Program/ProgramCheckin";
import ProgramVerification from "./src/Organizer/Program/program_verification";
import { Receipt } from "./src/Organizer/Accounts/Receipt";
import AdminApproval from "./src/Organizer/Approval/Approval";
import { Billing } from "./src/Organizer/UserSetting/Billing";
import Contacts from "./src/Organizer/UserSetting/MyContact";
import MyProfile from "./src/Organizer/UserSetting/MyProfile";
import MyPlan from "./src/Organizer/UserSetting/MyPlan";
import ExhibitorSpotRegistration from "./src/Organizer/Users/ExhibitorSpotRegistration";
import Exhibitor from "./src/Organizer/Users/Exhibitor";
import RoleScreen from "./src/Organizer/Users/Rolescreen";
import UserScreen from "./src/Organizer/Users/UserScreen";
import User from "./src/Organizer/Users/User";
import PolicyPage from "./src/Organizer/Master/policy";
import Vendor from "./src/Organizer/Master/Vendor";
import SponsorshipPage from "./src/Organizer/Master/Sponsorship";
import Complaint_page from "./src/Organizer/Help&support/ComplaintFrom";
import Feedback_page from "./src/Organizer/Help&support/Feedback";
import Manage_Stall from "./src/Organizer/Stall/ManageStall";
import EventReports from "./src/Organizer/Reports/EventReports";
import OrganizerKYC from "./src/Organizer/OrganizerKYC";


// Exhibitor
import Exhibitor_Home from "./src/Exhibitor/Exhibitor_Home";
import ExhibitorKYC from "./src/Exhibitor/ExhibitorKYC";
import MyBookings from "./src/Exhibitor/Mybooking";
import UpcomingEvent from "./src/Exhibitor/UpcomingEvent";
import StallBooking from "./src/Exhibitor/Stall_Booking";
import ExhibitorLeads from "./src/Exhibitor/ExhibitorLeads";

// Super User
import Super_user_Home from "./src/super_user/Super_user_Home";
import EventApprovalQueue from "./src/super_user/EventApprovalQueue";
import CategoryMaster from "./src/super_user/CategoryMaster";
import KycVerification from "./src/super_user/KycVerification";
import PayoutsQueue from "./src/super_user/PayoutsQueue";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
          >
            {/* Public Routes */}
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="AllEvents" component={AllEvents} />
            <Stack.Screen name="EventDetail" component={EventDetail} />
            <Stack.Screen name="Help_Center" component={Help_Center} />
            <Stack.Screen name="Term" component={Term} />
            <Stack.Screen name="QRValidation" component={QRValidation} />
            <Stack.Screen name="Forgetpsw" component={Forgetpsw} />
            <Stack.Screen name="UserBooking" component={UserBooking} />
            <Stack.Screen name="MyPasses" component={MyPasses} />

            {/* Organizer Routes */}
            <Stack.Screen
              name="OrganizerWelcome"
              component={OrganizerWelcome}
            />
            <Stack.Screen
              name="Organizerdashboard"
              component={Organizerdashboard}
            />
            <Stack.Screen name="CreateEvent" component={CreateEvent} />
            <Stack.Screen name="EventsPage" component={EventsPage} />
            <Stack.Screen name="Venu" component={Venu} />
            <Stack.Screen name="BulkPassPage" component={BulkPassPage} />
            <Stack.Screen name="LiveDashboard" component={LiveDashboard} />
            <Stack.Screen
              name="LiveFoodDashboard"
              component={LiveFoodDashboard}
            />
            <Stack.Screen name="AddonCheckIn" component={AddonCheckIn} />
            <Stack.Screen name="SportBooking" component={SportBooking} />
            <Stack.Screen name="Coupon" component={Coupon} />
            <Stack.Screen name="EventCheckIn" component={EventCheckIn} />
            <Stack.Screen name="FoodCheckIn" component={FoodCheckIn} />
            <Stack.Screen name="Messages" component={Messages} />
            <Stack.Screen name="Pass" component={Pass} />
            <Stack.Screen name="TodoTask" component={TodoTask} />
            <Stack.Screen name="VerifyEvent" component={VerifyEvent} />
            <Stack.Screen
              name="AbstractVerification"
              component={AbstractVerification}
            />
            <Stack.Screen name="CreateProgram" component={CreateProgram} />
            <Stack.Screen name="ProgramCheckin" component={ProgramCheckin} />
            <Stack.Screen
              name="ProgramVerification"
              component={ProgramVerification}
            />
            <Stack.Screen name="Receipt" component={Receipt} />
            <Stack.Screen name="AdminApproval" component={AdminApproval} />
            <Stack.Screen name="Billing" component={Billing} />
            <Stack.Screen name="Contacts" component={Contacts} />
            <Stack.Screen name="MyProfile" component={MyProfile} />
            <Stack.Screen name="MyPlan" component={MyPlan} />
            <Stack.Screen
              name="ExhibitorSpotRegistration"
              component={ExhibitorSpotRegistration}
            />
            <Stack.Screen name="Exhibitor" component={Exhibitor} />
            <Stack.Screen name="RoleScreen" component={RoleScreen} />
            <Stack.Screen name="UserScreen" component={UserScreen} />
            <Stack.Screen name="User" component={User} />
            <Stack.Screen name="PolicyPage" component={PolicyPage} />
            <Stack.Screen name="Vendor" component={Vendor} />
            <Stack.Screen name="SponsorshipPage" component={SponsorshipPage} />
            <Stack.Screen name="Complaint_page" component={Complaint_page} />
            <Stack.Screen name="Feedback_page" component={Feedback_page} />
            <Stack.Screen name="Manage_Stall" component={Manage_Stall} />
            <Stack.Screen name="EventReports" component={EventReports} />
            <Stack.Screen name="OrganizerKYC" component={OrganizerKYC} />


            {/* Exhibitor Routes */}
            <Stack.Screen name="Exhibitor_Home" component={Exhibitor_Home} />
            <Stack.Screen name="ExhibitorKYC" component={ExhibitorKYC} />
            <Stack.Screen name="MyBookings" component={MyBookings} />
            <Stack.Screen name="UpcomingEvent" component={UpcomingEvent} />
            <Stack.Screen name="BookStall" component={StallBooking} />
            <Stack.Screen name="ExhibitorLeads" component={ExhibitorLeads} />

            {/* Super User Routes */}
            <Stack.Screen name="Super_user_Home" component={Super_user_Home} />
            <Stack.Screen name="EventApprovalQueue" component={EventApprovalQueue} />
            <Stack.Screen name="CategoryMaster" component={CategoryMaster} />
            <Stack.Screen name="KycVerification" component={KycVerification} />
            <Stack.Screen name="PayoutsQueue" component={PayoutsQueue} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
