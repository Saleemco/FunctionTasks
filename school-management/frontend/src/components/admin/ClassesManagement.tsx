import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { DataTable } from "../ui/DataTable";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "../../services/api";

export const ClassesManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await api.get("/classes");
      return res.data;
    },
  });

  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await api.get("/users", { params: { role: "SUBJECT_TEACHER" } });
      return res.data;
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/classes", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Class created successfully");
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create class");
    },
  });

  const assignTeacherMutation = useMutation({
    mutationFn: async ({ classId, teacherId }: { classId: string; teacherId: string }) => {
      const res = await api.post("/users/assign-class-teacher", { classId, teacherId });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Class teacher assigned successfully");
      setShowAssignTeacherModal(false);
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign teacher");
    },
  });

  const handleCreateClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createClassMutation.mutate({
      name: formData.get("name") as string,
      section: formData.get("section") as string,
    });
  };

  const handleAssignTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    assignTeacherMutation.mutate({
      classId: selectedClass.id,
      teacherId: formData.get("teacherId") as string,
    });
  };

  const columns = [
    { key: "name", header: "Class Name" },
    { key: "section", header: "Section" },
    {
      key: "classTeacher",
      header: "Class Teacher",
      render: (item: any) =>
        item.classTeacher ? (
          `${item.classTeacher.user?.firstName} ${item.classTeacher.user?.lastName}`
        ) : (
          <Badge variant="warning">Not Assigned</Badge>
        ),
    },
    {
      key: "students",
      header: "Students",
      render: (item: any) => item._count?.students || 0,
    },
    {
      key: "subjects",
      header: "Subjects",
      render: (item: any) => item._count?.subjects || 0,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedClass(item);
            setShowAssignTeacherModal(true);
          }}
        >
          Assign Teacher
        </Button>
      ),
    },
  ];

  const teacherOptions =
    teachersData?.data?.map((teacher: any) => ({
      value: teacher.teacherProfile?.id,
      label: `${teacher.firstName} ${teacher.lastName}`,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600">Manage classes and assign teachers</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Class
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={classesData?.data || []}
          keyExtractor={(item) => item.id}
          isLoading={classesLoading}
        />
      </Card>

      {/* Create Class Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Class"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Name</label>
              <select name="name" className="input-field" required>
                <option value="">Select...</option>
                <option value="JSS1">JSS1</option>
                <option value="JSS2">JSS2</option>
                <option value="JSS3">JSS3</option>
                <option value="SSS1">SSS1</option>
                <option value="SSS2">SSS2</option>
                <option value="SSS3">SSS3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Section (Optional)</label>
              <input name="section" className="input-field" placeholder="A, B, C..." />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createClassMutation.isPending}
              className="flex-1"
            >
              Create Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={showAssignTeacherModal}
        onClose={() => setShowAssignTeacherModal(false)}
        title={`Assign Teacher to ${selectedClass?.name}`}
      >
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <Select
            label="Select Class Teacher"
            name="teacherId"
            required
            options={teacherOptions}
          />
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAssignTeacherModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={assignTeacherMutation.isPending}
              className="flex-1"
            >
              Assign Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassesManagement;
