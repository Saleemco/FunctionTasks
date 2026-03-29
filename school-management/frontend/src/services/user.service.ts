import api from "./api";
import { User } from "../types";

export const userService = {
  getUsers: async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: any) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  assignSubjectTeacher: async (teacherId: string, subjectId: string) => {
    const response = await api.post("/users/assign-subject-teacher", { teacherId, subjectId });
    return response.data;
  },

  assignClassTeacher: async (teacherId: string, classId: string) => {
    const response = await api.post("/users/assign-class-teacher", { teacherId, classId });
    return response.data;
  },
};

export default userService;
