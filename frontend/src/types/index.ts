export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  isArchived: boolean;
  isPublic: boolean;
  shareId?: string;
  aiSummary?: string;
  aiActionItems?: string[];
  aiSuggestedTitle?: string;
  aiUsageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIResult {
  summary: string;
  actionItems: string[];
  suggestedTitle: string;
}

export interface InsightsData {
  totalNotes: number;
  archivedNotes: number;
  recentNotes: Pick<Note, '_id' | 'title' | 'updatedAt' | 'tags'>[];
  weeklyActivity: number;
  dailyActivity: { date: string; count: number }[];
  topTags: { tag: string; count: number }[];
  aiUsageTotal: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export type Theme = 'light' | 'dark';
