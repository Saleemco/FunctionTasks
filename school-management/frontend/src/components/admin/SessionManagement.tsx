import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';  // Fixed import
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { Badge } from '../ui/Badge';
import {
  PlusIcon,
  PencilIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  CalendarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  terms?: any[];
  _count?: { terms: number };
}

export const SessionManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [copyFromSessionId, setCopyFromSessionId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false
  });
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await api.get('/sessions');
      return response.data?.data || [];
    },
  });

  const { data: activeSession } = useQuery({
    queryKey: ['active-session'],
    queryFn: async () => {
      const response = await api.get('/sessions/active');
      return response.data?.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/sessions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Session created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create session');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/sessions/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      setIsModalOpen(false);
      setEditingSession(null);
      resetForm();
      toast.success('Session updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update session');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/sessions/${id}/archive`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      toast.success('Session archived successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to archive session');
    }
  });

  const createNextSessionMutation = useMutation({
    mutationFn: async (currentSessionId: string) => {
      const response = await api.post('/sessions/next', { currentSessionId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      toast.success('Next session created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create next session');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isActive: false
    });
    setCopyFromSessionId('');
  };

  const handleOpenModal = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        name: session.name,
        startDate: session.startDate.split('T')[0],
        endDate: session.endDate.split('T')[0],
        isActive: session.isActive
      });
    } else {
      setEditingSession(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const submitData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      copyFromSessionId: copyFromSessionId || undefined
    };
    
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleCreateNextSession = () => {
    if (activeSession && window.confirm(`Create next session (${parseInt(activeSession.name.split('-')[0]) + 1}-${parseInt(activeSession.name.split('-')[1]) + 1})? This will archive the current session and create a new one with the same terms.`)) {
      createNextSessionMutation.mutate(activeSession.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600">Manage academic years/sessions</p>
        </div>
        <div className="flex gap-3">
          {activeSession && (
            <Button onClick={handleCreateNextSession} variant="secondary">
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Create Next Session
            </Button>
          )}
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-5 w-5 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Active Session Card */}
      {activeSession && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Session</p>
              <p className="text-2xl font-bold text-green-700">{activeSession.name}</p>
              <p className="text-sm text-green-600 mt-1">
                {new Date(activeSession.startDate).toLocaleDateString()} - {new Date(activeSession.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions?.map((session: Session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{session.name}</div>
                    {session._count?.terms > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {session._count.terms} terms
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {session.terms?.slice(0, 3).map((term) => (
                        <Badge key={term.id} variant="info" size="sm">
                          {term.name}
                        </Badge>
                      ))}
                      {session.terms && session.terms.length > 3 && (
                        <Badge variant="secondary" size="sm">
                          +{session.terms.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {session.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : session.isArchived ? (
                      <Badge variant="secondary">Archived</Badge>
                    ) : (
                      <Badge variant="warning">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!session.isArchived && (
                        <>
                          <button
                            onClick={() => handleOpenModal(session)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit Session"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          {!session.isActive && (
                            <button
                              onClick={() => archiveMutation.mutate(session.id)}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Archive Session"
                            >
                              <ArchiveBoxIcon className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSession(null);
          resetForm();
        }}
        title={editingSession ? 'Edit Session' : 'Create New Session'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Session Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          
          {!editingSession && sessions && sessions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copy Terms From
              </label>
              <select
                value={copyFromSessionId}
                onChange={(e) => setCopyFromSessionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Don't copy terms</option>
                {sessions.filter((s: Session) => !s.isArchived).map((session: Session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} ({session._count?.terms || 0} terms)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Copying terms will create duplicate term records for this session
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Activate this session immediately
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSession(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingSession ? 'Update Session' : 'Create Session'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SessionManagement;