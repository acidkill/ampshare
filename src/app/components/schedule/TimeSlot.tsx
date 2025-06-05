
'use client';

import React, { useState } from 'react';

interface TimeSlotProps {
  day: string;
  time: string;
  // isInitiallySelected?: boolean; // If selection state needs to be controlled from parent later
  // onSlotSelect?: (day: string, time: string, isSelected: boolean) => void; // Callback for parent
}

const TimeSlot: React.FC<TimeSlotProps> = ({ day, time }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
    // onSlotSelect?.(day, time, !isSelected);
  };

  const baseStyle = {
    border: '1px solid #D1D5DB',
    padding: '0.5rem',
    minHeight: '40px',
    fontSize: '0.75rem',
    textAlign: 'center' as 'center',
    cursor: 'pointer',
    backgroundColor: '#FFFFFF', // Default background
    transition: 'background-color 0.2s ease-in-out', // Subtle transition
  };

  const selectedStyle = {
    ...baseStyle,
    backgroundColor: '#F2A63A', // Warm orange accent for selection
    color: '#FFFFFF', // White text for contrast on orange
  };

  const hoverStyle = {
    // On hover, slightly darker or different shade to indicate interactivity
    // This would ideally be done with CSS :hover, but for JS-driven styles:
    // For simplicity, we are not adding JS-based hover styles here.
    // CSS modules or Tailwind would be better for this.
  };

  return (
    <div 
      style={isSelected ? selectedStyle : baseStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Schedule slot for ${day} at ${time}`}
    >
      {/* Content for `${day} ${time}` can be added here, e.g., appliance icon */}
      {isSelected ? 'Selected' : ''}
    </div>
  );
};

export default TimeSlot;
