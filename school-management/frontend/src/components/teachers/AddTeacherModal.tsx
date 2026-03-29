import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserPlus, BookOpen, Users } from 'lucide-react';
import { teacherService } from '../../services/teacher.service';
import { classService } from '../../services/class.service';
import { subjectService } from '../../services/subject.service';
import toast from 'react-hot-toast';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTeacherModal = ({ isOpen, onClose, onSuccess }: AddTeacherModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    classIds: [] as string[],
    subjectIds: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getAll,
  });

  // Fetch subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });

  const createTeacherMutation = useMutation({
    mutationFn: teacherService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher created successfully');
      onSuccess();
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create teacher');
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      classIds: [],
      subjectIds: [],
    });
  };

  const handleClassToggle = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter teacher email');
      return;
    }
    
    if (formData.classIds.length === 0) {
      toast.error('Please select at least one class');
      return;
    }
    
    if (formData.subjectIds.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createTeacherMutation.mutateAsync({
        email: formData.email,
        classIds: formData.classIds,
        subjectIds: formData.subjectIds,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isLoading = classesLoading || subjectsLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Teacher</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="teacher@school.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              A user account will be created with this email
            </p>
          </div>

          {/* Classes Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Classes They Teach <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading classes...</div>
              ) : classes && classes.length > 0 ? (
                classes.map((cls: any) => (
                  <label
                    key={cls.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.classIds.includes(cls.id)}
                      onChange={() => handleClassToggle(cls.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cls.name}</span>
                    {cls.section && (
                      <span className="text-xs text-gray-500">({cls.section})</span>
                    )}
                  </label>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No classes available. Please create classes first.
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.classIds.length} class(es)
            </p>
          </div>

          {/* Subjects Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Subjects They Teach <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading subjects...</div>
              ) : subjects && subjects.length > 0 ? (
                subjects.map((subject: any) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjectIds.includes(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{subject.name}</span>
                    {subject.classes && subject.classes.length > 0 && (
                      <span className="text-xs text-gray-500">
                        ({subject.classes.map((c: any) => c.name).join(', ')})
                      </span>
                    )}
                  </label>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No subjects available. Please create subjects first.
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.subjectIds.length} subject(s)
            </p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Summary</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="font-medium">{formData.email || '(not set)'}</span>
              </p>
              <p>
                <span className="text-gray-500">Classes:</span>{' '}
                <span className="font-medium">{formData.classIds.length} selected</span>
              </p>
              <p>
                <span className="text-gray-500">Subjects:</span>{' '}
                <span className="font-medium">{formData.subjectIds.length} selected</span>
              </p>
            </div>
          </div>

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
              disabled={isSubmitting || !formData.email || formData.classIds.length === 0 || formData.subjectIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;