import api from './api';
import toast from 'react-hot-toast';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNo: string;
  class?: {
    id: string;
    name: string;
    section: string;
  };
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  dob?: string;
  gender?: string;
  status?: string;
  enrollmentDate: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
  admissionNo: string;
  classId: string;
  parentId: string;
  gender: string;
  dob?: string;
}

export const studentService = {
  getAll: async (classId?: string, teacherId?: string): Promise<Student[]> => {
    try {
      console.log('📚 Fetching students from API...');
      const params: any = {};
      if (classId) params.classId = classId;
      if (teacherId) params.teacherId = teacherId;
      
      const response = await api.get('/students', { params });
      console.log('✅ Students response:', response.data);
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching students:', error);
      toast.error('Failed to load students');
      return [];
    }
  },
  
  getByTeacher: async (teacherId: string): Promise<Student[]> => {
    try {
      console.log('📚 Fetching students for teacher:', teacherId);
      const response = await api.get(`/teachers/${teacherId}/students`);
      console.log('✅ Teacher students response:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching teacher students:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Student> => {
    try {
      const response = await api.get('/students/' + id);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student');
      throw error;
    }
  },
  
  create: async (data: CreateStudentData): Promise<Student> => {
    try {
      console.log('📝 Creating student with data:', JSON.stringify(data, null, 2));
      const response = await api.post('/students', data);
      console.log('✅ Create response:', response.data);
      toast.success('Student created successfully');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error creating student:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            'Failed to create student';
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('Cannot connect to server');
      } else {
        console.error('Error:', error.message);
        toast.error('Failed to create student');
      }
      
      throw error;
    }
  },
  
  update: async (id: string, data: Partial<CreateStudentData>): Promise<Student> => {
    try {
      const response = await api.put('/students/' + id, data);
      toast.success('Student updated successfully');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast.error(error.response?.data?.message || 'Failed to update student');
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete('/students/' + id);
      toast.success('Student deleted successfully');
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
      throw error;
    }
  },
  
  getByClass: async (classId: string): Promise<Student[]> => {
    try {
      const response = await api.get('/students/class/' + classId);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching students by class:', error);
      return [];
    }
  },
};

export default studentService;