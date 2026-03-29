import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboard.service";
import { SearchBar } from "../ui/SearchBar";
import { useSearch } from "../../hooks/useSearch";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import {
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: dashboardService.getStudentDashboard,
  });

  const getStudentName = () => {
    if (!user) return "Student";
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return "Student";
  };

  const grades = data?.grades || [];
  const recentAttendances = data?.recentAttendances || [];
  
  const filteredGrades = useSearch(
    grades,
    ['subjectName'],
    (grade: any, term: string) => {
      return grade.subjectName?.toLowerCase().includes(term);
    }
  );
  
  const filteredAttendances = useSearch(
    recentAttendances,
    ['date', 'status'],
    (att: any, term: string) => {
      const date = new Date(att.date).toLocaleDateString().toLowerCase();
      return date.includes(term) || att.status?.toLowerCase().includes(term);
    }
  );

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

  const student = data?.student || { id: "", name: "", admissionNo: "", className: "" };
  const stats = data?.stats || {
    totalAttendanceDays: 0,
    presentDays: 0,
    attendancePercentage: 0,
    averageGrade: 0,
    totalFees: 0,
    paidFees: 0,
    outstandingFees: 0
  };

  const statsCards = [
    { name: "Attendance", value: `${stats.attendancePercentage}%`, icon: CalendarIcon, color: "bg-blue-500", subtext: `${stats.presentDays}/${stats.totalAttendanceDays} days` },
    { name: "Average Grade", value: stats.averageGrade, icon: ChartBarIcon, color: "bg-green-500", subtext: "Overall performance" },
    { name: "Total Fees", value: `₦${stats.totalFees.toLocaleString()}`, icon: CurrencyDollarIcon, color: "bg-purple-500", subtext: "School fees total" },
    { name: "Outstanding", value: `₦${stats.outstandingFees.toLocaleString()}`, icon: CurrencyDollarIcon, color: "bg-red-500", subtext: "Balance due" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {getStudentName()}!</p>
        <div className="flex flex-wrap gap-4 mt-2 text-sm">
          <span className="text-gray-500">Admission No: <strong>{student.admissionNo}</strong></span>
          <span className="text-gray-500">Class: <strong>{student.className}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => (
          <Card key={card.name}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Attendance">
          <div className="space-y-4">
            <SearchBar
              onSearch={setAttendanceSearchTerm}
              placeholder="Search attendance by date..."
            />
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredAttendances.filteredItems.length > 0 ? (
                filteredAttendances.filteredItems.map((att: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {att.status === 'PRESENT' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm text-gray-600">{new Date(att.date).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={att.status === 'PRESENT' ? 'success' : 'error'}>
                      {att.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {attendanceSearchTerm ? "No attendance records found matching your search" : "No attendance records found"}
                  </p>
                </div>
              )}
            </div>
            {attendanceSearchTerm && filteredAttendances.filteredItems.length > 0 && (
              <p className="text-xs text-gray-400">
                Found {filteredAttendances.filteredItems.length} record(s)
              </p>
            )}
          </div>
        </Card>

        <Card title="My Grades">
          <div className="space-y-4">
            <SearchBar
              onSearch={setGradeSearchTerm}
              placeholder="Search grades by subject..."
            />
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredGrades.filteredItems.length > 0 ? (
                filteredGrades.filteredItems.map((grade: any) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{grade.subjectName}</p>
                      <p className="text-xs text-gray-500">{grade.type}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                        grade.score >= 70 ? 'bg-green-100 text-green-700' :
                        grade.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {grade.score}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(grade.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {gradeSearchTerm ? "No grades found matching your search" : "No grades available yet"}
                  </p>
                </div>
              )}
            </div>
            {gradeSearchTerm && filteredGrades.filteredItems.length > 0 && (
              <p className="text-xs text-gray-400">
                Found {filteredGrades.filteredItems.length} grade(s)
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;