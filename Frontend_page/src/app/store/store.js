import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import eventReducer from "./eventSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    events: eventReducer,
    auth: authReducer,
  }
});

export default store;
