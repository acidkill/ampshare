
'use client';

import React, { useState, useEffect } from 'react';
import type { Apartment } from '@/types'; // Assuming Apartment type is defined in src/types.ts

// Mocked apartment data based on initial seed users. 
// In a real app, this might come from an API or a global state.
const mockApartments: Apartment[] = [
  { id: 'stensvoll', name: 'Stensvoll Household' },
  { id: 'nowak', name: 'Nowak Household' },
  // { id: 'all', name: 'Combined View' } // Optional: for a combined view feature later
];

interface ApartmentFilterProps {
  onApartmentSelected?: (apartmentId: string | null) => void;
  // currentUserId?: string; // Optional, if we need to default to the user's apartment
}

const ApartmentFilter: React.FC<ApartmentFilterProps> = ({ onApartmentSelected }) => {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [availableApartments, setAvailableApartments] = useState<Apartment[]>([]);

  useEffect(() => {
    // Simulate fetching apartments or if user belongs to specific apartment
    // For now, just use the mock data.
    // A real implementation might fetch apartments the current user has access to.
    setAvailableApartments(mockApartments);
    // Optionally, set a default selection, e.g., the first apartment or user's apartment
    if (mockApartments.length > 0) {
      // setSelectedApartmentId(mockApartments[0].id);
      // onApartmentSelected?.(mockApartments[0].id);
    }
  }, []);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelection = event.target.value === '' ? null : event.target.value;
    setSelectedApartmentId(newSelection);
    onApartmentSelected?.(newSelection);
  };

  const selectStyle = {
    fontFamily: 'Inter, sans-serif',
    padding: '0.5rem 0.75rem',
    margin: '0.25rem 0',
    border: '1px solid #D1D5DB', // Light gray border
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#2C3E50',
    minWidth: '200px',
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', margin: '1rem 0' }}>
      <label htmlFor="apartment-filter" style={{ color: '#2C3E50', marginRight: '0.5rem', display: 'block', marginBottom: '0.25rem' }}>
        Filter by Apartment:
      </label>
      <select 
        id="apartment-filter"
        value={selectedApartmentId || ''}
        onChange={handleSelect}
        style={selectStyle}
      >
        <option value="">All Apartments / Select Apartment</option> {/* Default option */}
        {availableApartments.map(apartment => (
          <option key={apartment.id} value={apartment.id}>
            {apartment.name}
          </option>
        ))}
      </select>
      {/* For debugging or simple display */}
      {/* {selectedApartmentId && <p style={{marginTop: '0.5rem'}}>Selected Apartment ID: {selectedApartmentId}</p>} */}
    </div>
  );
};

export default ApartmentFilter;
