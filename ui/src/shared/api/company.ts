import { API_URL } from '../config/config';
import { getRequest, postRequest, putRequest, deleteRequest } from './request';

export interface Company {
  _id: string;
  title: string;
  description: string;
  hotWords: string[];
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  title: string;
  hotWords: string[];
  isActive: boolean;
}

export interface UpdateCompanyDto {
  title?: string;
  hotWords?: string[];
  isActive?: boolean;
}

export const getAllCompanies = async (): Promise<Company[]> => {
  const url = `${API_URL}/api/company`;
  const response = await getRequest(url);
  return response.data;
};

export const getActiveCompany = async (): Promise<Company | null> => {
  const url = `${API_URL}/api/company/active`;
  const response = await getRequest(url);
  return response.data;
};

export const createCompany = async (dto: CreateCompanyDto): Promise<Company> => {
  const url = `${API_URL}/api/company`;
  const response = await postRequest(url, dto);
  return response.data;
};

export const updateCompany = async (
  companyId: string,
  dto: UpdateCompanyDto,
): Promise<Company> => {
  const url = `${API_URL}/api/company/${companyId}`;
  const response = await putRequest(url, dto);
  return response.data;
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  const url = `${API_URL}/api/company/${companyId}`;
  await deleteRequest(url);
};
