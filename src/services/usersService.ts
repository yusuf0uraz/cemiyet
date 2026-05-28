import { apiClient } from './apiClient';

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  bio: string;
  city: string;
  avatar_tone: string;
  avatar_url?: string;
  verified: boolean;
  follower_count: number;
  following_count: number;
  event_count: number;
  club_count: number;
}

export const usersService = {
  getProfile: async (userId: string): Promise<PublicUser> => {
    const { data } = await apiClient.get<PublicUser>(`/users/${userId}`);
    return data;
  },

  getEvents: async (userId: string): Promise<Array<{ id: string; title: string; cat: string; date: string; time: string; place: string; club_name: string }>> => {
    const { data } = await apiClient.get(`/users/${userId}/events`);
    return data;
  },
};
