
'use client';

import React from 'react';
import type { Appliance } from '@/types';

interface TimeSlotProps {
  day: string;
  time: string;
  scheduledApplianceDetails: Appliance | null; // Details of the appliance scheduled in this slot, or null
  onClick: () => void; // Callback when the slot is clicked
}

const TimeSlot: React.FC<TimeSlotProps> = ({ day, time, scheduledApplianceDetails, onClick }) => {
  const isScheduled = !!scheduledApplianceDetails;

  return (
    <div 
      className={`border border-border p-2 min-h-[40px] text-xs text-center cursor-pointer transition-colors duration-200 ease-in-out flex items-center justify-center ${
        isScheduled
          ? 'bg-primary text-white hover:bg-blue-500'
          : 'bg-white text-textDark hover:bg-gray-50'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={isScheduled}
      aria-label={`Schedule slot for ${day} at ${time}${isScheduled ? `, scheduled: ${scheduledApplianceDetails.name}` : ', empty'}`}
      title={isScheduled ? scheduledApplianceDetails.name : `Click to schedule for ${time}`}
    >
      {isScheduled && <span className="text-lg">{scheduledApplianceDetails.icon}</span>}
    </div>
  );
};

export default TimeSlot;
