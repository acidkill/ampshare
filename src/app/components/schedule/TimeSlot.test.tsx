import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeSlot from './TimeSlot';

describe('TimeSlot Component', () => {
  const mockOnClick = jest.fn();

  it('renders an empty time slot', () => {
    render(
      <TimeSlot
        day="Mon"
        time="09:00"
        scheduledApplianceDetails={null}
        onClick={mockOnClick}
      />
    );
    // Check if the button role is present (as it's clickable)
    const slotElement = screen.getByRole('button');
    expect(slotElement).toBeInTheDocument();
    expect(slotElement).toHaveAttribute('aria-label', 'Schedule slot for Mon at 09:00, empty');
    expect(screen.queryByText(/./)).not.toBeInTheDocument(); // No icon/text content for empty slot
  });

  it('renders a scheduled time slot with appliance icon', () => {
    const mockAppliance = {
      id: 'washer1',
      name: 'Washing Machine',
      icon: '🧺',
    };
    render(
      <TimeSlot
        day="Tue"
        time="14:00"
        scheduledApplianceDetails={mockAppliance}
        onClick={mockOnClick}
      />
    );
    const slotElement = screen.getByRole('button');
    expect(slotElement).toBeInTheDocument();
    expect(slotElement).toHaveAttribute('aria-label', `Schedule slot for Tue at 14:00, scheduled: ${mockAppliance.name}`);
    expect(screen.getByText(mockAppliance.icon)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <TimeSlot
        day="Wed"
        time="10:00"
        scheduledApplianceDetails={null}
        onClick={mockOnClick}
      />
    );
    const slotElement = screen.getByRole('button');
    slotElement.click();
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
