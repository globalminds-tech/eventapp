import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const userSlice = createSlice({
  name: "user",
  initialState: {
    id: "",
    name: "",
    role: "",
    profile_image: "",
  },
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id || "";
      state.name = action.payload.name || "";
      state.role = action.payload.role || "";
      state.profile_image = action.payload.profile_image || "";
      
      // Async storage updates should ideally be handled outside the reducer
      // or using a middleware/thunk. Since reducers must be pure functions,
      // it's best to handle AsyncStorage calls in the component or via Redux Thunk.
      // But we provide a non-blocking background write here to match web functionality loosely.
      AsyncStorage.multiSet([
        ["id", action.payload.id ? action.payload.id.toString() : ""],
        ["name", action.payload.name || ""],
        ["role", action.payload.role || ""],
        ["profile_image", action.payload.profile_image || ""]
      ]).catch(console.error);
    },
    clearUser: (state) => {
      state.id = "";
      state.name = "";
      state.role = "";
      state.profile_image = "";
      
      AsyncStorage.multiRemove(["id", "name", "role", "profile_image"]).catch(console.error);
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
