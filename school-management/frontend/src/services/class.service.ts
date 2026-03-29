import api from './api';
import toast from 'react-hot-toast';

export interface Class {
  id: string;
  name: string;
  section: string;
  classTeacherId?: string | null;
  classTeacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    students: number;
    subjects: number;
  };
  createdAt?: string;
}

export interface CreateClassData {
  name: string;
  section: string;
  classTeacherId?: string | null;
}

export const classService = {
  getAll: async (): Promise<Class[]> => {
    try {
      console.log('📚 Fetching classes from API...');
      const response = await api.get('/classes');
      console.log('✅ Classes response:', response.data);
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching classes:', error);
      toast.error('Failed to load classes');
      return []; // Return empty array on error, no mock data
    }
  },

  create: async (data: CreateClassData): Promise<Class> => {
    try {
      console.log('📝 Creating class with data:', JSON.stringify(data, null, 2));
      
      const token = localStorage.getItem('token');
      console.log('🔑 Using token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const response = await api.post('/classes', data);
      console.log('✅ Create response:', response.data);
      
      toast.success('Class created successfully');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error creating class:', error);
      
      if (error.response) {
        console.error('📦 Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('📊 Response status:', error.response.status);
        
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            ('Server error: ' + error.response.status);
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('📡 No response received:', error.request);
        toast.error('Cannot connect to server. Is the backend running?');
      } else {
        console.error('❓ Error message:', error.message);
        toast.error('Failed to create class: ' + error.message);
      }
      
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete('/classes/' + id);
      toast.success('Class deleted successfully');
    } catch (error: any) {
      console.error('Error deleting class:', error);
      toast.error(error.response?.data?.message || 'Failed to delete class');
      throw error;
    }
  }
};

export default classService;
