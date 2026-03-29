import api from './api';
import toast from 'react-hot-toast';

export interface Parent {
  id: string;
  userId: string;
  occupation?: string;
  address?: string;
  phone?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  children?: any[];
}

export const parentService = {
  getAll: async (): Promise<Parent[]> => {
    try {
      const response = await api.get('/parents');
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching parents:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Parent> => {
    try {
      const response = await api.get('/parents/' + id);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching parent:', error);
      throw error;
    }
  },

  getByUserId: async (userId: string | undefined): Promise<Parent> => {
    try {
      const response = await api.get('/parents/user/' + userId);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching parent by user ID:', error);
      throw error;
    }
  },

  create: async (data: any): Promise<Parent> => {
    try {
      const response = await api.post('/parents', data);
      toast.success('Parent created successfully');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating parent:', error);
      toast.error(error.response?.data?.message || 'Failed to create parent');
      throw error;
    }
  },

  update: async (id: string, data: any): Promise<Parent> => {
    try {
      const response = await api.put('/parents/' + id, data);
      toast.success('Parent updated successfully');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating parent:', error);
      toast.error(error.response?.data?.message || 'Failed to update parent');
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete('/parents/' + id);
      toast.success('Parent deleted successfully');
    } catch (error: any) {
      console.error('Error deleting parent:', error);
      toast.error(error.response?.data?.message || 'Failed to delete parent');
      throw error;
    }
  },

  // Get available students (students without a parent) with optional search
  getAvailableStudents: async (search?: string) => {
    try {
      console.log('📋 Fetching available students...');
      const params = search ? { search } : {};
      const response = await api.get('/parent/available-students', { params });
      console.log('✅ Available students:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching available students:', error);
      toast.error('Failed to load available students');
      return { data: [] };
    }
  },

  // Link a child to the parent
  linkChild: async (data: { studentId: string }) => {
    try {
      console.log('🔗 Linking child with data:', data);
      const response = await api.post('/parent/link-child', data);
      toast.success(response.data.message || 'Child linked successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error linking child:', error);
      toast.error(error.response?.data?.error || 'Failed to link child');
      throw error;
    }
  },

  // Unlink a child from the parent
  unlinkChild: async (studentId: string) => {
    try {
      console.log('🔓 Unlinking child:', studentId);
      const response = await api.delete(`/parent/unlink-child/${studentId}`);
      toast.success(response.data.message || 'Child unlinked successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error unlinking child:', error);
      toast.error(error.response?.data?.error || 'Failed to unlink child');
      throw error;
    }
  },
};

export default parentService;