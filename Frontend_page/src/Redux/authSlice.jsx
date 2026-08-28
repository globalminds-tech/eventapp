import { createSlice } from "@reduxjs/toolkit";

const getStoredToken = () => {
  const t = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!t || t.includes("authenticated-user-token") || t.includes("-session-token")) {
    return null;
  }
  return t;
};

const getStoredUser = () => {
  try {
    const u = localStorage.getItem("user") || sessionStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const initialToken = getStoredToken();
const initialUser = getStoredUser();

const initialState = {
  user: initialUser,
  accessToken: initialToken,
  role: initialUser?.role || sessionStorage.getItem("userRole") || null,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, accessToken, role } = action.payload || {};
      const validToken = accessToken || token;
      
      if (validToken && !validToken.includes("authenticated-user-token")) {
        state.accessToken = validToken;
        state.isAuthenticated = true;
        localStorage.setItem("token", validToken);
        sessionStorage.setItem("token", validToken);
      }
      
      if (user) {
        state.user = user;
        state.role = user.role || role || state.role;
        localStorage.setItem("user", JSON.stringify(user));
        if (user.id) sessionStorage.setItem("userId", user.id);
        if (user.role) sessionStorage.setItem("userRole", user.role);
        if (user.name) sessionStorage.setItem("userName", user.name);
      }
      
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
