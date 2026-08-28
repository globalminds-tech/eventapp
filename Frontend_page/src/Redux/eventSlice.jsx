import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEventshow } from "@/Services/api";

const ensureArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

// Async thunk to fetch events for organizer
export const fetchEventsThunk = createAsyncThunk(
  "events/fetchEvents",
  async (organizerId, { rejectWithValue }) => {
    try {
      const data = await getEventshow(organizerId, true);
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
      state.list.unshift(action.payload);
    },
    updateEventInStore: (state, action) => {
      if (!Array.isArray(state.list)) state.list = [];
      const index = state.list.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      }
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
