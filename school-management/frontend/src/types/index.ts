export type UserRole = "PRINCIPAL" | "ADMIN" | "BURSAR" | "CLASS_TEACHER" | "SUBJECT_TEACHER" | "PARENT" | "STUDENT";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  teacherProfile?: TeacherProfile;
  parentProfile?: ParentProfile;
  studentProfile?: StudentProfile;
}

export interface TeacherProfile {
  id: string;
  qualification?: string;
  specialization?: string;
  subjects?: Subject[];
  managedClass?: Class;
}

export interface ParentProfile {
  id: string;
  occupation?: string;
  address?: string;
  phone?: string;
  children?: Student[];
}

export interface StudentProfile {
  id: string;
  admissionNo: string;
  dob?: string;
  gender?: string;
  enrollmentDate: string;
  class?: Class;
  parent?: ParentProfile;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
  classTeacher?: TeacherProfile;
  _count?: {
    students: number;
    subjects: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  classId: string;
  class?: Class;
  teacher?: TeacherProfile;
  teacherId?: string;
}

export interface TermInfo {
  id: string;
  name: "FIRST" | "SECOND" | "THIRD";
  isActive: boolean;
  startDate: string;
  endDate: string;
  sessionId: string;
  session?: AcademicSession;
}

export interface AcademicSession {
  id: string;
  year: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Result {
  id: string;
  studentId: string;
  subjectId: string;
  termId: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: "A" | "B" | "C" | "D" | "E" | "F";
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  teacherRemark?: string;
  principalRemark?: string;
  subject?: Subject;
  student?: Student;
  term?: TermInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  admissionNo: string;
  classId: string;
  class?: Class;
  parentId: string;
  parent?: ParentProfile;
  results?: Result[];
  fees?: StudentFee[];
  dob?: string;
  gender?: string;
}

export interface StudentFee {
  id: string;
  studentId: string;
  termId: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: "PAID" | "PARTIALLY_PAID" | "UNPAID";
  receiptNo?: string;
  term?: TermInfo;
  payments?: Payment[];
  student?: Student;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  feeId: string;
  amount: number;
  date: string;
  method: "CASH" | "BANK_TRANSFER" | "POS" | "ONLINE";
  reference?: string;
  recordedById: string;
  recordedBy?: {
    firstName: string;
    lastName: string;
  };
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
