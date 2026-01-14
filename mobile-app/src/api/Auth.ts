import { RegisterPayload, User } from '@/interfaces';
import axios from 'axios';

const API_URL = 'http://192.168.1.248:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
