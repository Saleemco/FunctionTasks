import { useState } from 'react';
import { X } from 'lucide-react';
import { studentService, CreateStudentData } from '../../services/student.service';
import { classService, Class } from '../../services/class.service';
import { parentService, Parent } from '../../services/parent.service';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddStudentModal = ({ isOpen, onClose, onSuccess }: AddStudentModalProps) => {
  const [formData, setFormData] = useState<CreateStudentData>({
    firstName: '',
    lastName: '',
    email: '',
    admissionNo: '',
    classId: '',
    parentId: '',
    gender: '',
    dob: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getAll,
  });

  const { data: parents } = useQuery({
    queryKey: ['parents'],
    queryFn: parentService.getAll,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.classId || !formData.admissionNo || !formData.gender) {
      toast.error('Please fill in all required fields (First Name, Last Name, Class, Admission Number, and Gender are required)');
      return;
    }
    
    setIsSubmitting(true);
    
    const submitData = {
      ...formData,
      // If email is empty, don't send it (backend will generate one)
      email: formData.email || undefined,
      parentId: formData.parentId === '' ? null : formData.parentId,
      dob: formData.dob === '' ? null : formData.dob
    };
    
    try {
      await studentService.create(submitData);
      toast.success('Student created successfully');
      onSuccess();
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        admissionNo: '',
        classId: '',
        parentId: '',
        gender: '',
        dob: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="firstName" 
                required 
                value={formData.firstName} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                disabled={isSubmitting} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="lastName" 
                required 
                value={formData.lastName} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                disabled={isSubmitting} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-400 text-xs">(optional - will be auto-generated if empty)</span>
            </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="student@example.com" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              disabled={isSubmitting} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission No <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="admissionNo" 
                required 
                value={formData.admissionNo} 
                onChange={handleChange} 
                placeholder="e.g., STU240001" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                disabled={isSubmitting} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select 
                name="classId" 
                required 
                value={formData.classId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                disabled={isSubmitting}
              >
                <option value="">Select Class</option>
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? '- ' + cls.section : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select 
                name="gender" 
                required 
                value={formData.gender} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                disabled={isSubmitting}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
              <select 
                name="parentId" 
                value={formData.parentId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                disabled={isSubmitting}
              >
                <option value="">None</option>
                {parents?.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.user?.firstName} {parent.user?.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange} 
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;