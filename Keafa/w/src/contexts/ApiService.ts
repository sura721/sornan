import api from '@/lib/api';
import { Individual, Family, User } from './DataContext';

type FamilyPayload = Omit<Family, 'id' | '_id' | 'memberIds'> & {
  memberIds: Omit<Individual, 'id' | '_id'>[];
};

export const loginUserApi = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const fetchUsersApi = async (): Promise<User[]> => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const addUserApi = async (username: string, password: string): Promise<User> => {
  const response = await api.post('/auth/add', { username, password });
  return response.data;
};

export const deleteUserApi = async (userId: string): Promise<void> => {
  await api.delete(`/auth/${userId}`);
};

export const fetchIndividualsApi = async (): Promise<Individual[]> => {
  const response = await api.get('/orders/individuals');
  return response.data;
};

export const fetchFamiliesApi = async (): Promise<Family[]> => {
  const response = await api.get('/orders/families');
  return response.data;
};

export const addIndividualApi = async (individualData: FormData): Promise<Individual> => {
  const response = await api.post('/orders/individuals', individualData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
export const addFamilyApi = async (familyData: FamilyPayload | FormData): Promise<Family> => {
  // Check if we are sending a file (FormData) or just JSON
  const headers = familyData instanceof FormData 
    ? { 'Content-Type': 'multipart/form-data' }
    : { 'Content-Type': 'application/json' };
  
  const response = await api.post('/orders/families', familyData, { headers });
  return response.data;
}

export const deleteIndividualApi = async (id: string): Promise<void> => {
  await api.delete(`/orders/individuals/${id}`);
};

export const deleteFamilyApi = async (id: string): Promise<void> => {
  await api.delete(`/orders/families/${id}`);
};

export const updateIndividualApi = async (individual: Individual): Promise<Individual> => {
  const response = await api.put(`/orders/individuals/${individual._id}`, individual);
  return response.data;
};

export const updateFamilyApi = async (family: Family): Promise<Family> => {
  // const response = await api.put(`/orders/families/${family._id}`, family);
  const response = await api.put(`/orders/families/${family._id}`, family);
  return response.data;
};

export const searchOrdersApi = async (query: string, type: 'name' | 'phone') => {
  const response = await api.get(`/orders/search?q=${query}&type=${type}`);
  return response.data;
};