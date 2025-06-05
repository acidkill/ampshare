
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

  const baseStyle = {
    border: '1px solid #D1D5DB',
    padding: '0.5rem',
    minHeight: '40px',
    fontSize: '0.75rem',
    textAlign: 'center' as 'center',
    cursor: 'pointer',
    backgroundColor: '#FFFFFF', // Default background
    color: '#2C3E50', // Default text color
    transition: 'background-color 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const scheduledStyle = {
    ...baseStyle,
    backgroundColor: '#5D9CEC', // Muted blue for scheduled items (as per primary color)
    // Consider a different color if an *active selection for scheduling* is needed vs *already scheduled*
    // For now, let's use a muted blue for any scheduled item. Conflict color is orange.
    color: '#FFFFFF', // White text for contrast on blue
  };

  return (
    <div 
      style={isScheduled ? scheduledStyle : baseStyle}
      onClick={onClick} // Use the passed onClick handler
      role="button"
      tabIndex={0}
      aria-pressed={isScheduled}
      aria-label={`Schedule slot for ${day} at ${time}${isScheduled ? `, scheduled: ${scheduledApplianceDetails.name}` : ', empty'}`}
      title={isScheduled ? scheduledApplianceDetails.name : `Click to schedule for ${time}`}
    >
      {isScheduled ? scheduledApplianceDetails.icon : ''}
    </div>
  );
};

export default TimeSlot;
