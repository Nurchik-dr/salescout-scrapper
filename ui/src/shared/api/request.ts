import axios from 'axios';

/**
 * Выполняет GET-запрос к API
 * Автоматически добавляет токен авторизации в заголовки
 * При ошибке 403 удаляет токен и перезагружает страницу
 * @param {string} url - URL для запроса
 * @param {object} options - Дополнительные опции запроса
 * @returns {Promise} Promise с результатом запроса
 */
export const getRequest = async (url: string, options: object = {}) => {
  try {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      ...options,
    });
  } catch (err: any) {
    if (err?.response?.status === 403) {
      localStorage.removeItem('access_token');
      window.location.reload();
    }
    throw err;
  }
};

/**
 * Выполняет POST-запрос к API
 * Автоматически добавляет токен авторизации в заголовки
 * При ошибке 403 удаляет токен и перезагружает страницу
 * @param {string} url - URL для запроса
 * @param {any} body - Тело запроса
 * @param {object} options - Дополнительные опции запроса
 * @returns {Promise} Promise с результатом запроса
 */
export const postRequest = (url: string, body: any = {}, options: object = {}) => {
  return axios
    .post(url, body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      ...options,
    })
    .catch((err) => {
      if (err?.response?.status === 403 && url != 'https://api.salescout.me/api/auth/login') {
        localStorage.removeItem('access_token');

        window.location.reload();
      }

      throw err;
    });
};

/**
 * Выполняет PATCH-запрос к API
 * Автоматически добавляет токен авторизации в заголовки
 * При ошибке 403 удаляет токен и перезагружает страницу
 * @param {string} url - URL для запроса
 * @param {any} body - Тело запроса
 * @param {object} options - Дополнительные опции запроса
 * @returns {Promise} Promise с результатом запроса
 */
export const patchRequest = (url: string, body: any = {}, options: object = {}) => {
  return axios
    .patch(url, body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      ...options,
    })
    .catch((err) => {
      if (err?.response?.status === 403) {
        localStorage.removeItem('access_token');

        window.location.reload();
      }

      throw err;
    });
};

/**
 * Выполняет PUT-запрос к API
 * Автоматически добавляет токен авторизации в заголовки
 * При ошибке 403 удаляет токен и перезагружает страницу
 * @param {string} url - URL для запроса
 * @param {any} body - Тело запроса
 * @param {object} options - Дополнительные опции запроса
 * @returns {Promise} Promise с результатом запроса
 */
export const putRequest = (url: string, body: any = {}, options: object = {}) => {
  return axios
    .put(url, body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      ...options,
    })
    .catch((err) => {
      if (err?.response?.status === 403) {
        localStorage.removeItem('access_token');

        window.location.reload();
      }

      throw err;
    });
};

/**
 * Выполняет DELETE-запрос к API
 * Автоматически добавляет токен авторизации в заголовки
 * При ошибке 403 удаляет токен и перезагружает страницу
 * @param {string} url - URL для запроса
 * @param {object} options - Дополнительные опции запроса
 * @returns {Promise} Promise с результатом запроса
 */
export const deleteRequest = (url: string, options: object = {}) => {
  return axios
    .delete(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      ...options,
    })
    .catch((err) => {
      if (err?.response?.status === 403) {
        localStorage.removeItem('access_token');

        window.location.reload();
      }

      throw err;
    });
};
