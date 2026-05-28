export interface User {
  id: string;
  phone: string;
  name: string;
  username: string;
  bio: string;
  city: string;
  avatar_tone: '1' | '2' | '3' | '4' | '5';
  verified: boolean;
  created_at: Date;
}

export interface Event {
  id: string;
  title: string;
  cat: string;
  club_id: string;
  club_name: string;
  date: string;
  time: string;
  place: string;
  capacity: number | null;
  count: number;
  photo: string | null;
  is_live: boolean;
  free: boolean;
  created_by: string;
  created_at: Date;
}

export interface Club {
  id: string;
  name: string;
  cat: string;
  photo: string | null;
  description: string;
  city: string;
  member_count: number;
  created_by: string;
  created_at: Date;
}

export interface WallPost {
  id: string;
  club_id: string;
  author_id: string;
  text: string;
  is_announcement: boolean;
  has_photo: boolean;
  created_at: Date;
}

