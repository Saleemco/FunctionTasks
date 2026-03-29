import api from './api';
import toast from 'react-hot-toast';

export interface Teacher {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  subjects?: Subject[];
  classes?: Class[];
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
}

export interface CreateTeacherData {
  email: string;
  classIds: string[];
  subjectIds: string[];
}

export const teacherService = {
  // Get all teachers
  getAll: async (): Promise<Teacher[]> => {
    try {
      console.log('📚 Fetching teachers from API...');
      const response = await api.get('/teachers');
      console.log('✅ Teachers response:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching teachers:', error);
      toast.error('Failed to load teachers');
      return [];
    }
  },

  // Get teacher by ID
  getById: async (id: string): Promise<Teacher> => {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  // Get teacher by User ID
  getByUserId: async (userId: string): Promise<Teacher | null> => {
    try {
      console.log('👤 Fetching teacher by user ID:', userId);
      const response = await api.get(`/teachers/user/${userId}`);
      console.log('✅ Teacher found:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('No teacher profile found for user:', userId);
        return null;
      }
      console.error('Error fetching teacher by user ID:', error);
      return null;
    }
  },

  // Create a new teacher
  create: async (data: CreateTeacherData): Promise<Teacher> => {
    try {
      console.log('📝 Creating teacher with data:', data);
      const response = await api.post('/teachers', data);
      toast.success('Teacher created successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating teacher:', error);
      toast.error(error.response?.data?.message || 'Failed to create teacher');
      throw error;
    }
  },

  // Update a teacher
  update: async (id: string, data: Partial<CreateTeacherData>): Promise<Teacher> => {
    try {
      const response = await api.put(`/teachers/${id}`, data);
      toast.success('Teacher updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      toast.error(error.response?.data?.message || 'Failed to update teacher');
      throw error;
    }
  },

  // Delete a teacher
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher deleted successfully');
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
      throw error;
    }
  },
};

export default teacherService;