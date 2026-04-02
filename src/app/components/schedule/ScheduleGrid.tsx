
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
  const headerCellStyle = "border border-border p-2 min-h-[40px] text-xs text-center bg-background font-bold text-textDark";

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-primary mb-6">Weekly Schedule</h2>
      <div className="overflow-x-auto">
        <div
          className="grid border border-border bg-white min-w-[600px]"
          style={{
            gridTemplateColumns: `60px repeat(${daysOfWeek.length}, 1fr)`,
            gridTemplateRows: `auto repeat(${timeSlots.length}, auto)`,
          }}
        >
          <div className={headerCellStyle}></div> {/* Empty top-left corner */}
          {daysOfWeek.map(day => (
            <div key={day} className={headerCellStyle}>{day}</div>
          ))}

          {timeSlots.map(time => (
            <React.Fragment key={time}>
              <div className={headerCellStyle}>{time}</div>
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
    </div>
  );
};

export default ScheduleGrid;
