
'use client';

import React from 'react';
import type { ScheduleEntry, Appliance, Apartment } from '@/types';

interface CombinedScheduleViewProps {
  scheduleData: ScheduleEntry[]; // Should contain data for all relevant apartments
  appliances: Appliance[];
  apartments: Apartment[]; // List of apartments to display schedules for
  // Props for specific day/week selection might be needed later
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

// Updated color scheme for apartments
const apartmentColors: { [key: string]: string } = {
  stensvoll: '#A0D2DB', // Light Teal/Greenish Blue
  nowak: '#C3AED6',     // Light Purple/Lavender
  default: '#E0E0E0',    // Default light gray for any other/unassigned
  conflict: '#F2A63A',  // Warm Orange for conflicts (as per style guide accent color)
};

const CombinedScheduleView: React.FC<CombinedScheduleViewProps> = ({
  scheduleData,
  appliances,
  apartments,
}) => {
  const headerCellStyle = {
    border: '1px solid #D1D5DB',
    padding: '0.5rem',
    minHeight: '40px',
    fontSize: '0.75rem',
    textAlign: 'center' as 'center',
    backgroundColor: '#F0F4F8',
    fontWeight: 'bold',
    color: '#2C3E50',
  };

  const timeSlotCellStyle = {
    border: '1px solid #D1D5DB',
    padding: '0.25rem',
    minHeight: '50px',
    fontSize: '0.7rem',
    textAlign: 'center' as 'center',
    position: 'relative' as 'relative',
    overflow: 'hidden',
  };

  const entryStyle = (apartmentId: string) => ({
    fontSize: '0.65rem',
    padding: '2px',
    margin: '1px 0',
    borderRadius: '3px',
    backgroundColor: apartmentColors[apartmentId] || apartmentColors.default,
    color: '#333', // Darker text for better readability on light pastel backgrounds
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as 'nowrap',
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#FFFFFF', padding: '1rem' }}>
      <h2 style={{ color: '#5D9CEC', marginBottom: '1rem' }}>Combined Weekly Schedule</h2>
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `60px repeat(${daysOfWeek.length}, 1fr)`,
          gridTemplateRows: `auto repeat(${timeSlots.length}, auto)`,
          border: '1px solid #D1D5DB',
          overflowX: 'auto',
        }}
      >
        <div style={headerCellStyle}></div> {/* Empty top-left corner */}
        {daysOfWeek.map(day => (
          <div key={day} style={headerCellStyle}>{day}</div>
        ))}

        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div style={headerCellStyle}>{time}</div>
            {daysOfWeek.map(day => {
              // Find entries for this specific day and time for all apartments
              const entriesForSlot = scheduleData.filter(
                e => e.day === day && e.time === time
              );

              return (
                <div 
                  key={`${day}-${time}`}
                  style={timeSlotCellStyle}
                  aria-label={`Slot for ${day} at ${time}`}
                >
                  {entriesForSlot.length > 0 ? (
                    entriesForSlot.map(entry => {
                      const appliance = appliances.find(app => app.id === entry.applianceId);
                      const apartment = apartments.find(apt => apt.id === entry.apartmentId);
                      return (
                        <div 
                          key={`${entry.apartmentId}-${entry.applianceId}`}
                          style={entryStyle(entry.apartmentId)}
                          title={`${appliance?.name} for ${apartment?.name || entry.apartmentId}`}
                        >
                          {appliance?.icon} {appliance?.name?.substring(0,10)}{appliance && appliance.name.length > 10 ? '...' : ''}
                        </div>
                      );
                    })
                  ) : (
                    <span style={{ color: '#A0A0A0', fontSize:'0.6rem' }}>Empty</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {/* Color Legend */}
      <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#F0F4F8', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2C3E50' }}>Legend:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {apartments.map(apt => (
            <div key={apt.id} style={{ display: 'flex', alignItems: 'center' }}>
              <span 
                style={{
                  display: 'inline-block',
                  width: '1rem',
                  height: '1rem',
                  backgroundColor: apartmentColors[apt.id] || apartmentColors.default,
                  marginRight: '0.5rem',
                  border: '1px solid #CCC'
                }}
              ></span>
              <span style={{ fontSize: '0.8rem', color: '#333' }}>{apt.name}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span 
              style={{
                display: 'inline-block',
                width: '1rem',
                height: '1rem',
                backgroundColor: apartmentColors.conflict,
                marginRight: '0.5rem',
                border: '1px solid #CCC'
              }}
            ></span>
            <span style={{ fontSize: '0.8rem', color: '#333' }}>Conflict</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedScheduleView;
