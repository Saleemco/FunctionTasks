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
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BookmarkIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [parentSearchTerm, setParentSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: dashboardService.getAdminDashboard,
  });

  const getAdminName = () => {
    if (!user) return "Admin";
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return "Admin";
  };

  const teachers = data?.teachers || [];
  const students = data?.students || [];
  const recentUsers = data?.recentUsers || [];
  const recentParents = data?.recentParents || [];
  
  const filteredTeachers = useSearch(
    teachers,
    ['name', 'email'],
    (teacher: any, term: string) => {
      return teacher.name?.toLowerCase().includes(term) ||
             teacher.email?.toLowerCase().includes(term);
    }
  );
  
  const filteredStudents = useSearch(
    students,
    ['name', 'admissionNo', 'className'],
    (student: any, term: string) => {
      return student.name?.toLowerCase().includes(term) ||
             student.admissionNo?.toLowerCase().includes(term) ||
             student.className?.toLowerCase().includes(term);
    }
  );
  
  const filteredParents = useSearch(
    recentParents,
    ['name', 'email'],
    (parent: any, term: string) => {
      return parent.name?.toLowerCase().includes(term) ||
             parent.email?.toLowerCase().includes(term);
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

  const stats = data?.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalExpected: 0,
    totalCollected: 0,
    outstanding: 0
  };

  const classDistribution = data?.classDistribution || [];

  const summaryCards = [
    { name: "Students", value: stats.totalStudents, icon: UsersIcon, color: "bg-blue-500" },
    { name: "Teachers", value: stats.totalTeachers, icon: UserGroupIcon, color: "bg-green-500" },
    { name: "Parents", value: stats.totalParents, icon: AcademicCapIcon, color: "bg-purple-500" },
    { name: "Classes", value: stats.totalClasses, icon: BookOpenIcon, color: "bg-yellow-500" },
    { name: "Subjects", value: stats.totalSubjects, icon: BookmarkIcon, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {getAdminName()}! System Overview and Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.name}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Fee Summary">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expected</span>
              <span className="font-bold">₦{stats.totalExpected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Collected</span>
              <span className="font-bold text-green-600">₦{stats.totalCollected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Outstanding</span>
              <span className="font-bold text-red-600">₦{stats.outstanding.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card title="Class Distribution">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {classDistribution.length > 0 ? (
              classDistribution.map((cls: any) => (
                <div key={cls.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{cls.name}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(cls.studentCount / stats.totalStudents) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">{cls.studentCount}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No class data available</p>
            )}
          </div>
        </Card>

        <Card title="Recent Users">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <SearchBar
              onSearch={(term) => {
                // Search recent users
                const filtered = recentUsers.filter((user: any) => 
                  user.name?.toLowerCase().includes(term.toLowerCase()) ||
                  user.email?.toLowerCase().includes(term.toLowerCase())
                );
              }}
              placeholder="Search users..."
              className="mb-2"
            />
            {recentUsers.length > 0 ? (
              recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-200">
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No recent users</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Teachers">
          <div className="space-y-4">
            <SearchBar
              onSearch={setTeacherSearchTerm}
              placeholder="Search teachers by name or email..."
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTeachers.filteredItems.length > 0 ? (
                filteredTeachers.filteredItems.map((teacher: any) => (
                  <div key={teacher.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {teacher.classesCount || 0} Classes | {teacher.subjectsCount || 0} Subjects
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {teacherSearchTerm ? "No teachers found" : "No teachers data"}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Students">
          <div className="space-y-4">
            <SearchBar
              onSearch={setStudentSearchTerm}
              placeholder="Search students by name or admission number..."
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredStudents.filteredItems.length > 0 ? (
                filteredStudents.filteredItems.slice(0, 10).map((student: any) => (
                  <div key={student.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">Admission: {student.admissionNo}</p>
                    <p className="text-xs text-gray-400">Class: {student.className}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {studentSearchTerm ? "No students found" : "No students data"}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Recent Parents">
          <div className="space-y-4">
            <SearchBar
              onSearch={setParentSearchTerm}
              placeholder="Search parents by name or email..."
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredParents.filteredItems.length > 0 ? (
                filteredParents.filteredItems.map((parent: any) => (
                  <div key={parent.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{parent.name}</p>
                    <p className="text-sm text-gray-500">{parent.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        Children: {parent.childrenCount || 0}
                      </p>
                      <Badge variant="info" size="sm">
                        {parent.childrenCount || 0} Child{parent.childrenCount !== 1 ? 'ren' : ''}
                      </Badge>
                    </div>
                    {parent.children && parent.children.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {parent.children.map((c: any, idx: number) => (
                          <span key={c.id}>
                            {c.name}
                            {idx < parent.children.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {parentSearchTerm ? "No parents found" : "No parent registrations yet"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Parents will appear here when they register
                  </p>
                </div>
              )}
            </div>
            {parentSearchTerm && filteredParents.filteredItems.length > 0 && (
              <p className="text-xs text-gray-400">
                Found {filteredParents.filteredItems.length} parent(s)
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;