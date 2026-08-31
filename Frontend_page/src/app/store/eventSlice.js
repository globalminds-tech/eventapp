import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { eventApi } from "../../features/events/api/event.api";

const ensureArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

export const fetchEventsThunk = createAsyncThunk(
  "events/fetchEvents",
  async (param, { getState, rejectWithValue }) => {
    try {
      const isObject = param && typeof param === "object" && !Array.isArray(param);
      const organizerId = isObject ? param.organizerId : param;
      const force = isObject ? Boolean(param.force) : false;

      const state = getState();
      if (!force && state.events?.loaded && Array.isArray(state.events?.list) && state.events.list.length > 0) {
        return state.events.list;
      }

      const data = await eventApi.getEventshow(organizerId);
      return ensureArray(data);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch events");
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState: {
    list: [],
    loading: false,
    loaded: false,
    error: null,
  },
  reducers: {
    setEvents: (state, action) => {
      state.list = ensureArray(action.payload);
      state.loaded = true;
      state.loading = false;
    },
    addEventToStore: (state, action) => {
      if (!Array.isArray(state.list)) state.list = [];
      const newEvt = action.payload;
      const existsIndex = state.list.findIndex((e) => e.id === newEvt.id);
      if (existsIndex !== -1) {
        state.list[existsIndex] = { ...state.list[existsIndex], ...newEvt };
      } else {
        state.list.unshift(newEvt);
      }
      state.loaded = true;
    },
    updateEventInStore: (state, action) => {
      if (!Array.isArray(state.list)) state.list = [];
      const index = state.list.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      }
      state.loaded = true;
    },
    deleteEventFromStore: (state, action) => {
      if (!Array.isArray(state.list)) state.list = [];
      state.list = state.list.filter((e) => e.id !== action.payload);
    },
    invalidateEvents: (state) => {
      state.loaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsThunk.pending, (state) => {
        if (!state.loaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchEventsThunk.fulfilled, (state, action) => {
        state.list = ensureArray(action.payload);
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchEventsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setEvents,
  addEventToStore,
  updateEventInStore,
  deleteEventFromStore,
  invalidateEvents,
} = eventSlice.actions;

export default eventSlice.reducer;
