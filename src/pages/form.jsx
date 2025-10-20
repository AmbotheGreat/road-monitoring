import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchableDropdown, Button, Dialog } from '../components/ui';
import { useRoadsData } from '../hooks';
import { roadsService, reportsService } from '../services';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();

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
      // Update the road with VCI value
      await roadsService.updateRoad(selectedRoadId, { vci: VCI, surface_type: surfaceType });

      // Create a VCI report entry
      await reportsService.createReport({
        user_id: user.id,
        user_email: user.email,
        road_id: selectedRoadId,
        vci_value: VCI,
        surface_type: surfaceType
      });

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
    <div className="w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          VCI Distress Evaluation Form
        </h2>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Surface Type */}
          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Surface Type
            </label>
            <div className="inline-flex w-full sm:w-auto rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => handleSurfaceTypeChange('concrete')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium border rounded-l-lg transition-colors ${surfaceType === 'concrete'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Concrete
              </button>
              <button
                type="button"
                onClick={() => handleSurfaceTypeChange('asphalt')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium border rounded-r-lg transition-colors ${surfaceType === 'asphalt'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Asphalt
              </button>
            </div>
          </div>

          {/* Guidelines Button */}
          <div className="w-full flex items-end">
            <button
              type="button"
              onClick={() => window.open('/guidelines.pdf', '_blank')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium bg-green-600 text-white border border-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              📄 View Guidelines
            </button>
          </div>

          {/* Road Selection - takes full width on small screens, partial on larger */}
          <div className="w-full md:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
              className="w-full"
            />
            {selectedRoad && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <p className="text-xs sm:text-sm text-blue-800">
                  <span className="font-medium">Selected Road:</span> {selectedRoad.road_name}
                  {selectedRoad.location && (
                    <span className="ml-2 text-blue-600">({selectedRoad.location})</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Table with Horizontal Scroll */}
        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Distress Type
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Observed
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Weighted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 whitespace-normal sm:whitespace-nowrap">
                        {row.type}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <input
                          type="number"
                          value={row.observed}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          className="w-16 sm:w-24 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700">
                        {row.weight}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 font-medium">
                        {row.weighted.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary and Submit Section */}
        <div className="mt-4 sm:mt-6 border-t pt-4">
          {/* Results Display */}
          <div className="space-y-2 sm:space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="flex justify-between items-center text-sm sm:text-base md:text-lg font-semibold">
              <span className="text-gray-700">Total SDWF:</span>
              <span className="text-gray-900">{totalSDWF.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-base sm:text-lg md:text-xl font-bold text-blue-700">
              <span>VCI Value:</span>
              <span>{VCI.toFixed(8)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 sm:mt-6 flex flex-col items-center space-y-3 sm:space-y-4">
            <Button
              onClick={handleSaveVCI}
              disabled={!selectedRoadId || VCI === 0 || isSaving}
              variant="primary"
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg font-semibold"
            >
              {isSaving ? 'Submitting VCI...' : 'Submit VCI Report'}
            </Button>

            {/* Helper Text */}
            {!selectedRoadId && (
              <p className="text-gray-500 text-xs sm:text-sm text-center">
                Please select a road to save VCI data
              </p>
            )}
            {selectedRoadId && VCI === 0 && (
              <p className="text-gray-500 text-xs sm:text-sm text-center">
                Enter distress values to calculate VCI
              </p>
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
