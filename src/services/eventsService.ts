import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';
import type { FeedEvent } from '../store/eventsStore';

export interface CreateEventPayload {
  title: string;
  cat: string;
  club_id?: string;
  club_name: string;
  date: string;
  time: string;
  place: string;
  capacity?: number;
  photo?: string;
  free?: boolean;
}

export const eventsService = {
  async getEvents(params?: { cat?: string; live?: boolean; club_id?: string; q?: string }): Promise<FeedEvent[]> {
    const { data } = await apiClient.get<FeedEvent[]>(ENDPOINTS.events.list, { params });
    return data;
  },

  async getEvent(id: string): Promise<FeedEvent> {
    const { data } = await apiClient.get<FeedEvent>(ENDPOINTS.events.detail(id));
    return data;
  },

  async createEvent(payload: CreateEventPayload): Promise<FeedEvent> {
    const { data } = await apiClient.post<FeedEvent>(ENDPOINTS.events.create, payload);
    return data;
  },

  async joinEvent(id: string): Promise<{ joined: boolean; count: number }> {
    const { data } = await apiClient.post(ENDPOINTS.events.join(id));
    return data;
  },

  async leaveEvent(id: string): Promise<{ joined: boolean; count: number }> {
    const { data } = await apiClient.delete(ENDPOINTS.events.leave(id));
    return data;
  },

  async toggleBookmark(id: string): Promise<{ bookmarked: boolean }> {
    const { data } = await apiClient.post(ENDPOINTS.events.bookmark(id));
    return data;
  },

  async getMyBookmarks(): Promise<FeedEvent[]> {
    const { data } = await apiClient.get<FeedEvent[]>(ENDPOINTS.events.myBookmarks);
    return data;
  },

  async getMyJoined(): Promise<FeedEvent[]> {
    const { data } = await apiClient.get<FeedEvent[]>(ENDPOINTS.events.myJoined);
    return data;
  },
};
