
'use client';

import React from 'react';
import CombinedScheduleView from '@/app/components/schedule/CombinedScheduleView';
import type { ScheduleEntry, Appliance, Apartment } from '@/types';

// Mock data for demonstration
const MOCK_APPLIANCES: Appliance[] = [
  { id: 'car_charger', name: 'Car Charger', icon: '🔌' },
  { id: 'oven', name: 'Oven', icon: '🍳' },
  { id: 'washing_machine', name: 'Washing Machine', icon: '🧺' },
  { id: 'dryer', name: 'Dryer', icon: '💨' },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️' },
];

const MOCK_APARTMENTS: Apartment[] = [
  { id: 'stensvoll', name: 'Stensvoll Household' },
  { id: 'nowak', name: 'Nowak Household' },
];

const MOCK_SCHEDULE_DATA: ScheduleEntry[] = [
  { day: 'Mon', time: '09:00', applianceId: 'washing_machine', userId: 'user1', apartmentId: 'stensvoll' },
  { day: 'Mon', time: '10:00', applianceId: 'dryer', userId: 'user1', apartmentId: 'stensvoll' },
  { day: 'Mon', time: '09:00', applianceId: 'oven', userId: 'user3', apartmentId: 'nowak' },
  { day: 'Tue', time: '14:00', applianceId: 'car_charger', userId: 'user2', apartmentId: 'stensvoll' },
  { day: 'Wed', time: '18:00', applianceId: 'dishwasher', userId: 'user4', apartmentId: 'nowak' },
  { day: 'Wed', time: '18:00', applianceId: 'oven', userId: 'user1', apartmentId: 'stensvoll' }, // Example conflict
];

export default function CombinedSchedulePage() {
  return (
    <div style={{ padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ color: '#5D9CEC' }}>Combined Appliance Schedules</h1>
      <p style={{ color: '#2C3E50' }}>View schedules for all apartments.</p>
      <CombinedScheduleView 
        scheduleData={MOCK_SCHEDULE_DATA}
        appliances={MOCK_APPLIANCES}
        apartments={MOCK_APARTMENTS}
      />
    </div>
  );
}
