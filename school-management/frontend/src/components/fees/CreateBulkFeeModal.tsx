import { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, DollarSign, CheckCircle, Loader2, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '../../services/class.service';
import { termService, Term } from '../../services/term.service';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface CreateBulkFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClassFee {
  classId: string;
  className: string;
  amount: number;
  selected: boolean;
  studentCount: number;
}

export const CreateBulkFeeModal = ({ isOpen, onClose, onSuccess }: CreateBulkFeeModalProps) => {
  const [selectedTermId, setSelectedTermId] = useState('');
  const [classFees, setClassFees] = useState<ClassFee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const queryClient = useQueryClient();

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getAll,
  });

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['terms'],
    queryFn: termService.getAll,
  });

  const { data: activeTerm } = useQuery({
    queryKey: ['active-term'],
    queryFn: termService.getActive,
  });

  // Initialize class fees when classes load
  useEffect(() => {
    if (classes && classes.length > 0) {
      const initialClassFees = classes.map((cls: any) => ({
        classId: cls.id,
        className: cls.name,
        amount: 0,
        selected: true,
        studentCount: cls._count?.students || 0
      }));
      setClassFees(initialClassFees);
    }
  }, [classes]);

  // Set active term as default
  useEffect(() => {
    if (activeTerm && !selectedTermId && isOpen) {
      setSelectedTermId(activeTerm.id);
    }
  }, [activeTerm, isOpen]);

  const handleClassToggle = (index: number) => {
    const updated = [...classFees];
    updated[index].selected = !updated[index].selected;
    setClassFees(updated);
    setSelectAll(updated.every(cf => cf.selected));
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setClassFees(classFees.map(cf => ({ ...cf, selected: newSelectAll })));
  };

  const handleAmountChange = (index: number, amount: number) => {
    const updated = [...classFees];
    updated[index].amount = amount;
    setClassFees(updated);
  };

  const handleSetAllAmounts = (amount: number) => {
    setClassFees(classFees.map(cf => ({ ...cf, amount })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTermId) {
      toast.error('Please select a term');
      return;
    }
    
    const selectedClasses = classFees.filter(cf => cf.selected && cf.amount > 0);
    
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class with a valid fee amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create fees for each selected class
      const results = await Promise.all(
        selectedClasses.map(async (classFee) => {
          // Get all students in this class
          const studentsResponse = await api.get(`/students?classId=${classFee.classId}`);
          const students = studentsResponse.data || [];
          
          const feePromises = students.map((student: any) => 
            api.post('/fees', {
              studentId: student.id,
              termId: selectedTermId,
              totalAmount: classFee.amount
            })
          );
          
          return Promise.all(feePromises);
        })
      );
      
      const totalFeesCreated = results.flat().length;
      
      toast.success(`Successfully created ${totalFeesCreated} fee records for ${selectedClasses.length} classes`);
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fee-summary'] });
      onSuccess();
      onClose();
      
      // Reset form
      setSelectAll(true);
      setClassFees(classFees.map(cf => ({ ...cf, amount: 0, selected: true })));
      
    } catch (error: any) {
      console.error('Error creating bulk fees:', error);
      toast.error(error.response?.data?.message || 'Failed to create fee records');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTerm = terms?.find(t => t.id === selectedTermId);
  const totalSelectedClasses = classFees.filter(cf => cf.selected && cf.amount > 0).length;
  const totalAmount = classFees.reduce((sum, cf) => sum + (cf.selected ? cf.amount : 0), 0);
  const estimatedTotalFees = classFees.reduce((sum, cf) => sum + (cf.selected ? cf.amount * cf.studentCount : 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Fee Creation</h2>
            <p className="text-sm text-gray-500 mt-1">Create fees for entire classes at once</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Term Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Term <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || termsLoading}
              required
            >
              <option value="">Select a term</option>
              {terms?.map((term: Term) => (
                <option key={term.id} value={term.id}>
                  {term.name} - {term.academicYear} {term.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
            {selectedTerm && (
              <p className="text-xs text-blue-600 mt-2">
                Dates: {new Date(selectedTerm.startDate).toLocaleDateString()} - {new Date(selectedTerm.endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleSetAllAmounts(50000)}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Set All: ₦50,000
              </button>
              <button
                type="button"
                onClick={() => handleSetAllAmounts(75000)}
                className="text-sm text-green-600 hover:text-green-700"
              >
                ₦75,000
              </button>
              <button
                type="button"
                onClick={() => handleSetAllAmounts(100000)}
                className="text-sm text-green-600 hover:text-green-700"
              >
                ₦100,000
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Selected: {totalSelectedClasses} classes | Total Class Fee: ₦{totalAmount.toLocaleString()} | Total to Collect: ₦{estimatedTotalFees.toLocaleString()}
            </div>
          </div>

          {/* Classes Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Amount (₦)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total for Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classesLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                      </td>
                    </tr>
                  ) : (
                    classFees.map((classFee, index) => (
                      <tr key={classFee.classId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={classFee.selected}
                            onChange={() => handleClassToggle(index)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                            disabled={isSubmitting}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{classFee.className}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {classFee.studentCount} students
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={classFee.amount || ''}
                            onChange={(e) => handleAmountChange(index, parseFloat(e.target.value) || 0)}
                            placeholder="Enter amount"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={!classFee.selected || isSubmitting}
                          />
                        </td>
                        <td className="px-6 py-4">
                          {classFee.amount > 0 && (
                            <span className="text-sm font-medium text-gray-900">
                              ₦{(classFee.amount * classFee.studentCount).toLocaleString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          {totalSelectedClasses > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Summary</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalSelectedClasses} class{totalSelectedClasses !== 1 ? 'es' : ''} selected
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount to Collect</p>
                  <p className="text-2xl font-bold text-blue-600">₦{estimatedTotalFees.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This will create fee records for all students in selected classes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              disabled={isSubmitting || totalSelectedClasses === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Create Fee Records for {totalSelectedClasses} Class{totalSelectedClasses !== 1 ? 'es' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBulkFeeModal;