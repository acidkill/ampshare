
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import ApplianceSelector from '../components/schedule/ApplianceSelector';
import ApartmentFilter from '../components/schedule/ApartmentFilter';
import type { ScheduleEntry, Appliance, Apartment } from '@/types';

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
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data (apartments) on mount
  useEffect(() => {
    async function fetchApartments() {
      setError(null);
      try {
        const res = await fetch('/api/apartments');
        if (!res.ok) {
          throw new Error(`Failed to fetch apartments: ${res.statusText}`);
        }
        const apts: Apartment[] = await res.json();
        setApartments(apts);
        // Set a default selected apartment if not already set
        if (apts.length > 0 && !selectedApartmentId) {
          setSelectedApartmentId(apts[0].id);
        }
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      }
    }
    fetchApartments();
  }, []); // Empty dependency array means this runs once on mount
  
  // Refetch schedule data when the selected apartment changes
  useEffect(() => {
    if (!selectedApartmentId) {
      setScheduleData([]);
      setIsLoading(false); // No data to load
      return;
    }
    
    async function fetchScheduleForApartment() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/schedules?apartmentId=${selectedApartmentId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch schedule data for the selected apartment');
        }
        const schedules: ScheduleEntry[] = await res.json();
        setScheduleData(schedules);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScheduleForApartment();
  }, [selectedApartmentId]);


  const handleApplianceSelection = useCallback((applianceId: string | null) => {
    setSelectedApplianceId(applianceId);
  }, []);

  const handleApartmentSelection = useCallback((apartmentId: string | null) => {
    setSelectedApartmentId(apartmentId);
  }, []);

  const handleTimeSlotClick = useCallback(async (day: string, time: string) => {
    if (!selectedApplianceId) {
      setError('Please select an appliance first.');
      return;
    }
    if (!selectedApartmentId) {
      setError('Please select an apartment first.');
      return;
    }

    setError(null);

    const existingEntry = scheduleData.find(
      entry => entry.day === day && entry.time === time && entry.apartmentId === selectedApartmentId
    );

    // Optimistic Update
    let oldScheduleData = [...scheduleData];
    let temporaryId = `temp-${Date.now()}`;

    if (existingEntry) {
      if (existingEntry.applianceId === selectedApplianceId || window.confirm('This slot is booked. Overwrite?')) {
        setScheduleData(prevData => prevData.filter(entry => entry.id !== existingEntry.id));

        try {
          const res = await fetch('/api/schedules', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: existingEntry.id }),
          });
          if (!res.ok) throw new Error('Failed to delete schedule entry.');
          
          if (existingEntry.applianceId !== selectedApplianceId) {
            // Overwrite logic
            const newEntry = { day, time, applianceId: selectedApplianceId, apartmentId: selectedApartmentId };
            setScheduleData(prevData => [...prevData, { ...newEntry, id: temporaryId, userId: 'temp-user' }]);

            const createRes = await fetch('/api/schedules', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEntry),
            });
            if (!createRes.ok) throw new Error('Failed to overwrite schedule entry.');
            const serverEntry = await createRes.json();
            setScheduleData(prevData => prevData.map(entry => entry.id === temporaryId ? serverEntry : entry));
          }
        } catch (err: any) {
          setError(err.message);
          setScheduleData(oldScheduleData); // Revert optimistic update
        }
      }
    } else {
      const newEntry = { day, time, applianceId: selectedApplianceId, apartmentId: selectedApartmentId };
      setScheduleData(prevData => [...prevData, { ...newEntry, id: temporaryId, userId: 'temp-user' }]);

      try {
        const res = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry),
        });
        if (!res.ok) throw new Error('Failed to create schedule entry.');
        const serverEntry = await res.json();
        setScheduleData(prevData => prevData.map(entry => entry.id === temporaryId ? serverEntry : entry));
      } catch (err: any) {
        setError(err.message);
        setScheduleData(oldScheduleData); // Revert optimistic update
      }
    }
  }, [selectedApplianceId, selectedApartmentId, scheduleData]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Appliance Scheduling</h1>
        <p className="text-textDark">Manage your appliance usage for the week.</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          Error: {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
        <div className="w-full md:w-1/2">
          <ApplianceSelector onApplianceSelected={handleApplianceSelection} />
        </div>
        <div className="w-full md:w-1/2">
          <ApartmentFilter
              apartments={apartments}
              onApartmentSelected={handleApartmentSelection}
              initialSelectedId={selectedApartmentId}
          />
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-6 transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <ScheduleGrid 
          scheduleData={scheduleData}
          selectedApartmentId={selectedApartmentId}
          onTimeSlotClick={handleTimeSlotClick}
          appliances={MOCK_APPLIANCES}
        />
      </div>
    </div>
  );
}
