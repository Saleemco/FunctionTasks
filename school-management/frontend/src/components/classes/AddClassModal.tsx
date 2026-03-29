import { useState } from 'react';
import { X } from 'lucide-react';
import { classService, CreateClassData } from '../../services/class.service';
import { teacherService, Teacher } from '../../services/teacher.service';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Nigerian school classes
const NIGERIAN_CLASSES = [
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SSS 1',
  'SSS 2',
  'SSS 3',
];

const SECTIONS = ['A', 'B', 'C', 'General', 'Science', 'Art', 'Commercial'];

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddClassModal = ({ isOpen, onClose, onSuccess }: AddClassModalProps) => {
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    section: '',
    classTeacherId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: teacherService.getAll,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log('Form field', name, 'changed to:', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validate form
    if (!formData.name || !formData.section) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission - convert empty string to undefined/null
      const submitData = {
        name: formData.name,
        section: formData.section,
        // If classTeacherId is empty string, send null instead
        classTeacherId: formData.classTeacherId === '' ? null : formData.classTeacherId
      };
      
      console.log('Sending request to create class with data:', submitData);
      const result = await classService.create(submitData);
      console.log('Class created successfully:', result);
      toast.success('Class created successfully');
      onSuccess();
      onClose();
      // Reset form
      setFormData({ name: '', section: '', classTeacherId: '' });
    } catch (error: any) {
      console.error('Error creating class:', error);
      
      // Show the error message
      if (error.response) {
        console.error('Server response:', error.response.data);
        const errorMessage = error.response.data?.message || 'Server error: ' + error.response.status;
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('No response from server');
        toast.error('Cannot connect to server. Is the backend running?');
      } else {
        console.error('Error message:', error.message);
        toast.error('Failed to create class: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Class</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name <span className="text-red-500">*</span>
            </label>
            <select
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select Class</option>
              {NIGERIAN_CLASSES.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select Section</option>
              {SECTIONS.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Teacher
            </label>
            <select
              name="classTeacherId"
              value={formData.classTeacherId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || teachersLoading}
            >
              <option value="">None (No Class Teacher)</option>
              {teachers?.map((teacher: Teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user?.firstName} {teacher.user?.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
