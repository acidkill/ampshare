
'use client';

import React, { useState, useEffect } from 'react';
import type { Apartment } from '@/types';

interface ApartmentFilterProps {
  apartments: Apartment[]; // Now receives apartments as a prop
  onApartmentSelected: (apartmentId: string | null) => void;
  initialSelectedId?: string | null;
}

const ApartmentFilter: React.FC<ApartmentFilterProps> = ({ apartments, onApartmentSelected, initialSelectedId = null }) => {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(initialSelectedId);

  useEffect(() => {
    // If an initial ID is provided, ensure the parent is notified.
    if(initialSelectedId) {
        onApartmentSelected(initialSelectedId);
    }
  }, [initialSelectedId, onApartmentSelected]);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelection = event.target.value === '' ? null : event.target.value;
    setSelectedApartmentId(newSelection);
    onApartmentSelected(newSelection);
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
        disabled={apartments.length === 0}
      >
        <option value="">{apartments.length > 0 ? 'Select Apartment' : 'Loading...'}</option>
        {apartments.map(apartment => (
          <option key={apartment.id} value={apartment.id}>
            {apartment.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ApartmentFilter;
