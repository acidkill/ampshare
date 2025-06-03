
'use client';

import { UnplannedRequestContext } from '@/contexts/UnplannedRequestContext';
import { useContext } from 'react';

export const useUnplannedRequest = () => {
  const context = useContext(UnplannedRequestContext);
  if (context === undefined) {
    throw new Error('useUnplannedRequest must be used within an UnplannedRequestProvider');
  }
  return context;
};
