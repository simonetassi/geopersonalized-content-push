import { Event, EventPayload } from '@/interfaces';
import { api } from './client';

export const createEvent = async (payload: EventPayload): Promise<Event> => {
  try {
    const response = await api.post<Event>('/events', payload);
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
