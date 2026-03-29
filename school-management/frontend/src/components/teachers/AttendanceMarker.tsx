import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface AttendanceMarkerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  students: any[];
}

export const AttendanceMarker = ({
  isOpen,
  onClose,
  onSubmit,
  students,
}: AttendanceMarkerProps) => {
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = () => {
    const attendanceList = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));
    onSubmit({ date: new Date().toISOString(), attendances: attendanceList });
  };

  const getStatusButtonClass = (studentId: string, status: string, defaultColor: string, activeColor: string) => {
    if (attendance[studentId] === status) {
      return activeColor;
    }
    return defaultColor;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Attendance" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Mark attendance for {new Date().toLocaleDateString()}
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-500">Admission: {student.admissionNo}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, "PRESENT")}
                  className={`p-2 rounded-lg transition-colors ${
                    getStatusButtonClass(student.id, "PRESENT", "bg-gray-100 text-gray-400 hover:bg-green-50", "bg-green-100 text-green-700")
                  }`}
                  title="Present"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, "ABSENT")}
                  className={`p-2 rounded-lg transition-colors ${
                    getStatusButtonClass(student.id, "ABSENT", "bg-gray-100 text-gray-400 hover:bg-red-50", "bg-red-100 text-red-700")
                  }`}
                  title="Absent"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, "LATE")}
                  className={`p-2 rounded-lg transition-colors ${
                    getStatusButtonClass(student.id, "LATE", "bg-gray-100 text-gray-400 hover:bg-yellow-50", "bg-yellow-100 text-yellow-700")
                  }`}
                  title="Late"
                >
                  <ClockIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} className="flex-1">
            Save Attendance
          </Button>
        </div>
      </div>
    </Modal>
  );
};