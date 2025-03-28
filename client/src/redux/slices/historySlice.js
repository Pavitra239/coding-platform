import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { logout } from "../userSlice";

export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async ({ page = 1, limit = 9 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/submissions/user/submissions",
        {
          params: { page, limit },
        }
      );

      return {
        history: response.data.submissions || [],
        totalPages: response.data.totalPages || 1,
        currentPage: page,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load submission history. Please try again."
      );
    }
  }
);

const historySlice = createSlice({
  name: "history",
  initialState: {
    history: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    clearHistory(state) {
      state.history = [];
      state.loading = false;
      state.error = null;
      state.currentPage = 1;
      state.totalPages = 1;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    logoutHistory: (state) => {
      state.history = [];
      state.loading = false;
      state.error = null;
      state.currentPage = 1;
      state.totalPages = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.history;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred.";
      });
  },
});

export const { clearHistory, setCurrentPage,logoutHistory } = historySlice.actions;
export default historySlice.reducer;
