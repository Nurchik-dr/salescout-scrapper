import { API_URL } from '../config/config';
import { toaster } from '../ui/toaster/toaster';
import { getRequest, postRequest } from './request';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const createSearchTasks = async (hotWords: string[]) => {
  try {
    const res = await postRequest(`${API_URL}/api/search/tasks`, { hotWords });
    return res;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Ошибка при создании задачи поиска';
    toaster.error(errorMessage);
    throw error;
  }
};

export const createSearchTaskThunk = createAsyncThunk(
  'createSearchTaskThunk',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const url = `${API_URL}/api/search/tasks`;
      const data = await postRequest(url, { companyId });
      return data.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

export const getSearchTask = async (companyId: string) => {
  try {
    const res = await getRequest(`${API_URL}/api/search/tasks/${companyId}`);
    return res;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Ошибка при создании задачи поиска';
    toaster.error(errorMessage);
    throw error;
  }
};
