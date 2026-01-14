import { RegisterPayload, User } from '@/interfaces';
import { api } from './client';

export const loginUser = async (username: string, password: string): Promise<User> => {
  try {
    const response = await api.post<User>('/users/login', {
      username,
      password,
    });

    return response.data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const registerUser = async (payload: RegisterPayload): Promise<User> => {
  try {
    const response = await api.post<User>('/users', payload);
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
