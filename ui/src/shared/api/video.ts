import { API_URL } from '../config/config';
import { getRequest } from './request';

export interface VideoQueryParams {
  searchTaskId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'views' | 'likes' | 'viralScore' | 'publishedAt';
  order?: 'asc' | 'desc';
  companyId: string;
}

export interface VideosResponse {
  videos: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getVideosWithPagination = async (params: VideoQueryParams): Promise<VideosResponse> => {
  const queryParams = new URLSearchParams();

  queryParams.append('companyId', params.companyId);
  if (params.searchTaskId) queryParams.append('searchTaskId', params.searchTaskId);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.order) queryParams.append('order', params.order);

  const url = `${API_URL}/api/video?${queryParams.toString()}`;
  const response = await getRequest(url);
  return response.data;
};

// Старый метод для обратной совместимости
export const getVideosByTaskId = async (searchTaskId: string, companyId: string) => {
  return getVideosWithPagination({ searchTaskId, companyId });
};
