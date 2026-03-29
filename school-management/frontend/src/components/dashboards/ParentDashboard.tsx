import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboard.service";
import { parentService } from "../../services/parent.service";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { Badge } from "../ui/Badge";
import {
  UserIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const ParentDashboard = () => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch parent dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: dashboardService.getParentDashboard,
  });

  // Fetch available students for linking with search
  const {
    data: availableStudentsData,
    isLoading: studentsLoading,
  } = useQuery({
    queryKey: ["available-students", searchTerm],
    queryFn: () => parentService.getAvailableStudents(searchTerm),
    enabled: showLinkModal,
  });

  // Link child mutation
  const linkChildMutation = useMutation({
    mutationFn: parentService.linkChild,
    onSuccess: () => {
      setShowLinkModal(false);
      setSelectedStudentId("");
      setSearchTerm("");
      queryClient.invalidateQueries({ queryKey: ["parent-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["available-students"] });
      toast.success("Child linked successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to link child");
    },
  });

  // Unlink child mutation
  const unlinkChildMutation = useMutation({
    mutationFn: parentService.unlinkChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["available-students"] });
      toast.success("Child unlinked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to unlink child");
    },
  });

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }
    linkChildMutation.mutate({ studentId: selectedStudentId });
  };

  const handleUnlinkChild = (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to unlink ${studentName} from your account?`)) {
      unlinkChildMutation.mutate(studentId);
    }
  };

  const toggleExpand = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const availableStudents = availableStudentsData?.data || [];

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
        <button onClick={() => window.location.reload()} className="mt-2 text-red-600 underline">
          Try Again
        </button>
      </div>
    );
  }

  const parent = data?.parent || { name: "", email: "" };
  const students = data?.students || [];
  const totalOutstanding = data?.totalOutstanding || 0;
  const totalExpected = students.reduce((sum: number, student: any) => sum + student.feeSummary.totalFees, 0);
  const totalPaid = students.reduce((sum: number, student: any) => sum + student.feeSummary.totalPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {parent.name || "Parent"}</p>
          <p className="text-sm text-gray-500">{parent.email}</p>
        </div>
        <Button onClick={() => setShowLinkModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Link Child
        </Button>
      </div>

      {/* Family Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Expected Fees</p>
              <p className="text-2xl font-bold text-blue-700">₦{totalExpected.toLocaleString()}</p>
              <p className="text-xs text-blue-500 mt-1">Across all children</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ReceiptPercentIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-green-700">₦{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-green-500 mt-1">Amount collected</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-700">₦{totalOutstanding.toLocaleString()}</p>
              <p className="text-xs text-red-500 mt-1">Pending payment</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Children List */}
      {students.length > 0 ? (
        students.map((student: any) => {
          const paymentProgress = student.feeSummary.totalFees > 0 
            ? (student.feeSummary.totalPaid / student.feeSummary.totalFees) * 100 
            : 0;
          
          return (
            <Card key={student.id} className="overflow-hidden">
              <div className="p-6 border-b bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleExpand(student.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{student.name}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                        <span>Admission: {student.admissionNo}</span>
                        <span>Class: {student.className}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Outstanding</p>
                      <p className="text-lg font-bold text-red-600">₦{student.feeSummary.totalOutstanding.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlinkChild(student.id, student.name);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="Unlink child"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedStudent === student.id && (
                <div className="p-6 space-y-4">
                  {/* Fee Summary for this student */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                      Fee Details
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Total Fees</p>
                        <p className="text-xl font-bold text-gray-800">₦{student.feeSummary.totalFees.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="text-xl font-bold text-green-600">₦{student.feeSummary.totalPaid.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Outstanding</p>
                        <p className="text-xl font-bold text-red-600">₦{student.feeSummary.totalOutstanding.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Payment Progress</span>
                        <span>{paymentProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${paymentProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recent Attendance */}
                  {student.recentAttendance && student.recentAttendance.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-green-500" />
                        Recent Attendance
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {student.recentAttendance.map((att: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-50 rounded-full">
                            {att.status === "PRESENT" ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-gray-600">
                              {new Date(att.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Grades */}
                  {student.recentGrades && student.recentGrades.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-purple-500" />
                        Recent Grades
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {student.recentGrades.map((grade: any) => (
                          <div key={grade.id} className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-600">{grade.subjectName}</p>
                            <p
                              className={`text-lg font-bold ${
                                grade.score >= 70
                                  ? "text-green-600"
                                  : grade.score >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {grade.score}
                            </p>
                            <Badge variant="info" size="sm">
                              {grade.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No children linked to your account yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Link Child" to add your children by name or admission number
          </p>
          <Button onClick={() => setShowLinkModal(true)} className="mt-4">
            <PlusIcon className="h-5 w-5 mr-2" />
            Link Child
          </Button>
        </div>
      )}

      {/* Link Child Modal with Search */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setSelectedStudentId("");
          setSearchTerm("");
        }}
        title="Link Child to Your Account"
      >
        <form onSubmit={handleLinkChild} className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name or Admission Number
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter student name or admission number..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Student
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {studentsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : availableStudents.length > 0 ? (
                availableStudents.map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                      selectedStudentId === student.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                          <span>Admission: {student.admissionNo}</span>
                          <span>Class: {student.className}</span>
                        </div>
                      </div>
                      {selectedStudentId === student.id && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No students found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-400 mt-1">
                      Try a different name or admission number
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedStudentId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                ✅ You're about to link{" "}
                <strong>
                  {availableStudents.find((s: any) => s.id === selectedStudentId)?.name}
                </strong>{" "}
                to your account.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowLinkModal(false);
                setSelectedStudentId("");
                setSearchTerm("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={linkChildMutation.isPending}
              disabled={!selectedStudentId || studentsLoading}
              className="flex-1"
            >
              Link Child
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParentDashboard;