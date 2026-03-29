import api from './api';

export const dashboardService = {
  getTeacherDashboard: async () => {
    const response = await api.get('/dashboard/teacher');
    return response.data.data;
  },

  getPrincipalDashboard: async () => {
    const response = await api.get('/dashboard/principal');
    return response.data.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data.data;
  },

  getBursarDashboard: async () => {
    const response = await api.get('/dashboard/bursar');
    return response.data.data;
  },

  getParentDashboard: async () => {
    const response = await api.get('/dashboard/parent');
    return response.data.data;
  },

  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data.data;
  },

  getTerms: async () => {
    const response = await api.get('/api/terms');
    return response.data;
  },

  getActiveTerm: async () => {
    const response = await api.get('/api/terms/active');
    return response.data;
  },

  submitGrade: async (gradeData: any) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  submitAttendance: async (attendanceData: any) => {
    const response = await api.post('/attendance/bulk', attendanceData);
    return response.data;
  },

  getAttendanceByClass: async (classId: string, date: string) => {
    const response = await api.get(`/attendance/class/${classId}?date=${date}`);
    return response.data;
  },
};