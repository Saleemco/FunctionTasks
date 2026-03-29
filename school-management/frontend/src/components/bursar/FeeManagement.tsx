import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feeService } from "../../services/fee.service";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { DataTable } from "../ui/DataTable";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { PlusIcon, ReceiptRefundIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { format } from "date-fns";

export const FeeManagement = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInitModalOpen, setIsInitModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: feeSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["fee-summary"],
    queryFn: feeService.getFeeSummary,
  });

  const { data: financialReport, isLoading: reportLoading } = useQuery({
    queryKey: ["financial-report"],
    queryFn: () => feeService.getFinancialReport(),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: feeService.recordPayment,
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      setIsPaymentModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["financial-report"] });
      queryClient.invalidateQueries({ queryKey: ["fee-summary"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    },
  });

  const initializeFeesMutation = useMutation({
    mutationFn: feeService.initializeTermFees,
    onSuccess: () => {
      toast.success("Fees initialized successfully");
      setIsInitModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["financial-report"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to initialize fees");
    },
  });

  const handleRecordPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    recordPaymentMutation.mutate({
      studentId: formData.get("studentId") as string,
      termId: (formData.get("termId") as string) || feeSummary?.data?.term?.id,
      amount: parseFloat(formData.get("amount") as string),
      method: formData.get("method") as string,
      reference: formData.get("reference") as string,
    });
  };

  const handleInitializeFees = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    initializeFeesMutation.mutate({
      termId: formData.get("termId") as string,
      classId: (formData.get("classId") as string) || undefined,
      amount: parseFloat(formData.get("amount") as string),
    });
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

  const feeColumns = [
    {
      key: "student",
      header: "Student",
      render: (item: any) => (
        <div>
          <p className="font-medium">
            {item.student?.user?.firstName} {item.student?.user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{item.student?.admissionNo}</p>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (item: any) => item.student?.class?.name,
    },
    {
      key: "total",
      header: "Total Fee",
      render: (item: any) => `?${item.totalAmount.toLocaleString()}`,
    },
    {
      key: "paid",
      header: "Amount Paid",
      render: (item: any) => `?${item.amountPaid.toLocaleString()}`,
    },
    {
      key: "balance",
      header: "Balance",
      render: (item: any) => (
        <span className={item.balance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
          ?{item.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge
          variant={
            item.status === "PAID"
              ? "success"
              : item.status === "PARTIALLY_PAID"
              ? "warning"
              : "error"
          }
        >
          {item.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStudent(item.student);
              setIsPaymentModalOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          {item.payments?.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(item.id)}>
              <ReceiptRefundIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const paymentColumns = [
    {
      key: "date",
      header: "Date",
      render: (item: any) => format(new Date(item.date), "MMM d, yyyy h:mm a"),
    },
    {
      key: "student",
      header: "Student",
      render: (item: any) =>
        `${item.fee?.student?.user?.firstName} ${item.fee?.student?.user?.lastName}`,
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: any) => `?${item.amount.toLocaleString()}`,
    },
    {
      key: "method",
      header: "Method",
      render: (item: any) => <Badge variant="info">{item.method}</Badge>,
    },
    {
      key: "recordedBy",
      header: "Recorded By",
      render: (item: any) =>
        item.recordedBy ? `${item.recordedBy.firstName} ${item.recordedBy.lastName}` : "-",
    },
  ];

  if (summaryLoading || reportLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Manage school fees and payments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsInitModalOpen(true)}>
            Initialize Fees
          </Button>
          <Button onClick={() => setIsPaymentModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Total Expected</p>
          <p className="text-2xl font-bold text-gray-900">
            ?{financialReport?.data?.summary?.totalExpected?.toLocaleString() || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">
            ?{financialReport?.data?.summary?.totalCollected?.toLocaleString() || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold text-red-600">
            ?{financialReport?.data?.summary?.totalOutstanding?.toLocaleString() || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Collection Rate</p>
          <p className="text-2xl font-bold text-primary-600">
            {financialReport?.data?.summary?.collectionRate?.toFixed(1) || 0}%
          </p>
        </Card>
      </div>

      {/* Fee Records */}
      <Card title="Fee Records">
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 md:w-64"
        />
        <DataTable
          columns={feeColumns}
          data={financialReport?.data?.fees || []}
          keyExtractor={(item) => item.id}
        />
      </Card>

      {/* Recent Payments */}
      <Card title="Recent Payments">
        <DataTable
          columns={paymentColumns}
          data={financialReport?.data?.recentPayments || []}
          keyExtractor={(item) => item.id}
        />
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Student ID"
            name="studentId"
            defaultValue={selectedStudent?.id}
            required
          />
          <Input label="Amount" name="amount" type="number" required />
          <Select
            label="Payment Method"
            name="method"
            required
            options={[
              { value: "CASH", label: "Cash" },
              { value: "BANK_TRANSFER", label: "Bank Transfer" },
              { value: "POS", label: "POS" },
              { value: "ONLINE", label: "Online" },
            ]}
          />
          <Input label="Reference (Optional)" name="reference" />
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={recordPaymentMutation.isPending}
              className="flex-1"
            >
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Initialize Fees Modal */}
      <Modal
        isOpen={isInitModalOpen}
        onClose={() => setIsInitModalOpen(false)}
        title="Initialize Term Fees"
      >
        <form onSubmit={handleInitializeFees} className="space-y-4">
          <Select
            label="Term"
            name="termId"
            required
            options={[
              { value: feeSummary?.data?.term?.id, label: `${feeSummary?.data?.term?.name} Term` },
            ]}
          />
          <Select
            label="Class (Optional - leave empty for all classes)"
            name="classId"
            options={[
              { value: "", label: "All Classes" },
              { value: "jss1", label: "JSS1" },
              { value: "jss2", label: "JSS2" },
              { value: "jss3", label: "JSS3" },
              { value: "sss1", label: "SSS1" },
              { value: "sss2", label: "SSS2" },
              { value: "sss3", label: "SSS3" },
            ]}
          />
          <Input label="Fee Amount" name="amount" type="number" required />
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsInitModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={initializeFeesMutation.isPending}
              className="flex-1"
            >
              Initialize
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagement;
