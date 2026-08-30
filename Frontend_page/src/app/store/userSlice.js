import { createSlice } from "@reduxjs/toolkit";

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u && u.id) {
        return {
          id: u.id || "",
          name: u.name || "",
          email: u.email || "",
          role: u.role || "",
          mobile: u.mobile || "",
          organization_name: u.organization_name || u.company_name || "",
          profile_image: u.profile_image || "",
        };
      }
    }
  } catch (e) {}

  return {
    id: localStorage.getItem("id") || sessionStorage.getItem("id") || localStorage.getItem("userId") || sessionStorage.getItem("userId") || "",
    name: localStorage.getItem("name") || sessionStorage.getItem("name") || "",
    email: localStorage.getItem("email") || sessionStorage.getItem("email") || "",
    role: localStorage.getItem("role") || sessionStorage.getItem("role") || "",
    mobile: localStorage.getItem("mobile") || sessionStorage.getItem("mobile") || "",
    organization_name: localStorage.getItem("organization_name") || sessionStorage.getItem("organization_name") || "",
    profile_image: localStorage.getItem("profile_image") || sessionStorage.getItem("profile_image") || "",
  };
};

const userSlice = createSlice({
  name: "user",
  initialState: getInitialUser(),
  reducers: {
    setUser: (state, action) => {
      const p = action.payload || {};
      state.id = p.id || state.id;
      state.name = p.name || state.name;
      state.email = p.email || state.email;
      state.role = p.role || state.role;
      state.mobile = p.mobile || state.mobile;
      state.organization_name = p.organization_name || p.company_name || state.organization_name;
      state.profile_image = p.profile_image || state.profile_image;

      const keysToSync = ["id", "name", "email", "role", "mobile", "organization_name", "profile_image"];
      keysToSync.forEach((k) => {
        if (state[k]) {
          localStorage.setItem(k, state[k]);
          sessionStorage.setItem(k, state[k]);
        }
      });
      localStorage.setItem("user", JSON.stringify(state));
      sessionStorage.setItem("user", JSON.stringify(state));
    },
    clearUser: (state) => {
      state.id = "";
      state.name = "";
      state.email = "";
      state.role = "";
      state.mobile = "";
      state.organization_name = "";
      state.profile_image = "";

      const keysToClear = ["id", "name", "email", "role", "mobile", "organization_name", "profile_image", "user", "token", "userId"];
      keysToClear.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
