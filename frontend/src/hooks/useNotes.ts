import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Note, InsightsData, ApiResponse } from '../types';

export const NOTES_KEY = 'notes';

interface NotesFilters {
  search?: string;
  tags?: string;
  category?: string;
  archived?: boolean;
  sort?: string;
}

export const useNotes = (filters: NotesFilters = {}) => {
  return useQuery({
    queryKey: [NOTES_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.tags) params.set('tags', filters.tags);
      if (filters.category) params.set('category', filters.category);
      if (filters.archived !== undefined) params.set('archived', String(filters.archived));
      if (filters.sort) params.set('sort', filters.sort);
      const res = await api.get<ApiResponse<Note[]>>(`/notes?${params.toString()}`);
      return res.data;
    },
  });
};

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Note>) => api.post('/notes', data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
    onError: () => toast.error('Failed to create note'),
  });
};

export const useUpdateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) =>
      api.patch(`/notes/${id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
    onError: () => toast.error('Failed to save note'),
  });
};

export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });
};

export const useGenerateSummary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/notes/${id}/generate-summary`).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      toast.success('AI summary generated!');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'AI generation failed';
      toast.error(msg);
    },
  });
};

export const useToggleShare = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/notes/${id}/toggle-share`).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
};

export const useInsights = () => {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<InsightsData>>('/notes/meta/insights');
      return res.data.data;
    },
  });
};

export const useSharedNote = (shareId: string) => {
  return useQuery({
    queryKey: ['shared', shareId],
    queryFn: async () => {
      const res = await api.get(`/notes/shared/${shareId}`);
      return res.data.data as Note & { userId: { name: string } };
    },
    enabled: !!shareId,
    retry: false,
  });
};
