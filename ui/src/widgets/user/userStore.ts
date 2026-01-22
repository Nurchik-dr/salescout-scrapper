import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getUserDataThunk } from '../../shared/api/login';
import { RootState } from '../../app/store/store';
import { getAllCompaniesThunk } from '../company/company.store';

export class UserStore {
  _id!: string;
  phoneNumber!: string;
  role!: string;
}

interface UserState {
  isAuthenticated: boolean;
  user: UserStore | null;
  loading: boolean;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

export const checkAuthThunk = createAsyncThunk(
  'user/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const user = await dispatch(getUserDataThunk()).unwrap();
        // После успешной авторизации загружаем все компании
        await dispatch(getAllCompaniesThunk());
        return user;
      } catch (e) {
        return rejectWithValue(e);
      }
    } else {
      return rejectWithValue('No token found');
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('access_token');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserDataThunk.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
    });
    builder.addCase(getUserDataThunk.pending, (state) => {
      state.isAuthenticated = false;
      state.loading = true;
    });
    builder.addCase(getUserDataThunk.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    });
  },
});

export const selectUserId = (state: RootState) => state.user.user?._id;
export const { logout } = userSlice.actions;
export const userReducer = userSlice.reducer;
