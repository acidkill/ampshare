
import React from 'react';
import TimeSlot from './TimeSlot';
import type { ScheduleEntry, Appliance } from '@/types';

interface ScheduleGridProps {
  scheduleData: ScheduleEntry[];
  selectedApartmentId: string | null;
  onTimeSlotClick: (day: string, time: string) => void;
  appliances: Appliance[]; // To look up appliance details like icons
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  scheduleData,
  selectedApartmentId,
  onTimeSlotClick,
  appliances,
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

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#FFFFFF', padding: '1rem' }}>
      <h2 style={{ color: '#5D9CEC', marginBottom: '1rem' }}>Weekly Schedule</h2>
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
              const entry = scheduleData.find(
                e => 
                  e.day === day && 
                  e.time === time && 
                  e.apartmentId === selectedApartmentId
              );
              const scheduledAppliance = entry 
                ? appliances.find(app => app.id === entry.applianceId) 
                : null;

              return (
                <TimeSlot 
                  key={`${day}-${time}`}
                  day={day} 
                  time={time}
                  scheduledApplianceDetails={scheduledAppliance || null} // Pass full appliance or null
                  onClick={() => onTimeSlotClick(day, time)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;
