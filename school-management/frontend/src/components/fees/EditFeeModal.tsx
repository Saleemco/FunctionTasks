import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Landmark, Wallet } from 'lucide-react';
import { feeService } from '../../services/fee.service';
import toast from 'react-hot-toast';

interface EditFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fee: any;
}

const paymentMethods = [
  { value: 'CASH', label: 'Cash', icon: DollarSign },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Landmark },
  { value: 'POS', label: 'POS', icon: CreditCard },
  { value: 'ONLINE', label: 'Online', icon: Wallet },
];

export const EditFeeModal = ({ isOpen, onClose, onSuccess, fee }: EditFeeModalProps) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current fee values
  const totalAmount = fee?.totalAmount || 0;
  const amountPaid = fee?.amountPaid || 0;
  const currentBalance = fee?.balance || 0;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentAmount(0);
      setPaymentMethod('CASH');
      setPaymentReference('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentAmount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }
    
    if (paymentAmount > currentBalance) {
      toast.error('Payment cannot exceed the outstanding balance of ₦' + currentBalance.toLocaleString());
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Record the payment
      await feeService.recordPayment(fee.id, {
        amount: paymentAmount,
        method: paymentMethod,
        reference: paymentReference
      });
      
      toast.success('Payment recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fee Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="font-medium text-gray-700 mb-3">Fee Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Fee</p>
              <p className="text-lg font-bold text-gray-900">₦{totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-lg font-bold text-green-600">₦{amountPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-lg font-bold text-red-600">₦{currentBalance.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <p>Student: <span className="font-medium">
              {fee?.student?.user?.firstName} {fee?.student?.user?.lastName}
            </span></p>
            <p>Term: <span className="font-medium">{fee?.term?.name} - {fee?.term?.session?.year}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              min="1"
              max={currentBalance}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Outstanding balance: ₦{currentBalance.toLocaleString()}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              required
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference (Optional)
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Transaction ID / Receipt No."
              disabled={isSubmitting}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPaymentAmount(Math.min(5000, currentBalance))}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                ₦5,000
              </button>
              <button
                type="button"
                onClick={() => setPaymentAmount(Math.min(10000, currentBalance))}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                ₦10,000
              </button>
              <button
                type="button"
                onClick={() => setPaymentAmount(Math.min(20000, currentBalance))}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                ₦20,000
              </button>
              <button
                type="button"
                onClick={() => setPaymentAmount(currentBalance)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Full Balance
              </button>
            </div>
          </div>

          {/* Preview of updated values */}
          {paymentAmount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">After Payment:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-blue-600">New Paid Amount</p>
                  <p className="font-bold">₦{(amountPaid + paymentAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-blue-600">New Balance</p>
                  <p className="font-bold">₦{(currentBalance - paymentAmount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting || paymentAmount <= 0}
            >
              {isSubmitting ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFeeModal;
