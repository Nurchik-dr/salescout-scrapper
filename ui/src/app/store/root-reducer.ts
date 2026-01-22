import { userReducer } from '../../widgets/user/userStore';
import { searchTasksReducer } from '../../widgets/searchTasks/searchTaskStore';
import { repeatReducer } from '../../widgets/repeat/repeat';
import { companyReducer } from '../../widgets/company/company.store';

/**
 * Корневой редьюсер Redux store
 * Объединяет все редьюсеры приложения в один объект
 * Каждый ключ соответствует определенному слайсу состояния
 * @type {Object} Объект с редьюсерами для каждого слайса состояния
 */

export const rootReducer = {
  user: userReducer,
  searchTasks: searchTasksReducer,
  repeat: repeatReducer,
  company: companyReducer,
};
