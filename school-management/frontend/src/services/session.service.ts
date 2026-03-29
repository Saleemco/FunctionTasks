import api from './api';
import toast from 'react-hot-toast';

export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  terms?: any[];
  _count?: { terms: number };
  createdAt: string;
  updatedAt: string;
}

export const sessionService = {
  // Get all sessions
  getAll: async (): Promise<Session[]> => {
    try {
      const response = await api.get('/sessions');
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
      return [];
    }
  },

  // Get active session
  getActive: async (): Promise<Session | null> => {
    try {
      const response = await api.get('/sessions/active');
      return response.data?.data || null;
    } catch (error: any) {
      console.error('Error fetching active session:', error);
      return null;
    }
  },

  // Create a new session
  create: async (data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
    try {
      const response = await api.post('/sessions', data);
      toast.success(response.data.message || 'Session created successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.response?.data?.error || 'Failed to create session');
      throw error;
    }
  },

  // Update a session
  update: async (id: string, data: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Session> => {
    try {
      const response = await api.put(`/sessions/${id}`, data);
      toast.success(response.data.message || 'Session updated successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast.error(error.response?.data?.error || 'Failed to update session');
      throw error;
    }
  },

  // Delete a session
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/sessions/${id}`);
      toast.success('Session deleted successfully');
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast.error(error.response?.data?.error || 'Failed to delete session');
      throw error;
    }
  },

  // Archive a session
  archive: async (id: string): Promise<Session> => {
    try {
      const response = await api.post(`/sessions/${id}/archive`);
      toast.success(response.data.message || 'Session archived successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error archiving session:', error);
      toast.error('Failed to archive session');
      throw error;
    }
  },

  // Create next session
  createNext: async (currentSessionId: string): Promise<Session> => {
    try {
      const response = await api.post('/sessions/next', { currentSessionId });
      toast.success(response.data.message || 'Next session created successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating next session:', error);
      toast.error('Failed to create next session');
      throw error;
    }
  }
};

export default sessionService;