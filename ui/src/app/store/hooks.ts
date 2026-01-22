import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { AppDispatch, RootState } from './store';

/**
 * Типизированный хук для диспетчеризации действий Redux
 * Используется вместо стандартного useDispatch для типизации
 * @returns {AppDispatch} Типизированная функция диспетчеризации
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Типизированный хук для выбора данных из Redux store
 * Используется вместо стандартного useSelector для типизации
 * @returns {TypedUseSelectorHook<RootState>} Типизированный хук выбора данных
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
