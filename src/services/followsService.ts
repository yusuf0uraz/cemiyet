import { apiClient } from './apiClient';

export const followsService = {
  toggle: async (userId: string): Promise<{ following: boolean }> => {
    const { data } = await apiClient.post(`/follows/${userId}`);
    return data;
  },

  getStatus: async (userId: string): Promise<{ following: boolean }> => {
    const { data } = await apiClient.get(`/follows/${userId}/status`);
    return data;
  },

  getCounts: async (userId: string): Promise<{ followers: number; following: number }> => {
    const { data } = await apiClient.get(`/follows/${userId}/counts`);
    return data;
  },
};
