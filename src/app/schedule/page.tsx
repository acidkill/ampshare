
import React from 'react';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import ApplianceSelector from '../components/schedule/ApplianceSelector';
import ApartmentFilter from '../components/schedule/ApartmentFilter'; // Import the new component

export default function SchedulePage() {
  const handleApplianceSelection = (applianceId: string | null) => {
    console.log("Appliance selected:", applianceId);
    // Later, this will interact with the ScheduleGrid or page state
  };

  const handleApartmentSelection = (apartmentId: string | null) => {
    console.log("Apartment selected:", apartmentId);
    // Later, this will be used to filter schedule data for the ScheduleGrid
  };

  return (
    <div style={{ padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ color: '#5D9CEC'}}>Appliance Scheduling</h1>
      <p style={{ color: '#2C3E50' }}>Manage your appliance usage for the week.</p>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '20px 0' }}>
        <ApplianceSelector onApplianceSelected={handleApplianceSelection} />
        <ApartmentFilter onApartmentSelected={handleApartmentSelection} />
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <ScheduleGrid />
      </div>
    </div>
  );
}
