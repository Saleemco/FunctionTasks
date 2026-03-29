import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, BookOpen, X } from 'lucide-react';
import { subjectService } from '../services/subject.service';
import { classService } from '../services/class.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function Subjects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    classIds: [] as string[], // Changed to array for multiple classes
  });
  
  const queryClient = useQueryClient();

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create subject');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subjectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
      setIsModalOpen(false);
      setEditingSubject(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update subject');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', classIds: [] });
  };

  const handleOpenModal = (subject?: any) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        classIds: subject.classes?.map((c: any) => c.id) || [],
      });
    } else {
      setEditingSubject(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleClassSelection = (classId: string) => {
    setFormData(prev => {
      const current = prev.classIds || [];
      if (current.includes(classId)) {
        return { ...prev, classIds: current.filter(id => id !== classId) };
      } else {
        return { ...prev, classIds: [...current, classId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.classIds.length === 0) {
      toast.error('Please select at least one class');
      return;
    }
    
    const submitData = {
      name: formData.name,
      classIds: formData.classIds,
    };
    
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      deleteMutation.mutate(id);
    }
  };

  if (subjectsLoading || classesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects Management</h1>
          <p className="text-sm text-gray-500">Create and manage school subjects</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Subject
        </Button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject: any) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-500">
                    {subject.classes?.length || 0} class(es)
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenModal(subject)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Display classes */}
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Classes:</p>
              <div className="flex flex-wrap gap-2">
                {subject.classes?.map((cls: any) => (
                  <span key={cls.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {cls.name} {cls.section}
                  </span>
                ))}
              </div>
            </div>

            {/* Display teacher if assigned */}
            {subject.teacher && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Teacher:</span>{' '}
                {subject.teacher.user?.firstName} {subject.teacher.user?.lastName}
              </div>
            )}
          </Card>
        ))}

        {(!subjects || subjects.length === 0) && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No subjects found</p>
            <p className="text-sm text-gray-400">Click "Add New Subject" to create your first subject</p>
          </div>
        )}
      </div>

      {/* Add/Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Classes * (at least one)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                  {classes?.map((cls: any) => (
                    <label key={cls.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.classIds.includes(cls.id)}
                        onChange={() => handleClassSelection(cls.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {cls.name} {cls.section}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.classIds.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one class</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingSubject ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
