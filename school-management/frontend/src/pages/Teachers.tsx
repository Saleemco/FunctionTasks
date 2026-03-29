import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, BookOpen, Users, Trash2, Edit, Eye } from 'lucide-react';
import { teacherService } from '../services/teacher.service';
import { AddTeacherModal } from '../components/teachers/AddTeacherModal';
import toast from 'react-hot-toast';

export default function Teachers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: teacherService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: teacherService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500">Manage all teachers and their assignments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers?.map((teacher: any) => (
          <div key={teacher.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header with name and actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-blue-600">
                      {teacher.name?.charAt(0) || teacher.firstName?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{teacher.name || teacher.firstName + ' ' + teacher.lastName || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button 
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                    title="Edit teacher"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(teacher.id, teacher.name || teacher.firstName)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    title="Delete teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Classes Section */}
              <div className="mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Classes:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacher.classes?.length > 0 ? (
                    teacher.classes.map((cls: any) => (
                      <span key={cls.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {cls.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No classes assigned</span>
                  )}
                </div>
              </div>

              {/* Subjects Section */}
              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">Subjects:</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {teacher.subjects?.length > 0 ? (
                    teacher.subjects.map((subject: any) => (
                      <span key={subject.id} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                        {subject.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No subjects assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!teachers || teachers.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No teachers found</p>
            <p className="text-sm">Click "Add Teacher" to create one</p>
          </div>
        )}
      </div>

      <AddTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['teachers'] });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}