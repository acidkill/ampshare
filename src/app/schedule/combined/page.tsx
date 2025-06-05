
'use client';

import React, { useState, useEffect } from 'react';
import CombinedScheduleView from '@/app/components/schedule/CombinedScheduleView';
import type { ScheduleEntry, Appliance, Apartment } from '@/types';

// Appliances can still be a mock/constant list for now
const MOCK_APPLIANCES: Appliance[] = [
  { id: 'car_charger', name: 'Car Charger', icon: '🔌' },
  { id: 'oven', name: 'Oven', icon: '🍳' },
  { id: 'washing_machine', name: 'Washing Machine', icon: '🧺' },
  { id: 'dryer', name: 'Dryer', icon: '💨' },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️' },
];

export default function CombinedSchedulePage() {
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCombinedData() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [schedulesRes, apartmentsRes] = await Promise.all([
          fetch('/api/schedules'), // Fetches all schedules
          fetch('/api/apartments')
        ]);

        if (!schedulesRes.ok) {
          throw new Error('Failed to fetch schedule data');
        }
        if (!apartmentsRes.ok) {
          throw new Error('Failed to fetch apartments');
        }

        const schedules: ScheduleEntry[] = await schedulesRes.json();
        const apts: Apartment[] = await apartmentsRes.json();
        
        setScheduleData(schedules);
        setApartments(apts);

      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCombinedData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ color: '#5D9CEC' }}>Combined Appliance Schedules</h1>
      <p style={{ color: '#2C3E50' }}>View schedules for all apartments.</p>
      
      {isLoading ? (
        <div>Loading combined schedule...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : (
        <CombinedScheduleView 
          scheduleData={scheduleData}
          appliances={MOCK_APPLIANCES}
          apartments={apartments}
        />
      )}
    </div>
  );
}
