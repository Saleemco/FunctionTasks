import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { resultService } from "../../services/result.service";
import { feeService } from "../../services/fee.service";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { DataTable } from "../ui/DataTable";
import { Modal } from "../ui/Modal";
import { DocumentArrowDownIcon, ReceiptRefundIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const StudentResults = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [showFeesModal, setShowFeesModal] = useState(false);

  const children = user?.parentProfile?.children || [];

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ["student-results", selectedChild?.id, selectedTerm],
    queryFn: () =>
      resultService.getStudentResults(selectedChild?.id || "", selectedTerm || undefined),
    enabled: !!selectedChild?.id,
  });

  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["student-fees", selectedChild?.id],
    queryFn: () => feeService.getStudentFees(selectedChild?.id || ""),
    enabled: !!selectedChild?.id && showFeesModal,
  });

  const handleDownloadReport = async () => {
    if (!resultsData?.data?.results?.[0]) {
      toast.error("No results available to download");
      return;
    }
    try {
      const blob = await resultService.generateReportCard(selectedChild.id, resultsData.data.results[0].termId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-card-${selectedChild.admissionNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report card downloaded successfully");
    } catch (error) {
      toast.error("Failed to download report card");
    }
  };

  const handleDownloadReceipt = async (feeId: string) => {
    try {
      const blob = await feeService.generateReceipt(feeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  const resultColumns = [
    { key: "subject", header: "Subject", render: (item: any) => item.subject?.name },
    { key: "ca1", header: "CA1" },
    { key: "ca2", header: "CA2" },
    { key: "exam", header: "Exam" },
    { key: "total", header: "Total" },
    {
      key: "grade",
      header: "Grade",
      render: (item: any) => (
        <Badge
          variant={
            item.grade === "A"
              ? "success"
              : item.grade === "B"
              ? "info"
              : item.grade === "C"
              ? "warning"
              : item.grade === "F"
              ? "error"
              : "default"
          }
        >
          {item.grade}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge variant={item.isApproved ? "success" : "warning"}>
          {item.isApproved ? "Approved" : "Pending"}
        </Badge>
      ),
    },
  ];

  const childOptions = children.map((child: any) => ({
    value: child.id,
    label: `${child.user?.firstName} ${child.user?.lastName} (${child.admissionNo})`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
        <p className="text-gray-600">View your children's academic performance</p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            label="Select Child"
            value={selectedChild?.id || ""}
            onChange={(e) => {
              const child = children.find((c: any) => c.id === e.target.value);
              setSelectedChild(child || null);
            }}
            options={[{ value: "", label: "Choose a child..." }, ...childOptions]}
            className="md:w-64"
          />
          <Select
            label="Term (Optional)"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            options={[
              { value: "", label: "All Terms" },
              { value: "first", label: "First Term" },
              { value: "second", label: "Second Term" },
              { value: "third", label: "Third Term" },
            ]}
            className="md:w-48"
          />
        </div>
      </Card>

      {selectedChild && (
        <>
          <Card
            title={`${selectedChild.user?.firstName} ${selectedChild.user?.lastName}`}
            subtitle={`${selectedChild.class?.name} | Admission No: ${selectedChild.admissionNo}`}
            action={
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowFeesModal(true)}>
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  View Fees
                </Button>
                <Button variant="outline" onClick={handleDownloadReport}>
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Download Report
                </Button>
              </div>
            }
          >
            <DataTable
              columns={resultColumns}
              data={resultsData?.data?.results || []}
              keyExtractor={(item) => item.id}
              isLoading={resultsLoading}
            />

            {resultsData?.data?.gpa && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-700">GPA</span>
                <span className="text-2xl font-bold text-primary-600">
                  {resultsData.data.gpa.toFixed(2)}
                </span>
              </div>
            )}
          </Card>

          {/* Fees Modal */}
          <Modal
            isOpen={showFeesModal}
            onClose={() => setShowFeesModal(false)}
            title="Fee Details"
            size="lg"
          >
            <div className="space-y-4">
              {feesData?.data?.fees?.map((fee: any) => (
                <div key={fee.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {fee.term?.name} Term - {fee.term?.session?.year}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Total Fee: ?{fee.totalAmount.toLocaleString()}</p>
                        <p>Amount Paid: ?{fee.amountPaid.toLocaleString()}</p>
                        <p className={fee.balance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                          Balance: ?{fee.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          fee.status === "PAID"
                            ? "success"
                            : fee.status === "PARTIALLY_PAID"
                            ? "warning"
                            : "error"
                        }
                      >
                        {fee.status.replace("_", " ")}
                      </Badge>
                      {fee.payments?.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleDownloadReceipt(fee.id)}
                        >
                          <ReceiptRefundIcon className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!feesData?.data?.fees || feesData.data.fees.length === 0) && (
                <p className="text-gray-500 text-center py-4">No fee records found</p>
              )}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default StudentResults;
