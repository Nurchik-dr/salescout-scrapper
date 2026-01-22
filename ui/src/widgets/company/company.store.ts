import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../../app/store/store';
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
} from '../../shared/api/company';
import { clearTasks } from '../searchTasks/searchTaskStore';

// Получение всех компаний
export const getAllCompaniesThunk = createAsyncThunk(
  'company/getAllCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const companies = await getAllCompanies();
      return companies;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Ошибка при получении компаний' });
    }
  },
);

// Создание компании
export const createCompanyThunk = createAsyncThunk<
  Company,
  CreateCompanyDto,
  { dispatch: AppDispatch }
>('company/createCompany', async (dto, { dispatch, rejectWithValue }) => {
  try {
    const company = await createCompany(dto);
    // После создания обновляем список всех компаний
    await dispatch(getAllCompaniesThunk());
    return company;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: 'Ошибка при создании компании' });
  }
});

// Обновление компании
export const updateCompanyThunk = createAsyncThunk<
  Company,
  { companyId: string; dto: UpdateCompanyDto },
  { dispatch: AppDispatch }
>('company/updateCompany', async ({ companyId, dto }, { dispatch, rejectWithValue }) => {
  try {
    const company = await updateCompany(companyId, dto);
    // После обновления обновляем список всех компаний
    await dispatch(getAllCompaniesThunk());
    dispatch(clearTasks())
    return company;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: 'Ошибка при обновлении компании' });
  }
});

// Удаление компании
export const deleteCompanyThunk = createAsyncThunk<
  string,
  string,
  { dispatch: AppDispatch }
>('company/deleteCompany', async (companyId, { dispatch, rejectWithValue }) => {
  try {
    await deleteCompany(companyId);
    // После удаления обновляем список всех компаний
    await dispatch(getAllCompaniesThunk());
    return companyId;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: 'Ошибка при удалении компании' });
  }
});

interface IState {
  allCompanies: Company[];
  loading: boolean;
  error: boolean;
}

const initialState: IState = {
  allCompanies: [],
  loading: false,
  error: false,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Получение всех компаний
    builder.addCase(getAllCompaniesThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getAllCompaniesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.allCompanies = action.payload;
    });
    builder.addCase(getAllCompaniesThunk.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });

    // Создание компании
    builder.addCase(createCompanyThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(createCompanyThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
    });
    builder.addCase(createCompanyThunk.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });

    // Обновление компании
    builder.addCase(updateCompanyThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(updateCompanyThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
    });
    builder.addCase(updateCompanyThunk.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });

    // Удаление компании
    builder.addCase(deleteCompanyThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(deleteCompanyThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
    });
    builder.addCase(deleteCompanyThunk.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });
  },
});

export const companyActions = companySlice.actions;
export const companyReducer = companySlice.reducer;
