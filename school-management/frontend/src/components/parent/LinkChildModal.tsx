import { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { studentService } from '../../services/student.service';
import { parentService } from '../../services/parent.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface LinkChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LinkChildModal = ({ isOpen, onClose, onSuccess }: LinkChildModalProps) => {
  const [admissionNo, setAdmissionNo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState<any>(null);
  const [isLinking, setIsLinking] = useState(false);
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!admissionNo.trim()) {
      toast.error('Please enter an admission number');
      return;
    }

    setIsSearching(true);
    setFoundStudent(null);

    try {
      const students = await studentService.getAll();
      const student = students.find(s => 
        s.admissionNo.toLowerCase() === admissionNo.trim().toLowerCase()
      );

      if (student) {
        setFoundStudent(student);
        toast.success('Student found!');
      } else {
        toast.error('No student found with that admission number');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      toast.error('Failed to search for student');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLink = async () => {
    if (!foundStudent) return;

    setIsLinking(true);

    try {
      const parent = await parentService.getByUserId(user?.id);
      
      await studentService.update(foundStudent.id, {
        parentId: parent.id
      });

      toast.success('Successfully linked to ' + foundStudent.user?.firstName + ' ' + foundStudent.user?.lastName);
      onSuccess();
      onClose();
      setAdmissionNo('');
      setFoundStudent(null);
    } catch (error: any) {
      console.error('Error linking student:', error);
      toast.error(error.response?.data?.message || 'Failed to link student');
    } finally {
      setIsLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Link Your Child</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!foundStudent ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your child's admission number to link them to your account.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g., ADM2024001"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSearching ? '...' : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Student Found!</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {foundStudent.user?.firstName} {foundStudent.user?.lastName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Admission No:</span> {foundStudent.admissionNo}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Class:</span> {foundStudent.class?.name} {foundStudent.class?.section || ''}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Would you like to link this student to your account?
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setFoundStudent(null);
                    setAdmissionNo('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleLink}
                  disabled={isLinking}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLinking ? 'Linking...' : <UserPlus className="w-4 h-4" />}
                  Link Child
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkChildModal;