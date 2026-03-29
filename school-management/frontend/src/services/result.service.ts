import api from "./api";

export const resultService = {
  getMySubjects: async () => {
    const response = await api.get("/results/my-subjects");
    return response.data.data;
  },

  enterScores: async (data: {
    studentId: string;
    subjectId: string;
    termId: string;
    ca1: number;
    ca2: number;
    exam: number;
  }) => {
    const response = await api.post("/results/scores", data);
    return response.data;
  },

  getClassResults: async (classId: string, termId: string) => {
    const response = await api.get(`/results/class/${classId}/term/${termId}`);
    return response.data;
  },

  getStudentResults: async (studentId: string, termId?: string) => {
    const params = termId ? { termId } : {};
    const response = await api.get(`/results/student/${studentId}`, { params });
    return response.data;
  },

  approveResults: async (resultIds: string[], principalRemark?: string) => {
    const response = await api.post("/results/approve", { resultIds, principalRemark });
    return response.data;
  },

  addRemarks: async (resultId: string, teacherRemark: string) => {
    const response = await api.post("/results/remarks", { resultId, teacherRemark });
    return response.data;
  },

  getClassBroadSheet: async (classId: string, termId: string) => {
    const response = await api.get(`/results/class/${classId}/broadsheet/${termId}`);
    return response.data;
  },

  generateReportCard: async (studentId: string, termId: string) => {
    const response = await api.get(`/results/student/${studentId}/report-card/${termId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  submitForApproval: async (classId: string, termId: string) => {
    const response = await api.post("/results/submit-for-approval", { classId, termId });
    return response.data;
  },
};

export default resultService;
