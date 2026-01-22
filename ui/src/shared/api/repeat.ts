import { API_URL } from '../config/config';
import { postRequest } from './request';

export const getOrCreateAnalysis = async (videoId: string, companyId: string) => {
  const url = `${API_URL}/api/analysis-tasks`;
  // const url = `${API_URL}/api/analyze`;
  const data = await postRequest(url, {companyId, videoId});
  console.log('Analysis received:', data);
  return data;
}