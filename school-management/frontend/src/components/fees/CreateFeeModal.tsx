import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { feeService, CreateFeeData } from '../../services/fee.service';
import { studentService } from '../../services/student.service';
import { termService } from '../../services/term.service';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface CreateFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateFeeModal = ({ isOpen, onClose, onSuccess }: CreateFeeModalProps) => {
  const [formData, setFormData] = useState<CreateFeeData>({
    studentId: '',
    termId: '',
    totalAmount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAll,
  });

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['terms'],
    queryFn: termService.getAll,
  });

  const { data: activeTerm } = useQuery({
    queryKey: ['active-term'],
    queryFn: termService.getActive,
  });

  // Set active term as default when available
  useEffect(() => {
    if (activeTerm && !formData.termId && isOpen) {
      setFormData(prev => ({ ...prev, termId: activeTerm.id }));
    }
  }, [activeTerm, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalAmount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }
    
    if (!formData.termId) {
      toast.error('Please select a term');
      return;
    }
    
    if (formData.totalAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedStudent = students?.find(s => s.id === formData.studentId);
      const selectedTerm = terms?.find(t => t.id === formData.termId);
      
      console.log('📝 Creating fee for student:', selectedStudent);
      console.log('📝 Fee data:', formData);
      console.log('📝 Selected term:', selectedTerm);
      
      const result = await feeService.create(formData);
      console.log('✅ Fee created result:', result);
      
      toast.success('Fee record created successfully');
      onSuccess();
      onClose();
      setFormData({ studentId: '', termId: activeTerm?.id || '', totalAmount: 0 });
    } catch (error: any) {
      console.error('❌ Error creating fee:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create fee record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeTermData = terms?.find(t => t.id === activeTerm?.id);
  const isLoading = studentsLoading || termsLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create Fee Record</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Student <span className="text-red-500">*</span>
            </label>
            <select
              name="studentId"
              required
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || studentsLoading}
            >
              <option value="">Choose a student</option>
              {students?.map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} {student.admissionNo ? `- ${student.admissionNo}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Term <span className="text-red-500">*</span>
            </label>
            <select
              name="termId"
              required
              value={formData.termId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || termsLoading}
            >
              <option value="">Choose a term</option>
              {terms?.map((term: any) => (
                <option key={term.id} value={term.id}>
                  {term.name} - {term.academicYear} {term.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Amount (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalAmount"
              required
              min="1"
              step="0.01"
              value={formData.totalAmount}
              onChange={handleChange}
              placeholder="25000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {activeTermData && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Active Term:</strong> {activeTermData.name} - {activeTermData.academicYear}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Dates: {new Date(activeTermData.startDate).toLocaleDateString()} to {new Date(activeTermData.endDate).toLocaleDateString()}
              </p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Creating...' : 'Create Fee Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFeeModal;