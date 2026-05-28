import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';
import type { ClubItem } from '../store/clubsStore';

export interface CreateClubPayload {
  name: string;
  cat: string;
  description?: string;
  city?: string;
  photo?: string;
}

export interface WallPost {
  id: string;
  club_id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_tone: string;
  text: string;
  is_announcement: boolean;
  has_photo: boolean;
  reactions: { bravo: number; geliyorum: number; super: number; tebrik: number };
  created_at: string;
}

export interface ClubMember {
  id: string;
  name: string;
  username: string;
  avatar_tone: string;
  verified: boolean;
  role: 'reis' | 'yardimci' | 'aza';
  joined_at: string;
}

export const clubsService = {
  async getClubs(params?: { cat?: string }): Promise<ClubItem[]> {
    const { data } = await apiClient.get<ClubItem[]>(ENDPOINTS.clubs.list, { params });
    return data;
  },

  async getClub(id: string): Promise<ClubItem> {
    const { data } = await apiClient.get<ClubItem>(ENDPOINTS.clubs.detail(id));
    return data;
  },

  async createClub(payload: CreateClubPayload): Promise<ClubItem> {
    const { data } = await apiClient.post<ClubItem>(ENDPOINTS.clubs.create, payload);
    return data;
  },

  async joinClub(id: string, applicationNote?: string): Promise<{ joined: boolean; status?: string; message?: string }> {
    const { data } = await apiClient.post(ENDPOINTS.clubs.join(id), { application_note: applicationNote ?? '' });
    return data;
  },

  async leaveClub(id: string): Promise<{ joined: boolean }> {
    const { data } = await apiClient.delete(ENDPOINTS.clubs.leave(id));
    return data;
  },

  async getWall(clubId: string, params?: { limit?: number; offset?: number }): Promise<WallPost[]> {
    const { data } = await apiClient.get<WallPost[]>(ENDPOINTS.clubs.wall(clubId), { params });
    return data;
  },

  async postToWall(clubId: string, text: string, is_announcement = false): Promise<WallPost> {
    const { data } = await apiClient.post<WallPost>(ENDPOINTS.clubs.wall(clubId), { text, is_announcement });
    return data;
  },

  async reactToPost(clubId: string, postId: string, type: string): Promise<{ reacted: boolean; type: string }> {
    const { data } = await apiClient.post(ENDPOINTS.clubs.react(clubId, postId), { type });
    return data;
  },

  async getMembers(clubId: string): Promise<ClubMember[]> {
    const { data } = await apiClient.get<ClubMember[]>(ENDPOINTS.clubs.members(clubId));
    return data;
  },
};
