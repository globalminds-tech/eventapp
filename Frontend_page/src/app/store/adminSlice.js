import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStats } from "@/shared/services/eventService";
import { approvalApi } from "@/features/admin/approvals/api/approval.api";
import { kycApi } from "@/features/admin/kyc/api/kyc.api";
import { userApi } from "@/features/users/api/user.api";
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
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const isForce = typeof params === "boolean" ? params : Boolean(params?.force);
      const queryParams = typeof params === "object" && !Array.isArray(params) ? { ...params } : {};
      delete queryParams.force;

      const hasCustomQuery = Boolean(queryParams.search || queryParams.status || queryParams.page);

      const state = getState();
      if (!isForce && !hasCustomQuery && state.admin?.approvalLoaded && Array.isArray(state.admin?.approvalQueue)) {
        return {
          data: state.admin.approvalQueue,
          pagination: state.admin.approvalPagination || null
        };
      }

      const res = await approvalApi.getEvents(queryParams);
      return {
        data: ensureArray(res),
        pagination: res?.pagination || null
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch approval queue");
    }
  }
);

// 3. KYC Verification Users Thunk
export const fetchKycUsersThunk = createAsyncThunk(
  "admin/fetchKycUsers",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const isForce = typeof params === "boolean" ? params : Boolean(params?.force);
      const queryParams = typeof params === "object" && !Array.isArray(params) ? { ...params } : {};
      delete queryParams.force;

      const hasCustomQuery = Boolean(queryParams.search || queryParams.role || queryParams.kyc_status || queryParams.page);

      const state = getState();
      if (!isForce && !hasCustomQuery && state.admin?.kycLoaded && Array.isArray(state.admin?.kycUsers)) {
        return {
          data: state.admin.kycUsers,
          pagination: state.admin.kycPagination || null
        };
      }

      const res = await userApi.getUsers(queryParams);
      return {
        data: ensureArray(res),
        pagination: res?.pagination || null
      };
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
      if (!force && state.admin?.categoriesLoaded && Array.isArray(state.admin?.categories)) {
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
    approvalPagination: null,
    approvalLoading: false,
    approvalLoaded: false,

    kycUsers: [],
    kycPagination: null,
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
      const evt = state.approvalQueue.find(
        (e) => String(e.id) === String(eventId) || String(e.event_code) === String(eventId) || String(e.code) === String(eventId)
      );
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
        state.approvalLoading = true;
      })
      .addCase(fetchApprovalQueueThunk.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.data !== undefined) {
          state.approvalQueue = payload.data;
          state.approvalPagination = payload.pagination || null;
        } else {
          state.approvalQueue = payload || [];
          state.approvalPagination = null;
        }
        state.approvalLoading = false;
        state.approvalLoaded = true;
      })
      .addCase(fetchApprovalQueueThunk.rejected, (state) => {
        state.approvalLoading = false;
      })

      // KYC Users
      .addCase(fetchKycUsersThunk.pending, (state) => {
        state.kycLoading = true;
      })
      .addCase(fetchKycUsersThunk.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.data !== undefined) {
          state.kycUsers = payload.data;
          state.kycPagination = payload.pagination || null;
        } else {
          state.kycUsers = payload || [];
          state.kycPagination = null;
        }
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
