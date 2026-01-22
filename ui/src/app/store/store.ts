import { type Action, type ThunkAction, configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './root-reducer';

import { combineReducers } from '@reduxjs/toolkit';
import { checkAuthThunk } from '../../widgets/user/userStore';

const combinedReducer = combineReducers(rootReducer);

/**
 * Конфигурация Redux store приложения
 * Настраивает корневой редьюсер и middleware
 * Отключает проверки иммутабельности и сериализации для оптимизации производительности
 */
export const store = configureStore({
  reducer: combinedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
store.dispatch(checkAuthThunk());

/**
 * Тип корневого состояния Redux store
 * Представляет собой тип возвращаемого значения функции getState
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Тип диспетчера Redux store
 * Представляет собой тип функции dispatch
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Тип для асинхронных действий Redux (thunks)
 * @template ReturnType - Тип возвращаемого значения thunk'а
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
