
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

  return (
    <div className="mb-4">
      <h3 className="text-textDark font-semibold mb-2">Select Appliance:</h3>
      <div className="flex flex-wrap gap-2">
        {applianceTypes.map(appliance => (
          <button
            key={appliance.id}
            className={`px-4 py-2 border rounded transition-all duration-200 ease-in-out flex items-center gap-2 ${
              selectedApplianceId === appliance.id
                ? 'bg-primary text-white border-blue-600 shadow-sm'
                : 'bg-background text-textDark border-border hover:bg-gray-200'
            }`}
            onClick={() => handleSelect(appliance.id)}
            aria-pressed={selectedApplianceId === appliance.id}
          >
            <span className="text-lg">{appliance.icon}</span>
            <span>{appliance.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ApplianceSelector;
