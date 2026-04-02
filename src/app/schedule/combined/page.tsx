
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Combined Appliance Schedules</h1>
        <p className="text-textDark">View schedules and conflicts for all apartments.</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="transition-opacity duration-200">
          <CombinedScheduleView
            scheduleData={scheduleData}
            appliances={MOCK_APPLIANCES}
            apartments={apartments}
          />
        </div>
      )}
    </div>
  );
}
