import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { RoadsTable } from '../components/tables';
import { useRoadsData } from '../hooks';
import { roadsService } from '../services/roadsService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Dialog, Button } from '../components/ui';

const Roads = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchRoads } = useRoadsData();
  const { success, error: showError, info } = useToast();
  const { isAdmin } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, road: null });
  const [editDialog, setEditDialog] = useState({ open: false, road: null });
  const [editForm, setEditForm] = useState({ road_name: '', start: '', end: '' });
  const [addDialog, setAddDialog] = useState({ open: false });
  const [addForm, setAddForm] = useState({ road_name: '', start: '', end: '' });

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

  const handleView = (road) => {
    if (!road || !road.id) {
      info('Select a valid road to view');
      return;
    }
    navigate(`/roads/${encodeURIComponent(road.id)}/view`);
  };

  const handleSaveEdit = async () => {
    try {
      const road = editDialog.road;
      if (!road || !road.id) return;

      if (!editForm.road_name.trim()) {
        showError('Road name is required');
        return;
      }

      if (editForm.start && !validateCoordinate(editForm.start)) {
        showError('Invalid start coordinates. Format should be: latitude,longitude (e.g., 14.5995,120.9842)');
        return;
      }

      if (editForm.end && !validateCoordinate(editForm.end)) {
        showError('Invalid end coordinates. Format should be: latitude,longitude (e.g., 14.6001,120.9855)');
        return;
      }

      await roadsService.updateRoad(road.id, {
        road_name: editForm.road_name,
        start: editForm.start.trim(),
        end: editForm.end.trim()
      });

      success('Road updated successfully');
      setEditDialog({ open: false, road: null });
      fetchRoads();
    } catch (err) {
      showError(err.message || 'Failed to update road');
    }
  };

  const handleAdd = () => {
    setAddForm({ road_name: '', start: '', end: '' });
    setAddDialog({ open: true });
  };

  const validateCoordinate = (coordString) => {
    if (!coordString || typeof coordString !== 'string') {
      return false;
    }
    const [lat, lng] = coordString.split(',').map(coord => parseFloat(coord.trim()));
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const handleSaveAdd = async () => {
    try {
      if (!addForm.road_name.trim()) {
        showError('Road name is required');
        return;
      }

      if (!addForm.start.trim() || !addForm.end.trim()) {
        showError('Start and end coordinates are required');
        return;
      }

      if (!validateCoordinate(addForm.start)) {
        showError('Invalid start coordinates. Format should be: latitude,longitude (e.g., 14.5995,120.9842)');
        return;
      }

      if (!validateCoordinate(addForm.end)) {
        showError('Invalid end coordinates. Format should be: latitude,longitude (e.g., 14.6001,120.9855)');
        return;
      }

      await roadsService.createRoad({
        road_name: addForm.road_name,
        start: addForm.start.trim(),
        end: addForm.end.trim()
      });

      success('Road added successfully');
      setAddDialog({ open: false });
      setAddForm({ road_name: '', start: '', end: '' });
      fetchRoads();
    } catch (err) {
      showError(err.message || 'Failed to add road');
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
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={isAdmin ? handleAdd : undefined}
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
                  Start Coordinates
                </label>
                <input
                  type="text"
                  value={editForm.start}
                  onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 14.5995,120.9842"
                />
                <p className="mt-1 text-xs text-gray-500">Format: latitude,longitude</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Coordinates
                </label>
                <input
                  type="text"
                  value={editForm.end}
                  onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 14.6001,120.9855"
                />
                <p className="mt-1 text-xs text-gray-500">Format: latitude,longitude</p>
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

      <Dialog
        isOpen={addDialog.open}
        onClose={() => setAddDialog({ open: false })}
        title="Add New Road"
        type="info"
        showFooter={false}
        message={
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Road Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.road_name}
                  onChange={(e) => setAddForm({ ...addForm, road_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter road name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Coordinates <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.start}
                  onChange={(e) => setAddForm({ ...addForm, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 14.5995,120.9842"
                />
                <p className="mt-1 text-xs text-gray-500">Format: latitude,longitude (no spaces)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Coordinates <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.end}
                  onChange={(e) => setAddForm({ ...addForm, end: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 14.6001,120.9855"
                />
                <p className="mt-1 text-xs text-gray-500">Format: latitude,longitude (no spaces)</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Right-click on Google Maps and select "Copy coordinates" to get latitude,longitude values.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAddDialog({ open: false })}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAdd}>
                Add Road
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


