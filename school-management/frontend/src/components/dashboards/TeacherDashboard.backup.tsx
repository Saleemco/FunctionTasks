// components/dashboards/TeacherDashboard.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboard.service";
import { SearchBar } from "../ui/SearchBar";
import { useSearch } from "../../hooks/useSearch";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import {
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { GradeEntryModal } from "../teachers/GradeEntryModal";
import { AttendanceMarker } from "../teachers/AttendanceMarker";
import { toast } from "react-hot-toast";

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: dashboardService.getTeacherDashboard,
  });

  const getTeacherName = () => {
    if (!user) return "Teacher";
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return "Teacher";
  };

  const students = data?.students || [];
  const grades = data?.recentGrades || [];
  const teacher = data?.teacher || { name: "", subjects: [] };
  const stats = data?.stats || {
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    todayAttendance: 0,
    pendingGrades: 0,
    averageGrade: 0
  };
  
  const filteredStudents = useSearch(
    students,
    ['name', 'admissionNo', 'className'],
    (student: any, term: string) => {
      return student.name?.toLowerCase().includes(term) ||
             student.admissionNo?.toLowerCase().includes(term) ||
             student.className?.toLowerCase().includes(term);
    }
  );
  
  const filteredGrades = useSearch(
    grades,
    ['studentName', 'subjectName'],
    (grade: any, term: string) => {
      return grade.studentName?.toLowerCase().includes(term) ||
             grade.subjectName?.toLowerCase().includes(term);
    }
  );

  const handleGradeSubmit = async (gradeData: any) => {
    try {
      // API call to submit grade
      await dashboardService.submitGrade(gradeData);
      toast.success("Grade submitted successfully!");
      refetch();
      setShowGradeModal(false);
    } catch (error) {
      toast.error("Failed to submit grade");
    }
  };

  const handleAttendanceSubmit = async (attendanceData: any) => {
    try {
      await dashboardService.submitAttendance(attendanceData);
      toast.success("Attendance recorded successfully!");
      refetch();
      setShowAttendanceModal(false);
    } catch (error) {
      toast.error("Failed to record attendance");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error loading dashboard: {error.message}</p>
      </div>
    );
  }

  const statsCards = [
    { name: "My Students", value: stats.totalStudents, icon: UsersIcon, color: "bg-blue-500" },
    { name: "My Classes", value: stats.totalClasses, icon: AcademicCapIcon, color: "bg-green-500" },
    { name: "Subjects", value: stats.totalSubjects, icon: BookOpenIcon, color: "bg-purple-500" },
    { name: "Today's Attendance", value: stats.todayAttendance, icon: CalendarIcon, color: "bg-yellow-500" },
    { name: "Pending Grades", value: stats.pendingGrades || 0, icon: ChartBarIcon, color: "bg-red-500" },
    { name: "Class Average", value: `${stats.averageGrade || 0}%`, icon: ChartBarIcon, color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {getTeacherName()}!</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CalendarIcon className="w-4 h-4" />
            Mark Attendance
          </button>
          <button
            onClick={() => setShowGradeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            Enter Grade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((card) => (
          <Card key={card.name}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">{card.name}</p>
                <p className="text-xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Subjects I Teach">
              <div className="space-y-3">
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  teacher.subjects.map((subject: any) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{subject.name}</p>
                        <p className="text-sm text-gray-500">Class: {subject.className}</p>
                      </div>
                      <Badge variant="info">{subject.name}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No subjects assigned yet</p>
                )}
              </div>
            </Card>

            <Card title="Quick Actions">
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab("students")}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">View Students</span>
                  </div>
                  <span className="text-blue-600">{stats.totalStudents} students</span>
                </button>
                <button
                  onClick={() => setShowGradeModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <div className="flex items-center gap-3">
                    <ChartBarIcon className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Enter Grades</span>
                  </div>
                  <span className="text-green-600">Record student performance</span>
                </button>
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">Mark Attendance</span>
                  </div>
                  <span className="text-yellow-600">Today's attendance</span>
                </button>
              </div>
            </Card>
          </div>

          <Card title="Recent Grades Entered" className="mt-6">
            <div className="space-y-4">
              <SearchBar
                onSearch={setGradeSearchTerm}
                placeholder="Search grades by student name or subject..."
              />
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredGrades.filteredItems.length > 0 ? (
                  filteredGrades.filteredItems.map((grade: any) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{grade.studentName}</p>
                        <p className="text-sm text-gray-500">{grade.subjectName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          grade.score >= 70 ? 'bg-green-100 text-green-700' :
                          grade.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {grade.score}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{grade.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {gradeSearchTerm ? "No grades found matching your search" : "No grades entered yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card title="My Students">
            <div className="space-y-4">
              <SearchBar
                onSearch={setStudentSearchTerm}
                placeholder="Search students by name or admission number..."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredStudents.filteredItems.length > 0 ? (
                  filteredStudents.filteredItems.map((student: any) => (
                    <div key={student.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">Admission: {student.admissionNo}</p>
                          <p className="text-xs text-gray-400">Class: {student.className}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowGradeModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Add Grade
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 col-span-2">
                    {studentSearchTerm ? "No students found" : "No students assigned"}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="mt-6">
          <Card title="All Grades">
            <div className="space-y-4">
              <SearchBar
                onSearch={setGradeSearchTerm}
                placeholder="Search grades by student name or subject..."
              />
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredGrades.filteredItems.length > 0 ? (
                  filteredGrades.filteredItems.map((grade: any) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{grade.studentName}</p>
                        <p className="text-sm text-gray-500">{grade.subjectName}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(grade.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                          grade.score >= 70 ? 'bg-green-100 text-green-700' :
                          grade.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {grade.score}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{grade.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No grades entered yet</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card title="Attendance Records">
            <div className="space-y-4">
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark Today's Attendance
              </button>
              <div className="space-y-2">
                {/* Attendance history will be shown here */}
                <p className="text-gray-500 text-center py-4">No attendance records yet</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showGradeModal && (
        <GradeEntryModal
          isOpen={showGradeModal}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleGradeSubmit}
          students={students}
          subjects={teacher.subjects}
          selectedStudent={selectedStudent}
        />
      )}

      {showAttendanceModal && (
        <AttendanceMarker
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          onSubmit={handleAttendanceSubmit}
          students={students}
          classId={teacher.classes?.[0]?.id}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;