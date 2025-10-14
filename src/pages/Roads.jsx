import React, { useEffect, useMemo, useState } from 'react';
import { PageLayout } from '../components/layout';
import { RoadsTable } from '../components/tables';
import { useRoadsData } from '../hooks';
import { roadsService } from '../services/roadsService';
import { useToast } from '../context/ToastContext';
import { Dialog, Button } from '../components/ui';

const Roads = () => {
  const { data, loading, error, fetchRoads } = useRoadsData();
  const { success, error: showError, info } = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, road: null });
  const [editDialog, setEditDialog] = useState({ open: false, road: null });
  const [editForm, setEditForm] = useState({ road_name: '', start: '', end: '' });

  useEffect(() => {
    fetchRoads();
  }, [fetchRoads]);

  const handleEdit = (road) => {
    if (!road || !road.id) {
      info('Select a valid road to edit');
      return;
    }
    setEditForm({
      road_name: road.road_name || '',
      start: road.start || '',
      end: road.end || ''
    });
    setEditDialog({ open: true, road });
  };

  const handleSaveEdit = async () => {
    try {
      const road = editDialog.road;
      if (!road || !road.id) return;
      
      await roadsService.updateRoad(road.id, {
        road_name: editForm.road_name,
        start: editForm.start,
        end: editForm.end
      });
      
      success('Road updated successfully');
      setEditDialog({ open: false, road: null });
      fetchRoads();
    } catch (err) {
      showError(err.message || 'Failed to update road');
    }
  };

  const handleDelete = (road) => {
    setConfirmDelete({ open: true, road });
  };

  const confirmDeleteAction = async () => {
    try {
      const road = confirmDelete.road;
      if (!road || !road.id) return;
      await roadsService.deleteRoad(road.id);
      success('Road deleted');
      setConfirmDelete({ open: false, road: null });
      fetchRoads();
    } catch (err) {
      showError(err.message || 'Failed to delete road');
      setConfirmDelete({ open: false, road: null });
    }
  };

  const allColumnsNote = useMemo(() => {
    if (!data || data.length === 0) return '';
    const keys = Object.keys(data[0] || {});
    return `Columns: ${keys.join(', ')}`;
  }, [data]);

  return (
    <PageLayout>
      <RoadsTable
        data={data}
        loading={loading}
        error={error}
        onRefresh={fetchRoads}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, road: null })}
        title="Delete road?"
        type="warning"
        showFooter={false}
        message={
          <div>
            <p className="text-sm text-gray-700">This action cannot be undone. Cancel or delete</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete({ open: false, road: null })}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={confirmDeleteAction}>Delete</Button>
            </div>
          </div>
        }
        showCloseButton={false}
        autoClose={false}
      />

      <Dialog
        isOpen={editDialog.open}
        onClose={() => setEditDialog({ open: false, road: null })}
        title="Edit Road"
        type="info"
        showFooter={false}
        message={
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Road Name
                </label>
                <input
                  type="text"
                  value={editForm.road_name}
                  onChange={(e) => setEditForm({ ...editForm, road_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter road name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start
                </label>
                <input
                  type="text"
                  value={editForm.start}
                  onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter start location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End
                </label>
                <input
                  type="text"
                  value={editForm.end}
                  onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter end location"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditDialog({ open: false, road: null })}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        }
        showCloseButton={true}
        autoClose={false}
      />
    </PageLayout>
  );
};

export default Roads;


