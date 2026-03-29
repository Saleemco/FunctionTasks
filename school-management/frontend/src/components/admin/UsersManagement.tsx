import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/user.service";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { DataTable } from "../ui/DataTable";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const UsersManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", searchTerm, roleFilter],
    queryFn: () =>
      userService.getUsers({
        search: searchTerm,
        role: roleFilter || undefined,
        page: 1,
        limit: 50,
      }),
  });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success("User created successfully");
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
    });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (item: any) => `${item.firstName} ${item.lastName}`,
    },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (item: any) => (
        <Badge variant="info">{item.role.replace("_", " ")}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge variant={item.isActive ? "success" : "error"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingUser(item)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteUser(item.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const roleOptions = [
    { value: "PRINCIPAL", label: "Principal" },
    { value: "ADMIN", label: "Admin" },
    { value: "BURSAR", label: "Bursar" },
    { value: "CLASS_TEACHER", label: "Class Teacher" },
    { value: "SUBJECT_TEACHER", label: "Subject Teacher" },
    { value: "PARENT", label: "Parent" },
    { value: "STUDENT", label: "Student" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Create and manage system users</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-64"
          />
          <Select
            options={[{ value: "", label: "All Roles" }, ...roleOptions]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="md:w-48"
          />
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required />
            <Input label="Last Name" name="lastName" required />
          </div>
          <Input label="Email" name="email" type="email" required />
          <Input label="Password" name="password" type="password" required />
          <Select label="Role" name="role" required options={roleOptions} />
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
              isLoading={createMutation.isPending}
              className="flex-1"
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersManagement;
