import { useState } from 'react';
import { X, DollarSign, CreditCard, Landmark, Wallet } from 'lucide-react';
import { feeService, RecordPaymentData } from '../../services/fee.service';
import toast from 'react-hot-toast';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feeId: string;
  studentName: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
}

const paymentMethods = [
  { value: 'CASH', label: 'Cash', icon: DollarSign },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Landmark },
  { value: 'POS', label: 'POS', icon: CreditCard },
  { value: 'ONLINE', label: 'Online', icon: Wallet },
];

export const RecordPaymentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  feeId,
  studentName,
  totalAmount,
  amountPaid,
  balance
}: RecordPaymentModalProps) => {
  const [formData, setFormData] = useState<RecordPaymentData>({
    amount: balance,
    method: 'CASH',
    reference: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    
    if (formData.amount > balance) {
      toast.error('Amount cannot exceed balance');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await feeService.recordPayment(feeId, formData);
      toast.success('Payment recorded successfully');
      onSuccess();
      onClose();
      setFormData({ amount: balance, method: 'CASH', reference: '' });
    } catch (error: any) {
      console.error('Error recording payment:', error);
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

        <div className="p-6 border-b bg-gray-50">
          <p className="text-sm text-gray-600">Student: <span className="font-medium">{studentName}</span></p>
          <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
            <div>
              <p className="text-gray-500">Total Fee</p>
              <p className="font-bold">₦{totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Paid</p>
              <p className="font-bold text-green-600">₦{amountPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Balance</p>
              <p className="font-bold text-red-600">₦{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                name="amount"
                required
                min="1"
                max={balance}
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Max: ₦{balance.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="method"
              required
              value={formData.method}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference (Optional)
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Transaction ID / Receipt No."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
