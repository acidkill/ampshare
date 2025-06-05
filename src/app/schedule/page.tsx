
'use client';

import React, { useState, useCallback } from 'react';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import ApplianceSelector from '../components/schedule/ApplianceSelector';
import ApartmentFilter from '../components/schedule/ApartmentFilter';
import type { ScheduleEntry, Appliance } from '@/types';

// Mock appliance data (could also be fetched or come from a config)
// As per blueprint: car charger, oven, washing machine, dryer, dishwasher
const MOCK_APPLIANCES: Appliance[] = [
  { id: 'car_charger', name: 'Car Charger', icon: '🔌' },
  { id: 'oven', name: 'Oven', icon: '🍳' },
  { id: 'washing_machine', name: 'Washing Machine', icon: '🧺' },
  { id: 'dryer', name: 'Dryer', icon: '💨' },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️' },
];

export default function SchedulePage() {
  const [selectedApplianceId, setSelectedApplianceId] = useState<string | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([]);

  const handleApplianceSelection = useCallback((applianceId: string | null) => {
    setSelectedApplianceId(applianceId);
    console.log("Page: Appliance selected:", applianceId);
  }, []);

  const handleApartmentSelection = useCallback((apartmentId: string | null) => {
    setSelectedApartmentId(apartmentId);
    console.log("Page: Apartment selected:", apartmentId);
    // Future: Could fetch schedule data for this apartment here
  }, []);

  const handleTimeSlotClick = useCallback((day: string, time: string) => {
    if (!selectedApplianceId) {
      alert('Please select an appliance first.');
      return;
    }
    if (!selectedApartmentId) {
      alert('Please select an apartment first.');
      return;
    }

    setScheduleData(prevData => {
      const existingEntryIndex = prevData.findIndex(
        entry => 
          entry.day === day && 
          entry.time === time && 
          entry.apartmentId === selectedApartmentId
      );

      if (existingEntryIndex !== -1) {
        const existingEntry = prevData[existingEntryIndex];
        // If clicking the same appliance again in the same slot, unschedule it
        if (existingEntry.applianceId === selectedApplianceId) {
          return prevData.filter((_, index) => index !== existingEntryIndex);
        }
        // If slot is occupied by a different appliance, replace it (simple overwrite for now)
        const updatedEntry: ScheduleEntry = {
          ...existingEntry,
          applianceId: selectedApplianceId,
          userId: 'currentUser', // Placeholder
        };
        const newData = [...prevData];
        newData[existingEntryIndex] = updatedEntry;
        return newData;
      } else {
        // Slot is empty for this apartment, add new schedule entry
        const newEntry: ScheduleEntry = {
          day,
          time,
          applianceId: selectedApplianceId,
          userId: 'currentUser', // Placeholder
          apartmentId: selectedApartmentId,
        };
        return [...prevData, newEntry];
      }
    });
  }, [selectedApplianceId, selectedApartmentId]);

  return (
    <div style={{ padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ color: '#5D9CEC'}}>Appliance Scheduling</h1>
      <p style={{ color: '#2C3E50' }}>Manage your appliance usage for the week.</p>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '20px 0' }}>
        <ApplianceSelector onApplianceSelected={handleApplianceSelection} />
        <ApartmentFilter onApartmentSelected={handleApartmentSelection} />
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <ScheduleGrid 
          scheduleData={scheduleData}
          selectedApartmentId={selectedApartmentId}
          onTimeSlotClick={handleTimeSlotClick}
          appliances={MOCK_APPLIANCES} // Pass appliances for icon lookup
        />
      </div>
    </div>
  );
}
