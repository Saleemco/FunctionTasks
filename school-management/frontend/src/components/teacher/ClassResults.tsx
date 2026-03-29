import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { resultService } from "../../services/result.service";
import { dashboardService } from "../../services/dashboard.service";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { DataTable } from "../ui/DataTable";
import { Modal } from "../ui/Modal";
import { ArrowDownTrayIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const ClassResults = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "results");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);

  const { data: dashboardData } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: dashboardService.getTeacherDashboard,
  });

  const managedClass = dashboardData?.managingClass;

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ["class-results", managedClass?.id, selectedTerm],
    queryFn: () =>
      resultService.getClassResults(managedClass?.id || "", selectedTerm || "current-term"),
    enabled: !!managedClass?.id,
  });

  const { data: broadSheetData, isLoading: broadSheetLoading } = useQuery({
    queryKey: ["class-broadsheet", managedClass?.id, selectedTerm],
    queryFn: () =>
      resultService.getClassBroadSheet(managedClass?.id || "", selectedTerm || "current-term"),
    enabled: !!managedClass?.id && activeTab === "broadsheet",
  });

  const handleDownloadBroadSheet = () => {
    toast.success("Broadsheet download started");
    // Implement PDF generation
  };

  const handleSubmitForApproval = () => {
    toast.success("Results submitted for approval");
    setShowApproveModal(false);
  };

  if (!managedClass) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">
          You are not assigned as a class teacher. Please contact the principal.
        </p>
      </Card>
    );
  }

  const resultColumns = [
    {
      key: "position",
      header: "Position",
      render: (item: any) => (
        <span className="font-bold text-primary-600">#{item.position}</span>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (item: any) => (
        <div>
          <p className="font-medium">
            {item.user?.firstName} {item.user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{item.admissionNo}</p>
        </div>
      ),
    },
    {
      key: "subjects",
      header: "Subjects",
      render: (item: any) => item.subjectsOffered || item.results?.length || 0,
    },
    {
      key: "totalScore",
      header: "Total Score",
      render: (item: any) => item.totalScore || 0,
    },
    {
      key: "average",
      header: "Average",
      render: (item: any) => (
        <span className="font-bold">{item.average?.toFixed(2)}%</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => {
        const hasPending = item.results?.some((r: any) => !r.isApproved);
        return hasPending ? (
          <Badge variant="warning">Pending</Badge>
        ) : (
          <Badge variant="success">Complete</Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Results</h1>
        <p className="text-gray-600">{managedClass.name} - Class Management</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "results"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Results
          </button>
          <button
            onClick={() => setActiveTab("broadsheet")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "broadsheet"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Broadsheet
          </button>
        </div>
        <div className="flex space-x-2">
          <Select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            options={[
              { value: "", label: "Current Term" },
              { value: "first", label: "First Term" },
              { value: "second", label: "Second Term" },
              { value: "third", label: "Third Term" },
            ]}
            className="w-40"
          />
          {activeTab === "broadsheet" && (
            <Button variant="outline" onClick={handleDownloadBroadSheet}>
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download
            </Button>
          )}
          <Button onClick={() => setShowApproveModal(true)}>
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>

      <Card>
        {activeTab === "results" ? (
          <DataTable
            columns={resultColumns}
            data={resultsData?.data || []}
            keyExtractor={(item) => item.id}
            isLoading={resultsLoading}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  {broadSheetData?.data?.subjects?.map((subject: any) => (
                    <th
                      key={subject.id}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {subject.name}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Avg
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Pos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {broadSheetData?.data?.students?.map((student: any) => (
                  <tr key={student.studentId}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    {broadSheetData?.data?.subjects?.map((subject: any) => {
                      const score = student.subjectScores?.[subject.id];
                      return (
                        <td key={subject.id} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {score ? `${score.total} (${score.grade})` : "-"}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.totalScore}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {student.average?.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-primary-600">
                      {student.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Submit for Approval Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Submit Results for Approval"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to submit all results for this class to the principal for final
          approval? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowApproveModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmitForApproval} className="flex-1">
            Submit for Approval
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClassResults;
