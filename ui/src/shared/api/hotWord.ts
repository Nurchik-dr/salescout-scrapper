import { API_URL } from '../config/config';
import { patchRequest } from './request';

export const changeHotWord = (body: any) => {
  const url = `${API_URL}/api/user/hot-word`;

  return patchRequest(url, body);
};
