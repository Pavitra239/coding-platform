import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchSubmissions = createAsyncThunk(
  "submissions/fetchSubmissions",
  async ({ page = 1, limit = 7 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/submissions/user/submissions",
        {
          params: { page, limit },
        }
      );
      const submissions = response.data.submissions || [];
      const sortedSubmissions = submissions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      return { submissions: sortedSubmissions };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load submissions. Please try again."
      );
    }
  }
);

const submissionSlice = createSlice({
  name: "submissions",
  initialState: {
    submissions: [],
    loading: false,
    error: null,
    selectedSubmission: null,
  },
  reducers: {
    setSelectedSubmission(state, action) {
      state.selectedSubmission = action.payload;
    },
    clearSubmissions(state) {
      state.submissions = [];
      state.loading = false;
      state.error = null;
      state.selectedSubmission = null;
    },
    addSubmission(state, action) {
      state.submissions.unshift(action.payload);
      state.selectedSubmission = action.payload;
    },
    logoutSubmissions: (state) => {
      state.submissions = [];
      state.loading = false;
      state.error = null;
      state.selectedSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload.submissions;
        state.selectedSubmission =
          action.payload.submissions.length > 0
            ? action.payload.submissions[0]
            : null;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred.";
      });
  },
});

export const {
  setSelectedSubmission,
  clearSubmissions,
  addSubmission,
  logoutSubmissions,
} = submissionSlice.actions;
export default submissionSlice.reducer;
