import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feeService } from '../services/fee.service';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ReceiptRefundIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ParentFees() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-fees'],
    queryFn: feeService.getParentFees,
  });

  const handleDownloadReceipt = async (feeId: string) => {
    try {
      const blob = await feeService.generateReceipt(feeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt-' + feeId + '.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">Error loading fee records: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const fees = data?.fees || [];
  const totalOutstanding = data?.totalOutstanding || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Children's Fees</h1>
          <p className="text-gray-600">View and manage fees for all your children</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ReceiptRefundIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                ₦{totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {fees.length} child{fees.length !== 1 ? 'ren' : ''} with fee records
          </div>
        </div>
      </Card>

      {/* Fees by Child Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fees.map((childData: any) => 
              childData.fees.map((fee: any, index: number) => {
                const statusColor = 
                  fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                  fee.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700';
                
                // Show child name only on first row of each child
                const showChildName = index === 0;
                
                return (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    {showChildName && (
                      <td className="px-6 py-4" rowSpan={childData.fees.length}>
                        <div className="font-medium text-gray-900">{childData.childName}</div>
                        <div className="text-sm text-gray-500">Adm: {childData.admissionNo}</div>
                      </td>
                    )}
                    {showChildName && (
                      <td className="px-6 py-4" rowSpan={childData.fees.length}>
                        <span className="text-sm text-gray-600">
                          {childData.class?.name || 'N/A'} {childData.class?.section || ''}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee.term?.name || 'N/A'} - {fee.term?.session?.year || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">₦{fee.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">₦{fee.amountPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">₦{fee.balance.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 text-xs font-medium rounded-full ' + statusColor}>
                        {fee.status === 'PARTIALLY_PAID' ? 'PARTIALLY PAID' : fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {fee.payments?.length > 0 && (
                        <button
                          onClick={() => handleDownloadReceipt(fee.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download Receipt"
                        >
                          <ReceiptRefundIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
            {fees.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No fee records found for your children
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}