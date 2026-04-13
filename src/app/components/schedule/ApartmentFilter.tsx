
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

  return (
    <div className="mb-4">
      <label htmlFor="apartment-filter" className="block text-textDark font-semibold mb-2">
        Filter by Apartment:
      </label>
      <select 
        id="apartment-filter"
        value={selectedApartmentId || ''}
        onChange={handleSelect}
        className="w-full md:w-auto min-w-[200px] p-2 border border-border rounded bg-white text-textDark focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500"
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
