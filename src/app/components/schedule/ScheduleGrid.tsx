
'use client';

import React from 'react';
import TimeSlot from './TimeSlot'; // Import the new TimeSlot component

// TODO: Define more specific types for schedule data later
interface ScheduleGridProps {
  // Props to be defined, e.g., selected date, schedule data, apartmentId
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const ScheduleGrid: React.FC<ScheduleGridProps> = (props) => {
  // Basic styling for the grid cells, to be refined with actual CSS/Tailwind
  // Adhering to style guidelines: Light gray background, Muted blue for highlights/borders (later)
  const cellStyle = {
    border: '1px solid #D1D5DB', // Light gray border, similar to #F0F4F8 background idea
    padding: '0.5rem',
    minHeight: '40px',
    fontSize: '0.75rem',
    textAlign: 'center' as 'center',
  };

  const headerCellStyle = {
    ...cellStyle,
    backgroundColor: '#F0F4F8', // Light gray background for headers
    fontWeight: 'bold',
    color: '#2C3E50' // Darker text for readability
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#FFFFFF', padding: '1rem' }}>
      <h2 style={{ color: '#5D9CEC', marginBottom: '1rem' }}>Weekly Schedule</h2>
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `60px repeat(${daysOfWeek.length}, 1fr)`,
          gridTemplateRows: `auto repeat(${timeSlots.length}, auto)`,
          border: '1px solid #D1D5DB',
          overflowX: 'auto', // For responsiveness on smaller screens
        }}
      >
        {/* Empty top-left corner */}
        <div style={headerCellStyle}></div>

        {/* Day headers */}
        {daysOfWeek.map(day => (
          <div key={day} style={headerCellStyle}>{day}</div>
        ))}

        {/* Time slots and grid cells */}
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div style={headerCellStyle}>{time}</div>
            {daysOfWeek.map(day => (
              <TimeSlot key={`${day}-${time}`} day={day} time={time} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;
