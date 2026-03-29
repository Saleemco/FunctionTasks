import api from './api';
import toast from 'react-hot-toast';

export interface StudentFee {
  id: string;
  studentId: string;
  termId: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  receiptNo?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    admissionNo: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    class?: {
      name: string;
      section: string;
    };
  };
  term?: {
    name: string;
    session: {
      year: string;
    };
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  feeId: string;
  amount: number;
  date: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'ONLINE';
  reference?: string;
  recordedBy?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateFeeData {
  studentId: string;
  termId: string;
  totalAmount: number;
}

export interface RecordPaymentData {
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'ONLINE';
  reference?: string;
}

export interface FeeSummary {
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}

export const feeService = {
  // Get all fees
  getAll: async (): Promise<StudentFee[]> => {
    try {
      console.log('💰 Fetching fees from API...');
      const response = await api.get('/fees');
      console.log('✅ Fees response:', response.data);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching fees:', error);
      toast.error('Failed to load fees');
      return [];
    }
  },

  // Get fee by ID
  getById: async (id: string): Promise<StudentFee> => {
    try {
      const response = await api.get('/fees/' + id);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error fetching fee:', error);
      throw error;
    }
  },

  // Get fees by student
  getByStudent: async (studentId: string): Promise<StudentFee[]> => {
    try {
      const response = await api.get('/fees/student/' + studentId);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching student fees:', error);
      return [];
    }
  },

  // Get fees for parent's children - UPDATED with grouping
  getParentFees: async () => {
    try {
      console.log('👪 Fetching parent fees from API...');
      const response = await api.get('/fees/parent');
      console.log('✅ Parent fees response:', response.data);
      
      // The backend returns { data: { fees: [], totalOutstanding: 0 } }
      const result = response.data?.data || { fees: [], totalOutstanding: 0 };
      
      // Transform the data to match the ParentFees component structure
      // Group fees by student
      const feesByStudent: Record<string, any> = {};
      
      result.fees.forEach((fee: any) => {
        const studentId = fee.studentId;
        if (!feesByStudent[studentId]) {
          // Parse name from user.name
          let firstName = 'Unknown';
          let lastName = '';
          if (fee.student?.user?.name) {
            const nameParts = fee.student.user.name.split(' ');
            firstName = nameParts[0] || 'Unknown';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          feesByStudent[studentId] = {
            childName: `${firstName} ${lastName}`.trim(),
            admissionNo: fee.student?.admissionNo || 'N/A',
            class: fee.student?.class,
            fees: []
          };
        }
        feesByStudent[studentId].fees.push({
          id: fee.id,
          studentId: fee.studentId,
          termId: fee.termId,
          totalAmount: fee.totalAmount,
          amountPaid: fee.amountPaid,
          balance: fee.balance,
          status: fee.status,
          term: fee.term,
          payments: fee.payments || []
        });
      });
      
      const groupedFees = Object.values(feesByStudent);
      
      console.log(`✅ Grouped ${groupedFees.length} children with fees`);
      
      return {
        fees: groupedFees,
        totalOutstanding: result.totalOutstanding
      };
    } catch (error: any) {
      console.error('❌ Error fetching parent fees:', error);
      toast.error('Failed to load fees');
      return { fees: [], totalOutstanding: 0 };
    }
  },

  // Create new fee record
  create: async (data: CreateFeeData): Promise<StudentFee> => {
    try {
      console.log('📝 Creating fee record:', data);
      const response = await api.post('/fees', data);
      toast.success('Fee record created successfully');
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('❌ Error creating fee:', error);
      toast.error(error.response?.data?.message || 'Failed to create fee');
      throw error;
    }
  },

  // Record payment
  recordPayment: async (feeId: string, data: RecordPaymentData): Promise<Payment> => {
    try {
      console.log('💵 Recording payment for fee:', feeId, data);
      const response = await api.post('/fees/' + feeId + '/payments', data);
      toast.success('Payment recorded successfully');
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('❌ Error recording payment:', error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
      throw error;
    }
  },

  // Update fee
  update: async (id: string, data: Partial<CreateFeeData>): Promise<StudentFee> => {
    try {
      const response = await api.put('/fees/' + id, data);
      toast.success('Fee updated successfully');
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error updating fee:', error);
      toast.error(error.response?.data?.message || 'Failed to update fee');
      throw error;
    }
  },

  // Delete fee
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete('/fees/' + id);
      toast.success('Fee deleted successfully');
    } catch (error: any) {
      console.error('Error deleting fee:', error);
      toast.error(error.response?.data?.message || 'Failed to delete fee');
      throw error;
    }
  },

  // Get fee summary
  getSummary: async (): Promise<FeeSummary> => {
    try {
      const response = await api.get('/fees/summary');
      return response.data?.data || {
        totalExpected: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        collectionRate: 0
      };
    } catch (error: any) {
      console.error('Error fetching fee summary:', error);
      return {
        totalExpected: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        collectionRate: 0
      };
    }
  },

  // Generate receipt
  generateReceipt: async (feeId: string): Promise<Blob> => {
    try {
      const response = await api.get('/fees/receipt/' + feeId, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
      throw error;
    }
  }
};

export default feeService;