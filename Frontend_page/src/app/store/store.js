import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import eventReducer from "./eventSlice";
import authReducer from "./authSlice";
import adminReducer from "./adminSlice";
import exhibitorReducer from "./exhibitorSlice";
import { injectStore } from "@/shared/api/axiosClient";

export const store = configureStore({
  reducer: {
    user: userReducer,
    events: eventReducer,
    auth: authReducer,
    admin: adminReducer,
    exhibitor: exhibitorReducer,
  }
});

// Inject store instance into axiosClient to break circular import chain
injectStore(store);

export default store;
