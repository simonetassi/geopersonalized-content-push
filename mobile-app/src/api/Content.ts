import { api } from './client';

export const getContentProxyUrl = (contentId: string): string => {
  const baseUrl = api.defaults.baseURL;
  return `${baseUrl}/content-meta/content/${contentId}`;
};
