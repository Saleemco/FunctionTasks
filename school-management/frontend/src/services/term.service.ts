import api from './api';
import toast from 'react-hot-toast';

export interface Term {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sessionId?: string;
  session?: {
    id: string;
    name: string;
    academicYear: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const termService = {
  // Get all terms with optional session filter
  getAll: async (sessionId?: string): Promise<Term[]> => {
    try {
      const params = sessionId ? { sessionId } : {};
      const response = await api.get('/terms', { params });
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching terms:', error);
      toast.error('Failed to load terms');
      return [];
    }
  },

  // Get active term
  getActive: async (): Promise<Term | null> => {
    try {
      const response = await api.get('/terms/active');
      return response.data?.data || null;
    } catch (error: any) {
      console.error('Error fetching active term:', error);
      return null;
    }
  },

  // Create a new term
  create: async (data: Omit<Term, 'id' | 'createdAt' | 'updatedAt'>): Promise<Term> => {
    try {
      const response = await api.post('/terms', data);
      toast.success(response.data.message || 'Term created successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating term:', error);
      toast.error(error.response?.data?.error || 'Failed to create term');
      throw error;
    }
  },

  // Update a term
  update: async (id: string, data: Partial<Omit<Term, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Term> => {
    try {
      const response = await api.put(`/terms/${id}`, data);
      toast.success(response.data.message || 'Term updated successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating term:', error);
      toast.error(error.response?.data?.error || 'Failed to update term');
      throw error;
    }
  },

  // Delete a term
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/terms/${id}`);
      toast.success('Term deleted successfully');
    } catch (error: any) {
      console.error('Error deleting term:', error);
      toast.error(error.response?.data?.error || 'Failed to delete term');
      throw error;
    }
  },

  // Set a term as active (deactivates others)
  setActive: async (id: string): Promise<Term> => {
    try {
      const response = await api.put(`/terms/${id}`, { isActive: true });
      toast.success('Term activated successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error activating term:', error);
      toast.error('Failed to activate term');
      throw error;
    }
  }
};

export default termService;