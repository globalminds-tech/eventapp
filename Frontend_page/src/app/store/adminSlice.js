import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStats } from "@/shared/services/eventService";
import { approvalApi } from "@/features/admin/approvals/api/approval.api";
import { kycApi } from "@/features/admin/kyc/api/kyc.api";
import { getAdminCategories } from "@/shared/services/miscService";

const ensureArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.categories)) return payload.categories;
  return [];
};

// 1. Dashboard Stats Thunk
export const fetchDashboardStatsThunk = createAsyncThunk(
  "admin/fetchDashboardStats",
  async (param, { getState, rejectWithValue }) => {
    try {
      const isObject = param && typeof param === "object" && !Array.isArray(param);
      const period = isObject ? param.period || "30d" : (typeof param === "string" ? param : "30d");
      const force = isObject ? Boolean(param.force) : false;

      const state = getState();
      if (!force && state.admin?.statsLoaded && state.admin?.stats) {
        return state.admin.stats;
      }

      const res = await getDashboardStats(period);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch dashboard stats");
    }
  }
);

// 2. Approval Queue Thunk
export const fetchApprovalQueueThunk = createAsyncThunk(
  "admin/fetchApprovalQueue",
  async (force, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!force && state.admin?.approvalLoaded && state.admin?.approvalQueue?.length > 0) {
        return state.admin.approvalQueue;
      }

      const res = await approvalApi.getEvents();
      return ensureArray(res);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch approval queue");
    }
  }
);

// 3. KYC Verification Users Thunk
export const fetchKycUsersThunk = createAsyncThunk(
  "admin/fetchKycUsers",
  async (force, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!force && state.admin?.kycLoaded && state.admin?.kycUsers?.length > 0) {
        return state.admin.kycUsers;
      }

      const res = await kycApi.getPendingOrganizers();
      return ensureArray(res);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch KYC users");
    }
  }
);

// 4. Categories Thunk
export const fetchCategoriesThunk = createAsyncThunk(
  "admin/fetchCategories",
  async (force, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!force && state.admin?.categoriesLoaded && state.admin?.categories?.length > 0) {
        return state.admin.categories;
      }

      const res = await getAdminCategories();
      return ensureArray(res);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch categories");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: null,
    statsLoading: false,
    statsLoaded: false,

    approvalQueue: [],
    approvalLoading: false,
    approvalLoaded: false,

    kycUsers: [],
    kycLoading: false,
    kycLoaded: false,

    categories: [],
    categoriesLoading: false,
    categoriesLoaded: false,

    error: null
  },
  reducers: {
    updateApprovalStatusInStore: (state, action) => {
      const { eventId, status } = action.payload || {};
      const evt = state.approvalQueue.find((e) => e.id === eventId || e.event_code === eventId);
      if (evt) {
        evt.status = status;
        evt.event_status = status;
      }
    },
    updateKycStatusInStore: (state, action) => {
      const { userId, status } = action.payload || {};
      const user = state.kycUsers.find((u) => String(u.id) === String(userId));
      if (user) {
        user.kyc_status = status;
      }
    },
    addCategoryToStore: (state, action) => {
      state.categories.unshift(action.payload);
    },
    updateCategoryInStore: (state, action) => {
      const index = state.categories.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = { ...state.categories[index], ...action.payload };
      }
    },
    deleteCategoryFromStore: (state, action) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
    invalidateAdminState: (state) => {
      state.statsLoaded = false;
      state.approvalLoaded = false;
      state.kycLoaded = false;
      state.categoriesLoaded = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStatsThunk.pending, (state) => {
        if (!state.statsLoaded) state.statsLoading = true;
      })
      .addCase(fetchDashboardStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.statsLoading = false;
        state.statsLoaded = true;
      })
      .addCase(fetchDashboardStatsThunk.rejected, (state) => {
        state.statsLoading = false;
      })

      // Approval Queue
      .addCase(fetchApprovalQueueThunk.pending, (state) => {
        if (!state.approvalLoaded) state.approvalLoading = true;
      })
      .addCase(fetchApprovalQueueThunk.fulfilled, (state, action) => {
        state.approvalQueue = action.payload;
        state.approvalLoading = false;
        state.approvalLoaded = true;
      })
      .addCase(fetchApprovalQueueThunk.rejected, (state) => {
        state.approvalLoading = false;
      })

      // KYC Users
      .addCase(fetchKycUsersThunk.pending, (state) => {
        if (!state.kycLoaded) state.kycLoading = true;
      })
      .addCase(fetchKycUsersThunk.fulfilled, (state, action) => {
        state.kycUsers = action.payload;
        state.kycLoading = false;
        state.kycLoaded = true;
      })
      .addCase(fetchKycUsersThunk.rejected, (state) => {
        state.kycLoading = false;
      })

      // Categories
      .addCase(fetchCategoriesThunk.pending, (state) => {
        if (!state.categoriesLoaded) state.categoriesLoading = true;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesLoading = false;
        state.categoriesLoaded = true;
      })
      .addCase(fetchCategoriesThunk.rejected, (state) => {
        state.categoriesLoading = false;
      });
  }
});

export const {
  updateApprovalStatusInStore,
  updateKycStatusInStore,
  addCategoryToStore,
  updateCategoryInStore,
  deleteCategoryFromStore,
  invalidateAdminState
} = adminSlice.actions;

export default adminSlice.reducer;
