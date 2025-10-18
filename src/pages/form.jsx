import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchableDropdown, Button, Dialog } from '../components/ui';
import { useRoadsData } from '../hooks';
import { roadsService } from '../services';

const concreteData = [
  { type: 'Cracking - Multiple Narrow', weight: 3.6 },
  { type: 'Cracking - Transverse Wide', weight: 5.5 },
  { type: 'Cracking - Transverse Narrow', weight: 3.5 },
  { type: 'Spalling (severity)', weight: 3 },
  { type: 'Faulting (average)', weight: 4.2 },
  { type: 'Shattered Slabs (number)', weight: 1.36 },
  { type: 'Scaling - Severe', weight: 1.2 },
  { type: 'Scaling - Minor', weight: 0.55 },
  { type: 'Joint Sealant Deterioration', weight: 0.13 },
];

const asphaltData = [
  { type: 'Cracking - Crocodile Narrow', weight: 3.5 },
  { type: 'Cracking - Crocodile Wide', weight: 5.9 },
  { type: 'Cracking - Transverse Wide', weight: 5.5 },
  { type: 'Cracking - Transverse Narrow', weight: 3.3 },
  { type: 'Edge Break (Large)', weight: 1.25 },
  { type: 'Edge Break (Medium)', weight: 0.82 },
  { type: 'Edge Break (Small)', weight: 0.41 },
  { type: 'Patching', weight: 1.25 },
  { type: 'Potholes (Number)', weight: 0.36 },
  { type: 'Surface Failures', weight: 0.18 },
  { type: 'Rutting (RDM)', weight: 4 },
  { type: 'Wearing Surface - Minor', weight: 0.55 },
  { type: 'Wearing Surface - Severe', weight: 1.2 },
];

const VCIForm = () => {
  const navigate = useNavigate();

  // Surface type state
  const [surfaceType, setSurfaceType] = useState('concrete'); // 'concrete' or 'asphalt'

  const [data, setData] = useState(
    concreteData.map(item => ({
      ...item,
      observed: '',
      weighted: 0,
    }))
  );

  // Roads data and selection state
  const { data: roadsData, loading: roadsLoading, error: roadsError, fetchRoads } = useRoadsData();
  const [selectedRoadId, setSelectedRoadId] = useState('');
  const [selectedRoad, setSelectedRoad] = useState(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);

  // Dialog state
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Fetch roads data on component mount
  useEffect(() => {
    fetchRoads();
  }, [fetchRoads]);


  const handleInputChange = (index, value) => {
    const newData = [...data];
    const observed = parseFloat(value) || 0;
    newData[index].observed = value;
    newData[index].weighted = parseFloat((observed * newData[index].weight).toFixed(2));
    setData(newData);
  };

  const handleRoadSelection = (roadId, roadData) => {
    setSelectedRoadId(roadId);
    setSelectedRoad(roadData);
    // Close any open dialogs when selecting a new road
    setDialog({ isOpen: false, type: 'info', title: '', message: '' });
  };

  const handleSaveVCI = async () => {
    if (!selectedRoadId) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'No Road Selected',
        message: 'Please select a road first before saving the VCI value.'
      });
      return;
    }

    if (VCI === 0) {
      setDialog({
        isOpen: true,
        type: 'warning',
        title: 'No Distress Values',
        message: 'Please enter some distress values before saving. The VCI cannot be zero.'
      });
      return;
    }

    setIsSaving(true);

    try {
      await roadsService.updateRoad(selectedRoadId, { vci: VCI, surface_type: surfaceType });

      setDialog({
        isOpen: true,
        type: 'success',
        title: 'VCI Saved Successfully!',
        message: `VCI value ${VCI.toFixed(8)} has been saved successfully for ${selectedRoad?.road_name || 'the selected road'}.`
      });

      // Refresh roads data to get updated values
      fetchRoads();
    } catch (error) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: `Failed to save VCI: ${error.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeDialog = () => {
    setDialog({ isOpen: false, type: 'info', title: '', message: '' });
  };

  const handleSurfaceTypeChange = (type) => {
    setSurfaceType(type);
    const templateData = type === 'concrete' ? concreteData : asphaltData;
    setData(
      templateData.map(item => ({
        ...item,
        observed: '',
        weighted: 0,
      }))
    );
  };

  const totalSDWF = data.reduce((sum, item) => sum + item.weighted, 0);
  const VCI = Math.max(0, 100 * (1 - Math.sqrt(1 - Math.pow((100 - (Math.min(300, totalSDWF) / 3)) / 100, 2))));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">VCI Distress Evaluation Form</h2>

        <div className="flex w-full">
          <div className="mb-6 w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surface Type
            </label>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => handleSurfaceTypeChange('concrete')}
                className={`px-6 py-2 text-sm font-medium border rounded-l-lg transition-colors ${surfaceType === 'concrete'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Concrete
              </button>
              <button
                type="button"
                onClick={() => handleSurfaceTypeChange('asphalt')}
                className={`px-6 py-2 text-sm font-medium border rounded-r-lg transition-colors ${surfaceType === 'asphalt'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Asphalt
              </button>
            </div>
          </div>

          <div className="mb-6 w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Road for Evaluation
            </label>
            <SearchableDropdown
              options={roadsData || []}
              value={selectedRoadId}
              onChange={handleRoadSelection}
              placeholder="Search and select a road..."
              displayKey="road_name"
              valueKey="id"
              loading={roadsLoading}
              error={roadsError}
              className="max-w-md"
            />
            {selectedRoad && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Selected Road:</span> {selectedRoad.road_name}
                  {selectedRoad.location && (
                    <span className="ml-2 text-blue-600">({selectedRoad.location})</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="py-3 px-4">Distress Type</th>
                <th className="py-3 px-4">Observed Value</th>
                <th className="py-3 px-4">Weight Factor</th>
                <th className="py-3 px-4">Weighted Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{row.type}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={row.observed}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-3 px-4">{row.weight}</td>
                  <td className="py-3 px-4">{row.weighted.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total SDWF:</span>
            <span>{totalSDWF.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-blue-700 mt-2">
            <span>VCI:</span>
            <span>{VCI.toFixed(8)}</span>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex flex-col items-center space-y-4">
            <Button
              onClick={handleSaveVCI}
              disabled={!selectedRoadId || VCI === 0 || isSaving}
              variant="primary"
              className="px-8 py-3 text-lg font-semibold"
            >
              {isSaving ? 'Submitting VCI...' : 'Submit'}
            </Button>

            {/* Helper Text */}
            {!selectedRoadId && (
              <p className="text-gray-500 text-sm">Please select a road to save VCI data</p>
            )}
            {selectedRoadId && VCI === 0 && (
              <p className="text-gray-500 text-sm">Enter distress values to calculate VCI</p>
            )}
          </div>
        </div>
      </div>

      {/* Dialog for success/error messages */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        autoClose={dialog.type === 'success'}
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default VCIForm;
