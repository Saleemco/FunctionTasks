import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboard.service";
import { feeService } from "../../services/fee.service";
import { SearchBar } from "../ui/SearchBar";
import { useSearch } from "../../hooks/useSearch";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { format } from "date-fns";

export const BursarDashboard = () => {
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const getBursarName = () => {
    if (!user) return "Bursar";
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return "Bursar";
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["bursar-dashboard"],
    queryFn: dashboardService.getBursarDashboard,
  });

  const recentPayments = data?.recentPayments || [];
  
  const filteredPayments = useSearch(
    recentPayments,
    ['studentName', 'method'],
    (payment: any, term: string) => {
      return payment.studentName?.toLowerCase().includes(term) ||
             payment.method?.toLowerCase().includes(term) ||
             payment.amount?.toString().includes(term);
    }
  );

  const recordPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => feeService.recordPayment(paymentData.feeId, paymentData),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      setShowPaymentModal(false);
      queryClient.invalidateQueries({ queryKey: ["bursar-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["fee-summary"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    },
  });

  const handleRecordPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    recordPaymentMutation.mutate({
      feeId: formData.get("feeId") as string,
      amount: parseFloat(formData.get("amount") as string),
      method: formData.get("method") as string,
      reference: formData.get("reference") as string,
    });
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
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-red-600 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const summary = data?.summary || {
    totalExpected: 0,
    totalPaid: 0,
    outstanding: 0,
    collectionRate: "0",
    totalFees: 0
  };
  
  const breakdown = data?.breakdown || {
    paid: 0,
    pending: 0,
    partial: 0,
    overdue: 0
  };

  const stats = [
    {
      name: "Total Expected",
      value: `₦${summary.totalExpected?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      color: "bg-blue-500",
      description: "Total fees expected from all students"
    },
    {
      name: "Total Collected",
      value: `₦${summary.totalPaid?.toLocaleString() || 0}`,
      icon: ArrowTrendingUpIcon,
      color: "bg-green-500",
      description: "Total amount collected so far"
    },
    {
      name: "Outstanding",
      value: `₦${summary.outstanding?.toLocaleString() || 0}`,
      icon: ChartBarIcon,
      color: "bg-red-500",
      description: "Amount still pending"
    },
    {
      name: "Collection Rate",
      value: `${summary.collectionRate || 0}%`,
      icon: UsersIcon,
      color: "bg-purple-500",
      description: "Percentage of total fees collected"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bursar Dashboard</h1>
          <p className="text-gray-600">Welcome back, {getBursarName()}! Manage school fees and payments</p>
          <p className="text-sm text-gray-500 mt-1">
            Total Fee Records: {summary.totalFees}
          </p>
        </div>
        <Button onClick={() => setShowPaymentModal(true)}>
          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">Fully Paid</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{breakdown.paid}</p>
          <p className="text-xs text-green-600 mt-1">Fees fully settled</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCardIcon className="w-5 h-5 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-700">Partial Payments</p>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{breakdown.partial}</p>
          <p className="text-xs text-yellow-600 mt-1">Partially paid fees</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">Pending</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{breakdown.pending}</p>
          <p className="text-xs text-red-600 mt-1">No payment made</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-700">Overdue</p>
          </div>
          <p className="text-2xl font-bold text-orange-700">{breakdown.overdue}</p>
          <p className="text-xs text-orange-600 mt-1">Past due date</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Payments">
          <div className="space-y-4">
            <SearchBar
              onSearch={setPaymentSearchTerm}
              placeholder="Search payments by student name, method, or amount..."
            />
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPayments.filteredItems.length > 0 ? (
                filteredPayments.filteredItems.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{payment.studentName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(payment.date), "MMM dd, yyyy - h:mm a")}
                      </p>
                      <Badge variant="info" size="sm" className="mt-1">
                        {payment.method}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₦{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Recorded by: {payment.recordedBy}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {paymentSearchTerm ? "No payments found matching your search" : "No recent payments recorded"}
                  </p>
                </div>
              )}
            </div>
            {paymentSearchTerm && filteredPayments.filteredItems.length > 0 && (
              <p className="text-xs text-gray-400">
                Found {filteredPayments.filteredItems.length} payment(s)
              </p>
            )}
          </div>
        </Card>

        <Card title="Fee Collection Summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Fee Records</span>
              <span className="text-lg font-bold">{summary.totalFees}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Expected</span>
              <span className="text-lg font-bold">₦{summary.totalExpected?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Collected</span>
              <span className="text-lg font-bold text-green-600">₦{summary.totalPaid?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Outstanding</span>
              <span className="text-lg font-bold text-red-600">₦{summary.outstanding?.toLocaleString() || 0}</span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-700 font-medium mb-2">Collection Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(summary.collectionRate), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  {summary.collectionRate}% of total fees collected
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Fee ID"
            name="feeId"
            required
            placeholder="Enter Fee ID"
          />
          <Input
            label="Amount"
            name="amount"
            type="number"
            required
            placeholder="Enter amount"
          />
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
          <Input
            label="Reference (Optional)"
            name="reference"
            placeholder="Transaction reference"
          />
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
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
    </div>
  );
};

export default BursarDashboard;