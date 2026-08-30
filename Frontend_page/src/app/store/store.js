import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import eventReducer from "./eventSlice";
import authReducer from "./authSlice";
import adminReducer from "./adminSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    events: eventReducer,
    auth: authReducer,
    admin: adminReducer,
  }
});

export default store;
