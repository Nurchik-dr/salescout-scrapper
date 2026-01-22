import { getRequest, postRequest, patchRequest } from './request';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../config/config';
import { IUser } from '../../widgets/user/user.type';

export const login = async (body: any): Promise<any> => {
  const url = `${API_URL}/api/auth/login`;
  const data = await postRequest(url, body);
  console.log('data.data?.access_token', data.data?.access_token);
  const accessToken = data.data?.access_token || '';
  localStorage.setItem('access_token', accessToken);
  return data;
};

export const getUserDataThunk = createAsyncThunk(
  'getUserDataThunk',
  async (_: undefined, { rejectWithValue }) => {
    try {
      const url = `${API_URL}/api/user/profile`;
      const data = await getRequest(url);

      const user: IUser = {
        _id: data.data._id,
        phoneNumber: data.data.phoneNumber,
        role: data.data.role,
      };

      return user;
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

export const registration = (body: any) => {
  const url = `${API_URL}/api/auth/registration`;

  return postRequest(url, body);
};

export const verification = (body: any) => {
  const url = `${API_URL}/api/auth/verify-code`;

  return postRequest(url, body);
};

export const setPasswordRequest = (body: any) => {
  const url = `${API_URL}/api/auth/set-password`;

  return postRequest(url, body);
};

export const resetPassword = (body: any) => {
  const url = `${API_URL}/api/auth/reset`;

  return postRequest(url, body);
};

export const updateHotWord = async (hotWord: string[]) => {
  const url = `${API_URL}/api/user/profile`;
  const body = { hotWord };
  
  return patchRequest(url, body);
};
