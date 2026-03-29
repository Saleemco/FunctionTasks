import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { termService, Term } from '../../../services/term.service';  // Fixed path - 3 levels up
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Spinner } from '../../ui/Spinner';
import { Badge } from '../../ui/Badge';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const TermManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    isActive: false
  });
  const queryClient = useQueryClient();

  const { data: terms, isLoading } = useQuery({
    queryKey: ['terms'],
    queryFn: termService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: termService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Term created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create term');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => termService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      setIsModalOpen(false);
      setEditingTerm(null);
      resetForm();
      toast.success('Term updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update term');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: termService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete term');
    }
  });

  const setActiveMutation = useMutation({
    mutationFn: termService.setActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
    onError: (error: any) => {
      toast.error('Failed to activate term');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      academicYear: '',
      startDate: '',
      endDate: '',
      isActive: false
    });
  };

  const handleOpenModal = (term?: Term) => {
    if (term) {
      setEditingTerm(term);
      setFormData({
        name: term.name,
        academicYear: term.academicYear,
        startDate: term.startDate.split('T')[0],
        endDate: term.endDate.split('T')[0],
        isActive: term.isActive
      });
    } else {
      setEditingTerm(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.academicYear || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const submitData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };
    
    if (editingTerm) {
      updateMutation.mutate({ id: editingTerm.id, data: submitData });
    } else {
      createMutation.mutate(submitData as any);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will remove the term from all fee records.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetActive = (id: string) => {
    setActiveMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const academicYears = [...new Set(terms?.map(t => t.academicYear) || [])];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Term Management</h1>
          <p className="text-gray-600">Manage academic terms and sessions</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Term
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Terms</p>
              <p className="text-2xl font-bold text-gray-900">{terms?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Academic Years</p>
              <p className="text-2xl font-bold text-gray-900">{academicYears.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Term</p>
              <p className="text-lg font-bold text-gray-900">
                {terms?.find(t => t.isActive)?.name || 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {terms?.map((term) => (
                <tr key={term.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{term.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{term.academicYear}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(term.startDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(term.endDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {term.isActive ? (
                      <Badge variant="success" className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!term.isActive && (
                        <button
                          onClick={() => handleSetActive(term.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate Term"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(term)}
                        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit Term"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(term.id, term.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Term"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!terms || terms.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No terms found. Click "Add New Term" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Term Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTerm(null);
          resetForm();
        }}
        title={editingTerm ? 'Edit Term' : 'Add New Term'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Term Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., First Term"
            required
          />
          <Input
            label="Academic Year"
            name="academicYear"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            placeholder="e.g., 2024-2025"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Activate this term immediately
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTerm(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingTerm ? 'Update Term' : 'Create Term'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TermManagement;