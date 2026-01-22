import compose from 'compose-function';
import { withRouter } from './with-router';

/**
 * Композиция всех провайдеров приложения
 * Объединяет все HOC (Higher Order Components) провайдеров в один
 * @type {Function} Функция-композиция провайдеров
 */
export const withProviders: Function = compose(withRouter);
