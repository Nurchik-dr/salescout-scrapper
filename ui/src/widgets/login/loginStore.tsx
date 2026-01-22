import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch } from '../../app/store/store';
import { getUserDataThunk, login } from '../../shared/api/login';

/**
 * Интерфейс состояния авторизации
 * @property {string} phone - Номер телефона пользователя
 * @property {string} password - Пароль пользователя
 * @property {boolean} loading - Флаг загрузки
 * @property {boolean} error - Флаг наличия ошибки
 * @property {string} errorMessage - Сообщение об ошибке
 */
interface ILoginState {
  phoneNumber: string;
  password: string;
  loading: boolean;
  error: boolean;
  errorMessage: any;
}

/**
 * Начальное состояние авторизации
 */
const initialState: ILoginState = {
  phoneNumber: '',
  password: '',
  loading: false,
  error: false,
  errorMessage: '',
};

/**
 * Асинхронное действие для авторизации пользователя
 * Отправляет запрос на сервер и обрабатывает ответ
 * @param {Object} params - Параметры авторизации
 * @param {string} params.phone - Номер телефона
 * @param {string} params.password - Пароль
 * @returns {Promise<void>} Promise с результатом авторизации
 */
export const loginThunk = createAsyncThunk<
  void,
  { phoneNumber: string; password: string },
  { dispatch: AppDispatch }
>('login/login', async ({ phoneNumber, password }, { dispatch, rejectWithValue }) => {
  try {
    await login({ phoneNumber, password });

    await dispatch(getUserDataThunk()).unwrap();
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: 'Неизвестная ошибка...' });
  }
});

/**
 * Слайс для управления состоянием авторизации
 * Содержит редьюсеры для обновления состояния
 */
const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(loginThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = false;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.errorMessage = action.payload;
    });
  },
});

export const loginReducer = loginSlice.reducer;
