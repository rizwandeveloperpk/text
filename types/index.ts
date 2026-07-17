export type Plan = 'free' | 'pro';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  plan: Plan;
  freeUsed: number;
  credits: number;
}

export interface Conversion {
  id: string;
  userId: string | null; // null for guest, kept client-side only
  imageUrl: string;
  extractedText: string;
  words: number;
  characters: number;
  favorite: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  currentPlan: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'none';
}

export interface OcrResult {
  text: string;
  words: number;
  characters: number;
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export interface GuestUsage {
  count: number;
}

export interface ContactMessage {
  id: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
