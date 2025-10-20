import React, { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Search and select...",
  displayKey = "name",
  valueKey = "id",
  className = "",
  disabled = false,
  loading = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options || []);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter and sort options based on search term
  useEffect(() => {
    const safeOptions = options || [];

    // Sort options by ID in ascending order (1 first)
    const sortedOptions = [...safeOptions].sort((a, b) => {
      const idA = parseInt(a[valueKey]) || 0;
      const idB = parseInt(b[valueKey]) || 0;
      return idA - idB;
    });

    if (!searchTerm) {
      setFilteredOptions(sortedOptions);
    } else {
      const filtered = sortedOptions.filter(option => {
        const displayValue = option[displayKey];
        const searchLower = searchTerm.toLowerCase();

        // Search in the main display field if it exists
        if (displayValue && typeof displayValue === 'string') {
          if (displayValue.toLowerCase().includes(searchLower)) {
            return true;
          }
        }

        // Also search in other fields like location, id, or any string field
        const searchableFields = Object.entries(option).filter(([key, val]) =>
          typeof val === 'string' && val.toLowerCase().includes(searchLower)
        );

        // Include if found in any searchable field or if searching by ID
        return searchableFields.length > 0 ||
          String(option[valueKey]).toLowerCase().includes(searchLower);
      });
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, displayKey, valueKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display text for selected value
  const getDisplayText = () => {
    if (!value) return '';
    const safeOptions = options || [];
    const selectedOption = safeOptions.find(option => option[valueKey] === value);
    return selectedOption ? (selectedOption[displayKey] || '') : '';
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleOptionSelect = (option) => {
    onChange(option[valueKey], option);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        handleOptionSelect(filteredOptions[0]);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? (searchTerm || '') : getDisplayText()}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={`
            w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
            ${error ? 'border-red-500' : ''}
          `}
          readOnly={!isOpen}
        />

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown menu */}
      {isOpen && !disabled && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500">
              {searchTerm ? 'No roads found matching your search' : 'No roads available'}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option[valueKey]}
                onClick={() => handleOptionSelect(option)}
                className={`
                  px-2 sm:px-3 py-2.5 sm:py-2 cursor-pointer text-xs sm:text-sm hover:bg-blue-50 transition-colors
                  ${option[valueKey] === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}
                `}
              >
                <div className="font-medium">
                  {option[displayKey] || `Road ID: ${option[valueKey]}`}
                </div>
                {option.description && (
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                )}
                {/* Show VCI value if available */}
                {option.vci && (
                  <div className="text-xs text-blue-600 mt-1">VCI: {option.vci}</div>
                )}
                {/* Show additional fields if main display is empty */}
                {!option[displayKey] && (
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.entries(option)
                      .filter(([key]) => key !== 'id' && key !== valueKey)
                      .slice(0, 3)
                      .map(([key, val]) => (
                        <span key={key} className="mr-2">
                          {key}: {String(val || '').substring(0, 20)}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
