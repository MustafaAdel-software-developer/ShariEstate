import type { UserRole, ListingType, PropertyType, ListingStatus, ListingSource } from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface State {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  enabled: boolean;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  stateId: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  cityId: string;
}

export interface ListingImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
  isCover: boolean;
}

export interface AgentProfile {
  id: string;
  userId: string;
  slug: string;
  bio?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  photoUrl?: string | null;
  brokerageId?: string | null;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
  brokerage?: Brokerage;
}

export interface Brokerage {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: ListingStatus;
  source: ListingSource;
  price: number;
  beds: number;
  baths: number;
  sqft?: number | null;
  yearBuilt?: number | null;
  address: string;
  zip: string;
  lat?: number | null;
  lng?: number | null;
  isFeatured: boolean;
  viewCount: number;
  stateId: string;
  cityId: string;
  neighborhoodId?: string | null;
  agentId?: string | null;
  state?: State;
  city?: City;
  neighborhood?: Neighborhood | null;
  images?: ListingImage[];
  features?: string[];
  agent?: AgentProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Inquiry {
  id: string;
  listingId: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  emailAlerts: boolean;
  createdAt: string;
}

export interface TourRequest {
  id: string;
  listingId: string;
  name: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  listingId: string;
  senderId: string;
  recipientId: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface Conversation {
  listingId: string;
  listing?: Pick<Listing, 'id' | 'title' | 'address'>;
  otherUser?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  lastMessage?: Message;
  unreadCount: number;
}
