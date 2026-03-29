import api from './api';
import toast from 'react-hot-toast';

export interface Subject {
  id: string;
  name: string;
  teacherId?: string;
  teacher?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  classes: Array<{
    id: string;
    name: string;
    section?: string;
    grade: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectData {
  name: string;
  classIds: string[];
  teacherId?: string | null;
}

export const subjectService = {
  getAll: async (): Promise<Subject[]> => {
    try {
      console.log('📚 Fetching subjects from API...');
      const response = await api.get('/subjects');
      console.log('✅ Subjects response:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching subjects:', error);
      toast.error('Failed to load subjects');
      return [];
    }
  },

  getById: async (id: string): Promise<Subject> => {
    try {
      const response = await api.get(`/subjects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subject:', error);
      toast.error('Failed to load subject');
      throw error;
    }
  },

  create: async (data: CreateSubjectData): Promise<Subject> => {
    try {
      console.log('📝 Creating subject with data:', JSON.stringify(data, null, 2));
      const response = await api.post('/subjects', data);
      console.log('✅ Create response:', response.data);
      toast.success('Subject created successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating subject:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message || 
                            'Failed to create subject';
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('Cannot connect to server');
      } else {
        console.error('Error:', error.message);
        toast.error('Failed to create subject');
      }
      
      throw error;
    }
  },

  update: async (id: string, data: Partial<CreateSubjectData>): Promise<Subject> => {
    try {
      console.log('📝 Updating subject:', id, 'with data:', JSON.stringify(data, null, 2));
      const response = await api.put(`/subjects/${id}`, data);
      console.log('✅ Update response:', response.data);
      toast.success('Subject updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating subject:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message || 
                            'Failed to update subject';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update subject');
      }
      
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting subject:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message || 
                            'Failed to delete subject';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to delete subject');
      }
      
      throw error;
    }
  },

  getByTeacher: async (teacherId: string): Promise<Subject[]> => {
    try {
      const response = await api.get(`/subjects/teacher/${teacherId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subjects by teacher:', error);
      return [];
    }
  },

  getByClass: async (classId: string): Promise<Subject[]> => {
    try {
      const response = await api.get(`/subjects/class/${classId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subjects by class:', error);
      return [];
    }
  },
};

export default subjectService;