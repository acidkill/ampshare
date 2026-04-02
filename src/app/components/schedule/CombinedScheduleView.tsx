
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
  const headerCellStyle = "border border-border p-2 min-h-[40px] text-xs text-center bg-background font-bold text-textDark";
  const timeSlotCellStyle = "border border-border p-1 min-h-[60px] text-[0.7rem] text-center relative overflow-hidden bg-white transition-colors duration-200";

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-primary mb-6">Combined Weekly Schedule</h2>
      <div className="overflow-x-auto">
        <div
          className="grid border border-border bg-white min-w-[800px]"
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
              // Find entries for this specific day and time for all apartments
              const entriesForSlot = scheduleData.filter(
                e => e.day === day && e.time === time
              );

              // Basic conflict rule: More than 1 apartment using high voltage appliance at the same time
              const uniqueApartmentIdsInSlot = new Set(entriesForSlot.map(e => e.apartmentId));
              const isConflictingSlot = uniqueApartmentIdsInSlot.size > 1;

              return (
                <div 
                  key={`${day}-${time}`}
                  className={`${timeSlotCellStyle} ${isConflictingSlot ? 'bg-orange-50 ring-1 ring-inset ring-accent' : ''}`}
                  aria-label={`Slot for ${day} at ${time}${isConflictingSlot ? ', conflicting bookings' : ''}`}
                >
                  {isConflictingSlot && (
                    <div className="absolute top-0 right-0 p-0.5 text-accent" title="Potential Overload Conflict">
                      ⚠️
                    </div>
                  )}
                  {entriesForSlot.length > 0 ? (
                    <div className="flex flex-col gap-1 mt-1">
                      {entriesForSlot.map((entry, index) => {
                        const appliance = appliances.find(app => app.id === entry.applianceId);
                        const apartment = apartments.find(apt => apt.id === entry.apartmentId);
                        return (
                          <div
                            key={`${entry.apartmentId}-${entry.applianceId}-${index}`}
                            className="text-[0.65rem] px-1 py-0.5 rounded text-gray-800 shadow-sm truncate flex items-center gap-1"
                            style={{ backgroundColor: apartmentColors[entry.apartmentId] || apartmentColors.default }}
                            title={`${appliance?.name} for ${apartment?.name || entry.apartmentId}`}
                          >
                            <span>{appliance?.icon}</span>
                            <span className="truncate">{appliance?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-[0.6rem] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Empty</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
        </div>
      </div>
      {/* Color Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md border border-border">
        <h4 className="font-semibold text-textDark mb-3 text-sm uppercase tracking-wide">Legend:</h4>
        <div className="flex flex-wrap gap-4">
          {apartments.map(apt => (
            <div key={apt.id} className="flex items-center">
              <span 
                className="w-4 h-4 mr-2 border border-gray-300 rounded-sm shadow-sm"
                style={{ backgroundColor: apartmentColors[apt.id] || apartmentColors.default }}
              ></span>
              <span className="text-sm text-gray-700">{apt.name}</span>
            </div>
          ))}
          <div className="flex items-center ml-auto bg-orange-100 px-3 py-1 rounded border border-orange-200">
            <span className="mr-2 text-accent">⚠️</span>
            <span className="text-sm text-gray-800 font-medium">Power Overload Conflict</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedScheduleView;
