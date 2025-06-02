'use client';

import { ScheduleContext } from '@/contexts/ScheduleContext';
import { useContext } from 'react';

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
