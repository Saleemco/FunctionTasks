import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, UserCheck, GraduationCap, UserX, Edit, Trash2, Eye, Upload } from 'lucide-react'
import { studentService } from '../services/student.service'
import { teacherService } from '../services/teacher.service'
import { useAuth } from '../context/AuthContext'
import { AddStudentModal } from '../components/students/AddStudentModal'
import ExcelImportCustomModal from '../components/students/ExcelImportCustomModal'
import toast from 'react-hot-toast'

export default function Students() {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [teacherInfo, setTeacherInfo] = useState<any>(null)
  const queryClient = useQueryClient()

  // Fetch students based on user role
  const { data: students, isLoading, refetch } = useQuery({
    queryKey: ['students', user?.role, teacherInfo?.id],
    queryFn: async () => {
      // If user is a teacher, fetch only their students
      if (user?.role === 'TEACHER') {
        // Get teacher profile first if not already loaded
        let teacherProfile = teacherInfo;
        if (!teacherProfile && user.id) {
          teacherProfile = await teacherService.getByUserId(user.id);
          setTeacherInfo(teacherProfile);
        }
        
        if (teacherProfile) {
          return await studentService.getByTeacher(teacherProfile.id);
        }
        return [];
      }
      // For admin/principal, get all students
      return await studentService.getAll();
    },
    enabled: true,
  })

  // Fetch teacher info when user is a teacher
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (user?.role === 'TEACHER' && user.id) {
        const teacherProfile = await teacherService.getByUserId(user.id);
        setTeacherInfo(teacherProfile);
        // Refetch students after getting teacher info
        refetch();
      }
    };
    fetchTeacherInfo();
  }, [user]);

  console.log('Students data:', students)

  const deleteMutation = useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('Student deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete student')
    },
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id)
    }
  }

  // Calculate stats
  const totalStudents = students?.length || 0
  const activeStudents = students?.filter(s => s.status === 'Active').length || 0
  const inactiveStudents = students?.filter(s => s.status === 'Inactive').length || 0

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'TEACHER' ? 'My Students' : 'Students'}
          </h1>
          <p className="text-sm text-gray-500">
            {user?.role === 'TEACHER' 
              ? `Students from your assigned classes: ${teacherInfo?.classes?.map((c: any) => c.name).join(', ') || 'No classes assigned'}`
              : 'Manage all student records'}
          </p>
        </div>
        {/* Only show Add buttons for Admin/Principal */}
        {user?.role !== 'TEACHER' && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activeStudents}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-sm text-gray-500">Graduated</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{inactiveStudents}</div>
              <div className="text-sm text-gray-500">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {user?.role !== 'TEACHER' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students?.map((student: any) => {
                // Get name from user object
                const firstName = student.user?.firstName || student.firstName || 'Unknown';
                const lastName = student.user?.lastName || student.lastName || 'Student';
                const fullName = firstName + ' ' + lastName;
                const email = student.user?.email || student.email || 'No email';
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {(firstName[0] || '') + (lastName[0] || '')}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.admissionNo || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.class ? student.class.name + (student.class.section ? ' - ' + student.class.section : '') : 
                       student.className || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                    {user?.role !== 'TEACHER' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={user?.role !== 'TEACHER' ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    {user?.role === 'TEACHER' 
                      ? 'No students found in your assigned classes.' 
                      : 'No students found. Click "Add New Student" or "Import Excel" to add students.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal - Only show for non-teachers */}
      {user?.role !== 'TEACHER' && (
        <AddStudentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
            setIsModalOpen(false)
          }}
        />
      )}

      {/* Excel Import Modal - Only show for non-teachers */}
      {user?.role !== 'TEACHER' && (
        <ExcelImportCustomModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
            setIsImportModalOpen(false)
          }}
        />
      )}
    </div>
  )
}