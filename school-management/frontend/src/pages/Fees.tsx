import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  Eye,
  Edit,
  Trash2,
  Users
} from 'lucide-react';
import { feeService } from '../services/fee.service';
import { useAuth } from '../context/AuthContext';
import { useTerm } from '../context/TermContext';
import RecordPaymentModal from '../components/fees/RecordPaymentModal';
import CreateFeeModal from '../components/fees/CreateFeeModal';
import CreateBulkFeeModal from '../components/fees/CreateBulkFeeModal';
import EditFeeModal from '../components/fees/EditFeeModal';
import toast from 'react-hot-toast';

export default function Fees() {
  const { user } = useAuth();
  const { selectedTerm, terms, activeTerm } = useTerm();
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Check if user is bursar or admin
  const canManageFees = user?.role === 'BURSAR' || user?.role === 'ADMIN' || user?.role === 'PRINCIPAL';

  // Fetch fees for selected term
  const { data: fees, isLoading: feesLoading } = useQuery({
    queryKey: ['fees', selectedTerm?.id],
    queryFn: () => feeService.getAll({ termId: selectedTerm?.id }),
    enabled: !!selectedTerm,
  });

  // Fetch summary for selected term
  const { data: summary } = useQuery({
    queryKey: ['fee-summary', selectedTerm?.id],
    queryFn: () => feeService.getSummary(selectedTerm?.id),
    enabled: !!selectedTerm,
  });

  // Debug logs
  console.log('📊 Current term:', selectedTerm?.name, selectedTerm?.academicYear);
  console.log('📊 Fees data for term:', fees);
  console.log('📊 Summary data:', summary);

  const handleRecordPayment = (fee: any) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const handleEditFee = (fee: any) => {
    console.log('Editing fee:', fee);
    setSelectedFee(fee);
    setIsEditModalOpen(true);
  };

  const handleDeleteFee = async (feeId: string) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    
    try {
      await feeService.delete(feeId);
      queryClient.invalidateQueries({ queryKey: ['fees', selectedTerm?.id] });
      queryClient.invalidateQueries({ queryKey: ['fee-summary', selectedTerm?.id] });
      toast.success('Fee record deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete fee record');
    }
  };

  // Enhanced get student name helper with multiple fallbacks
  const getStudentName = (fee: any) => {
    if (!fee.student) {
      return 'No Student Linked';
    }
    
    // Try different ways to get the student name
    if (fee.student.user) {
      // Case 1: Has firstName/lastName
      if (fee.student.user.firstName) {
        return `${fee.student.user.firstName} ${fee.student.user.lastName || ''}`.trim();
      }
      // Case 2: Has name field
      if (fee.student.user.name) {
        return fee.student.user.name;
      }
    }
    
    // Case 3: Student has direct name field
    if (fee.student.name) {
      return fee.student.name;
    }
    
    // Fallback to student ID
    return `Student (${fee.studentId?.slice(-4) || 'Unknown'})`;
  };

  if (feesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show message if no term is selected
  if (!selectedTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-4">No term selected</p>
        <p className="text-sm text-gray-400">Please select a term from the dropdown in the header</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm text-gray-500">
            Manage student fees and payments
            <span className="ml-2 text-blue-600 font-medium">
              - {selectedTerm.name} ({selectedTerm.academicYear})
            </span>
            {selectedTerm.isActive && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Active Term
              </span>
            )}
          </p>
        </div>
        {canManageFees && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Bulk Create by Class</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Fee Record</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expected</p>
              <p className="text-2xl font-bold text-gray-900">₦{summary?.totalExpected?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">₦{summary?.totalCollected?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">₦{summary?.totalOutstanding?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.collectionRate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees?.map((fee) => {
                const studentName = getStudentName(fee);
                const statusColor = 
                  fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                  fee.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700';
                
                return (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{studentName}</p>
                        <p className="text-sm text-gray-500">
                          {fee.student?.admissionNo || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee.term?.name || 'N/A'} - {fee.term?.session?.year || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium">₦{fee.totalAmount?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">₦{fee.amountPaid?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-red-600 font-medium">₦{fee.balance?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 text-xs font-medium rounded-full ' + statusColor}>
                        {fee.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canManageFees && fee.status !== 'PAID' && (
                          <button 
                            onClick={() => handleRecordPayment(fee)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageFees && (
                          <>
                            <button 
                              onClick={() => handleEditFee(fee)}
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit Fee"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteFee(fee.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Fee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!fees || fees.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No fee records found for {selectedTerm.name} ({selectedTerm.academicYear}). 
                    {canManageFees && ' Click "Create Fee Record" or "Bulk Create by Class" to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Fee Modal */}
      {canManageFees && (
        <CreateFeeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['fees', selectedTerm?.id] });
            queryClient.invalidateQueries({ queryKey: ['fee-summary', selectedTerm?.id] });
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Bulk Create Fee Modal */}
      {canManageFees && (
        <CreateBulkFeeModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['fees', selectedTerm?.id] });
            queryClient.invalidateQueries({ queryKey: ['fee-summary', selectedTerm?.id] });
            setIsBulkModalOpen(false);
          }}
        />
      )}

      {/* Record Payment Modal */}
      {selectedFee && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedFee(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['fees', selectedTerm?.id] });
            queryClient.invalidateQueries({ queryKey: ['fee-summary', selectedTerm?.id] });
            setIsPaymentModalOpen(false);
            setSelectedFee(null);
          }}
          feeId={selectedFee.id}
          studentName={getStudentName(selectedFee)}
          totalAmount={selectedFee.totalAmount}
          amountPaid={selectedFee.amountPaid}
          balance={selectedFee.balance}
        />
      )}

      {/* Edit Fee Modal */}
      {selectedFee && (
        <EditFeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFee(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['fees', selectedTerm?.id] });
            queryClient.invalidateQueries({ queryKey: ['fee-summary', selectedTerm?.id] });
            setIsEditModalOpen(false);
            setSelectedFee(null);
          }}
          fee={selectedFee}
        />
      )}
    </div>
  );
}