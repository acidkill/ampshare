
'use client';

import React, { useState } from 'react';

// As per blueprint: car charger, oven, washing machine, dryer, dishwasher
const applianceTypes = [
  { id: 'car_charger', name: 'Car Charger', icon: '🔌' }, // Placeholder icons
  { id: 'oven', name: 'Oven', icon: '🍳' },
  { id: 'washing_machine', name: 'Washing Machine', icon: '🧺' },
  { id: 'dryer', name: 'Dryer', icon: '💨' },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️' },
];

interface ApplianceSelectorProps {
  onApplianceSelected?: (applianceId: string | null) => void;
}

const ApplianceSelector: React.FC<ApplianceSelectorProps> = ({ onApplianceSelected }) => {
  const [selectedApplianceId, setSelectedApplianceId] = useState<string | null>(null);

  const handleSelect = (applianceId: string) => {
    const newSelection = selectedApplianceId === applianceId ? null : applianceId;
    setSelectedApplianceId(newSelection);
    onApplianceSelected?.(newSelection);
  };

  const buttonBaseStyle = {
    fontFamily: 'Inter, sans-serif',
    padding: '0.5rem 1rem',
    margin: '0.25rem',
    border: '1px solid #D1D5DB', // Light gray border
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#F0F4F8', // Light gray background
    color: '#2C3E50', // Darker text
    transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
  };

  const selectedButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#5D9CEC', // Muted blue for selection
    color: '#FFFFFF', // White text for contrast
    borderColor: '#4A8ADF', // Slightly darker blue for border
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', margin: '1rem 0' }}>
      <h3 style={{ color: '#2C3E50', marginBottom: '0.5rem' }}>Select Appliance:</h3>
      <div>
        {applianceTypes.map(appliance => (
          <button
            key={appliance.id}
            style={selectedApplianceId === appliance.id ? selectedButtonStyle : buttonBaseStyle}
            onClick={() => handleSelect(appliance.id)}
            aria-pressed={selectedApplianceId === appliance.id}
          >
            {appliance.icon} {appliance.name}
          </button>
        ))}
      </div>
      {/* For debugging or simple display of selection */}
      {/* {selectedApplianceId && <p style={{ marginTop: '0.5rem' }}>Selected: {applianceTypes.find(a => a.id === selectedApplianceId)?.name}</p>} */}
    </div>
  );
};

export default ApplianceSelector;
