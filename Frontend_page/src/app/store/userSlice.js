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
          roles: Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ["user"]),
          active_role: u.active_role || u.role || "user",
          role: u.active_role || u.role || "user",
          mobile: u.mobile || "",
          organization_name: u.organization_name || u.company_name || "",
          profile_image: u.profile_image || "",
          profiles: u.profiles || {},
        };
      }
    }
  } catch (e) {}

  let storedRoles = [];
  try {
    const r = localStorage.getItem("roles") || sessionStorage.getItem("roles");
    if (r) storedRoles = JSON.parse(r);
  } catch (e) {}

  return {
    id: localStorage.getItem("id") || sessionStorage.getItem("id") || localStorage.getItem("userId") || sessionStorage.getItem("userId") || "",
    name: localStorage.getItem("name") || sessionStorage.getItem("name") || "",
    email: localStorage.getItem("email") || sessionStorage.getItem("email") || "",
    roles: Array.isArray(storedRoles) && storedRoles.length > 0 ? storedRoles : ["user"],
    active_role: localStorage.getItem("role") || sessionStorage.getItem("role") || "user",
    role: localStorage.getItem("role") || sessionStorage.getItem("role") || "user",
    mobile: localStorage.getItem("mobile") || sessionStorage.getItem("mobile") || "",
    organization_name: localStorage.getItem("organization_name") || sessionStorage.getItem("organization_name") || "",
    profile_image: localStorage.getItem("profile_image") || sessionStorage.getItem("profile_image") || "",
    profiles: {},
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
      if (Array.isArray(p.roles)) state.roles = p.roles;
      state.active_role = p.active_role || p.role || state.active_role;
      state.role = state.active_role;
      state.mobile = p.mobile || state.mobile;
      state.organization_name = p.organization_name || p.company_name || state.organization_name;
      state.profile_image = p.profile_image || state.profile_image;
      if (p.profiles) state.profiles = p.profiles;

      const keysToSync = ["id", "name", "email", "role", "mobile", "organization_name", "profile_image"];
      keysToSync.forEach((k) => {
        if (state[k]) {
          localStorage.setItem(k, state[k]);
          sessionStorage.setItem(k, state[k]);
        }
      });
      if (state.roles) {
        localStorage.setItem("roles", JSON.stringify(state.roles));
        sessionStorage.setItem("roles", JSON.stringify(state.roles));
      }
      localStorage.setItem("user", JSON.stringify(state));
      sessionStorage.setItem("user", JSON.stringify(state));
    },
    clearUser: (state) => {
      state.id = "";
      state.name = "";
      state.email = "";
      state.roles = [];
      state.active_role = "";
      state.role = "";
      state.mobile = "";
      state.organization_name = "";
      state.profile_image = "";

      const keysToClear = ["id", "name", "email", "role", "roles", "active_role", "mobile", "organization_name", "profile_image", "user", "token", "userId"];
      keysToClear.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
