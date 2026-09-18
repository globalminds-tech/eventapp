import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyBookings,
  getExhibitorLeads,
  addExhibitorLead,
  getExhibitorInvoices
} from "@/shared/services/bookingService";
import { getHomeEventshow } from "@/shared/services/eventService";

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchExhibitorBookings = createAsyncThunk(
  "exhibitor/fetchBookings",
  async ({ userId, status = "all", search = "", force = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState().exhibitor.bookings;
      const now = Date.now();
      const isFilterSame = state.statusFilter === status && state.search === search;

      if (!force && isFilterSame && state.lastFetched && (now - state.lastFetched < CACHE_TTL_MS)) {
        return { data: state.list, fromCache: true, status, search };
      }

      const res = await getMyBookings(userId, { status, search });
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return { data: rawList, fromCache: false, status, search };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch bookings");
    }
  }
);

export const fetchExhibitorEvents = createAsyncThunk(
  "exhibitor/fetchEvents",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().exhibitor.upcomingEvents;
      const now = Date.now();

      if (!force && state.lastFetched && (now - state.lastFetched < CACHE_TTL_MS)) {
        return { data: state.list, fromCache: true };
      }

      const res = await getHomeEventshow(force);
      const rawList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.events) ? res.events : []));
      return { data: rawList, fromCache: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch events");
    }
  }
);

export const fetchExhibitorLeads = createAsyncThunk(
  "exhibitor/fetchLeads",
  async ({ eventId, search = "", force = false }, { getState, rejectWithValue }) => {
    try {
      const eventLeads = getState().exhibitor.leadsByEvent[eventId];
      const now = Date.now();

      if (!force && !search && eventLeads?.lastFetched && (now - eventLeads.lastFetched < CACHE_TTL_MS)) {
        return { eventId, data: eventLeads.list, fromCache: true, search };
      }

      const res = await getExhibitorLeads(eventId, search);
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return { eventId, data: rawList, fromCache: false, search };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch leads");
    }
  }
);

export const createExhibitorLead = createAsyncThunk(
  "exhibitor/createLead",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await addExhibitorLead(payload);
      return { res, payload };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to add lead");
    }
  }
);

export const fetchExhibitorInvoices = createAsyncThunk(
  "exhibitor/fetchInvoices",
  async ({ force = false } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().exhibitor.invoices;
      const now = Date.now();

      if (!force && state.lastFetched && (now - state.lastFetched < CACHE_TTL_MS)) {
        return { data: state.list, fromCache: true };
      }

      const res = await getExhibitorInvoices();
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return { data: rawList, fromCache: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch invoices");
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  bookings: {
    list: [],
    lastFetched: null,
    loading: false,
    error: null,
    statusFilter: "all",
    search: ""
  },
  upcomingEvents: {
    list: [],
    lastFetched: null,
    loading: false,
    error: null,
    categoryFilter: "all",
    search: ""
  },
  leadsByEvent: {}, // { [eventId]: { list: [], lastFetched: number, loading: bool, search: '' } }
  invoices: {
    list: [],
    lastFetched: null,
    loading: false,
    error: null
  },
  dashboardMetrics: {
    data: null,
    lastFetched: null,
    loading: false
  }
};

const exhibitorSlice = createSlice({
  name: "exhibitor",
  initialState,
  reducers: {
    invalidateBookings: (state) => {
      state.bookings.lastFetched = null;
    },
    invalidateEvents: (state) => {
      state.upcomingEvents.lastFetched = null;
    },
    invalidateLeads: (state, action) => {
      const eventId = action.payload;
      if (eventId && state.leadsByEvent[eventId]) {
        state.leadsByEvent[eventId].lastFetched = null;
      } else {
        state.leadsByEvent = {};
      }
    },
    invalidateInvoices: (state) => {
      state.invoices.lastFetched = null;
    },
    invalidateAll: (state) => {
      state.bookings.lastFetched = null;
      state.upcomingEvents.lastFetched = null;
      state.leadsByEvent = {};
      state.invoices.lastFetched = null;
      state.dashboardMetrics.lastFetched = null;
    },
    setBookingsFilter: (state, action) => {
      const { status, search } = action.payload || {};
      if (status !== undefined) state.bookings.statusFilter = status;
      if (search !== undefined) state.bookings.search = search;
    },
    setEventsFilter: (state, action) => {
      const { category, search } = action.payload || {};
      if (category !== undefined) state.upcomingEvents.categoryFilter = category;
      if (search !== undefined) state.upcomingEvents.search = search;
    },
    setDashboardMetrics: (state, action) => {
      state.dashboardMetrics.data = action.payload;
      state.dashboardMetrics.lastFetched = Date.now();
      state.dashboardMetrics.loading = false;
    }
  },
  extraReducers: (builder) => {
    // ── Bookings
    builder
      .addCase(fetchExhibitorBookings.pending, (state, action) => {
        if (!state.bookings.lastFetched || action.meta.arg?.force) {
          state.bookings.loading = true;
        }
        state.bookings.error = null;
      })
      .addCase(fetchExhibitorBookings.fulfilled, (state, action) => {
        state.bookings.loading = false;
        state.bookings.list = action.payload.data;
        state.bookings.statusFilter = action.payload.status;
        state.bookings.search = action.payload.search;
        state.bookings.lastFetched = Date.now();
      })
      .addCase(fetchExhibitorBookings.rejected, (state, action) => {
        state.bookings.loading = false;
        state.bookings.error = action.payload;
      });

    // ── Events
    builder
      .addCase(fetchExhibitorEvents.pending, (state, action) => {
        if (!state.upcomingEvents.lastFetched || action.meta.arg?.force) {
          state.upcomingEvents.loading = true;
        }
        state.upcomingEvents.error = null;
      })
      .addCase(fetchExhibitorEvents.fulfilled, (state, action) => {
        state.upcomingEvents.loading = false;
        state.upcomingEvents.list = action.payload.data;
        state.upcomingEvents.lastFetched = Date.now();
      })
      .addCase(fetchExhibitorEvents.rejected, (state, action) => {
        state.upcomingEvents.loading = false;
        state.upcomingEvents.error = action.payload;
      });

    // ── Leads
    builder
      .addCase(fetchExhibitorLeads.pending, (state, action) => {
        const { eventId, force } = action.meta.arg;
        if (!state.leadsByEvent[eventId]) {
          state.leadsByEvent[eventId] = { list: [], lastFetched: null, loading: true, error: null };
        } else if (!state.leadsByEvent[eventId].lastFetched || force) {
          state.leadsByEvent[eventId].loading = true;
        }
      })
      .addCase(fetchExhibitorLeads.fulfilled, (state, action) => {
        const { eventId, data, search } = action.payload;
        state.leadsByEvent[eventId] = {
          list: data,
          lastFetched: Date.now(),
          loading: false,
          error: null,
          search
        };
      })
      .addCase(fetchExhibitorLeads.rejected, (state, action) => {
        const { eventId } = action.meta.arg;
        if (state.leadsByEvent[eventId]) {
          state.leadsByEvent[eventId].loading = false;
          state.leadsByEvent[eventId].error = action.payload;
        }
      });

    // ── Create Lead (Optimistic + Invalidate)
    builder.addCase(createExhibitorLead.fulfilled, (state, action) => {
      const { payload } = action.payload;
      const eventId = payload.event_id;
      if (state.leadsByEvent[eventId]) {
        state.leadsByEvent[eventId].lastFetched = null;
      }
      if (state.dashboardMetrics.data) {
        state.dashboardMetrics.data.totalLeads = (state.dashboardMetrics.data.totalLeads || 0) + 1;
        if ((payload.buying_intent || "").toLowerCase().includes("hot") || (payload.buying_intent || "").toLowerCase().includes("high")) {
          state.dashboardMetrics.data.hotLeads = (state.dashboardMetrics.data.hotLeads || 0) + 1;
        }
      }
    });

    // ── Invoices
    builder
      .addCase(fetchExhibitorInvoices.pending, (state, action) => {
        if (!state.invoices.lastFetched || action.meta.arg?.force) {
          state.invoices.loading = true;
        }
        state.invoices.error = null;
      })
      .addCase(fetchExhibitorInvoices.fulfilled, (state, action) => {
        state.invoices.loading = false;
        state.invoices.list = action.payload.data;
        state.invoices.lastFetched = Date.now();
      })
      .addCase(fetchExhibitorInvoices.rejected, (state, action) => {
        state.invoices.loading = false;
        state.invoices.error = action.payload;
      });
  }
});

export const {
  invalidateBookings,
  invalidateEvents,
  invalidateLeads,
  invalidateInvoices,
  invalidateAll,
  setBookingsFilter,
  setEventsFilter,
  setDashboardMetrics
} = exhibitorSlice.actions;

export default exhibitorSlice.reducer;
