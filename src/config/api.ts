import Constants from 'expo-constants';

function getDevApiUrl(): string {
  const hostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000/api`;
    }
  }
  return 'http://192.168.1.27:3000/api';
}

export const API_BASE_URL = __DEV__ ? getDevApiUrl() : 'https://api.cemiapp.com/api';
export const API_TIMEOUT = 12000;

export const ENDPOINTS = {
  auth: {
    sendCode:        '/auth/send-code',
    verify:          '/auth/verify',
    firebaseVerify:  '/auth/firebase-verify',
    register:        '/auth/register',
    logout:          '/auth/logout',
    me:              '/auth/me',
    update:          '/auth/me',
    checkUsername:   (username: string) => `/auth/check-username/${username}`,
  },
  upload: {
    avatar: '/upload/avatar',
    event:  '/upload/event',
    club:   '/upload/club',
  },
  events: {
    list:        '/events',
    detail:      (id: string) => `/events/${id}`,
    create:      '/events',
    join:        (id: string) => `/events/${id}/join`,
    leave:       (id: string) => `/events/${id}/join`,
    bookmark:    (id: string) => `/events/${id}/bookmark`,
    myBookmarks: '/events/me/bookmarks',
    myJoined:    '/events/me/joined',
  },
  clubs: {
    list:           '/clubs',
    detail:         (id: string) => `/clubs/${id}`,
    create:         '/clubs',
    join:           (id: string) => `/clubs/${id}/join`,
    leave:          (id: string) => `/clubs/${id}/join`,
    wall:           (id: string) => `/clubs/${id}/wall`,
    react:          (id: string, postId: string) => `/clubs/${id}/wall/${postId}/react`,
    members:        (id: string) => `/clubs/${id}/members`,
    joinRequests:   (id: string) => `/clubs/${id}/join-requests`,
    approveRequest: (id: string, reqId: string) => `/clubs/${id}/join-requests/${reqId}/approve`,
    rejectRequest:  (id: string, reqId: string) => `/clubs/${id}/join-requests/${reqId}/reject`,
  },
  users: {
    profile:   (id: string) => `/users/${id}`,
    events:    (id: string) => `/users/${id}/events`,
    interests: '/users/interests',
  },
  follows: {
    toggle:  (id: string) => `/follows/${id}`,
    status:  (id: string) => `/follows/${id}/status`,
    counts:  (id: string) => `/follows/${id}/counts`,
  },
};
