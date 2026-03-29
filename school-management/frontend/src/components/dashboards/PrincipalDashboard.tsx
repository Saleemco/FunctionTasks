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
  CalendarIcon,
} from "@heroicons/react/24/outline";

export const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [parentSearchTerm, setParentSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["principal-dashboard"],
    queryFn: dashboardService.getPrincipalDashboard,
  });

  const getPrincipalName = () => {
    if (!user) return "Principal";
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return "Principal";
  };

  const recentStudents = data?.recentStudents || [];
  const recentParents = data?.recentParents || [];
  
  const filteredStudents = useSearch(
    recentStudents,
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
    totalExpected: 0,
    totalCollected: 0,
    collectionRate: 0,
    todayAttendance: 0
  };

  const summaryCards = [
    {
      name: "Total Students",
      value: stats.totalStudents,
      icon: UsersIcon,
      color: "bg-blue-500",
    },
    {
      name: "Total Teachers",
      value: stats.totalTeachers,
      icon: UserGroupIcon,
      color: "bg-green-500",
    },
    {
      name: "Total Parents",
      value: stats.totalParents,
      icon: AcademicCapIcon,
      color: "bg-purple-500",
    },
    {
      name: "Total Classes",
      value: stats.totalClasses,
      icon: BookOpenIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Today's Attendance",
      value: stats.todayAttendance,
      icon: CalendarIcon,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
        <p className="text-gray-600">Welcome back, {getPrincipalName()}! School Overview and Statistics</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Fee Collection">
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
              <span className="text-gray-600">Collection Rate</span>
              <span className="font-bold text-purple-600">{stats.collectionRate}%</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${stats.collectionRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Recent Parent Registrations">
          <div className="space-y-4">
            <SearchBar
              onSearch={setParentSearchTerm}
              placeholder="Search parents by name or email..."
            />
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredParents.filteredItems.length > 0 ? (
                filteredParents.filteredItems.map((parent: any) => (
                  <div key={parent.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{parent.name}</p>
                        <p className="text-sm text-gray-500">{parent.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Children: {parent.childrenCount || 0}
                        </p>
                      </div>
                      <Badge variant="info">
                        {parent.childrenCount || 0} Child{parent.childrenCount !== 1 ? 'ren' : ''}
                      </Badge>
                    </div>
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

      <Card title="Recent Enrollments">
        <div className="space-y-4">
          <SearchBar
            onSearch={setStudentSearchTerm}
            placeholder="Search students by name or admission number..."
          />
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredStudents.filteredItems.length > 0 ? (
              filteredStudents.filteredItems.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">Admission: {student.admissionNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{student.className}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {studentSearchTerm ? "No students found" : "No recent enrollments"}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrincipalDashboard;