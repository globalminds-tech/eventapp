import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    id: sessionStorage.getItem("id") || "",
    name: sessionStorage.getItem("name") || "",
    email: sessionStorage.getItem("email") || "",
    role: sessionStorage.getItem("role") || "",
    mobile: sessionStorage.getItem("mobile") || "",
    organization_name: sessionStorage.getItem("organization_name") || "",
    profile_image: sessionStorage.getItem("profile_image") || "",
  },
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id || state.id;
      state.name = action.payload.name || state.name;
      state.email = action.payload.email || state.email;
      state.role = action.payload.role || state.role;
      state.mobile = action.payload.mobile || state.mobile;
      state.organization_name = action.payload.organization_name || state.organization_name;
      state.profile_image = action.payload.profile_image || state.profile_image;

      if (action.payload.id) sessionStorage.setItem("id", action.payload.id);
      if (action.payload.name) sessionStorage.setItem("name", action.payload.name);
      if (action.payload.email) sessionStorage.setItem("email", action.payload.email);
      if (action.payload.role) sessionStorage.setItem("role", action.payload.role);
      if (action.payload.mobile) sessionStorage.setItem("mobile", action.payload.mobile);
      if (action.payload.organization_name) sessionStorage.setItem("organization_name", action.payload.organization_name);
      if (action.payload.profile_image) sessionStorage.setItem("profile_image", action.payload.profile_image);
    },
    clearUser: (state) => {
      state.id = "";
      state.name = "";
      state.email = "";
      state.role = "";
      state.mobile = "";
      state.organization_name = "";
      state.profile_image = "";
      sessionStorage.removeItem("id");
      sessionStorage.removeItem("name");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("mobile");
      sessionStorage.removeItem("organization_name");
      sessionStorage.removeItem("profile_image");
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
