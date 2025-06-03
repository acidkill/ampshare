'use client';

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { UnplannedRequest, ApartmentId, ApplianceType, DayOfWeek, UnplannedRequestStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UnplannedRequestContextType {
  unplannedRequests: UnplannedRequest[];
  createUnplannedRequest: (requestData: {
    applianceType: ApplianceType;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    reason: string;
  }) => void;
  approveRequest: (requestId: string) => void;
  denyRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  getPendingRequestsForApartment: (apartmentId: ApartmentId) => UnplannedRequest[];
  getRequestsByMe: (userId: string) => UnplannedRequest[];
}

export const UnplannedRequestContext = createContext<UnplannedRequestContextType | undefined>(undefined);

export const UnplannedRequestProvider = ({ children }: { children: ReactNode }) => {
  const [unplannedRequests, setUnplannedRequests] = useState<UnplannedRequest[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRequests = localStorage.getItem('ampShareUnplannedRequests');
      if (storedRequests) {
        setUnplannedRequests(JSON.parse(storedRequests));
      }
    } catch (error) {
      console.error("Failed to load unplanned requests from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ampShareUnplannedRequests', JSON.stringify(unplannedRequests));
    } catch (error) {
      console.error("Failed to save unplanned requests to localStorage", error);
    }
  }, [unplannedRequests]);

  const createUnplannedRequest = useCallback((requestData: {
    applianceType: ApplianceType;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    reason: string;
  }) => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to make a request.", variant: "destructive" });
      return;
    }

    const newRequest: UnplannedRequest = {
      id: crypto.randomUUID(),
      requesterUserId: currentUser.id,
      requesterApartmentId: currentUser.apartmentId,
      targetApartmentId: currentUser.apartmentId === 'stensvoll' ? 'nowak' : 'stensvoll',
      ...requestData,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    setUnplannedRequests(prev => [...prev, newRequest]);
    toast({ title: "Request Submitted", description: `Your request for ${requestData.applianceType} has been sent.` });
  }, [currentUser, toast]);

  const updateRequestStatus = useCallback((requestId: string, status: UnplannedRequestStatus, actionVerb: string) => {
    if (!currentUser) return;
    setUnplannedRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status, respondedAt: new Date().toISOString(), responderUserId: currentUser.id }
          : req
      )
    );
    toast({ title: `Request ${actionVerb}`, description: `The request has been ${actionVerb.toLowerCase()}.` });
  }, [currentUser, toast]);

  const approveRequest = useCallback((requestId: string) => {
    updateRequestStatus(requestId, 'approved', 'Approved');
  }, [updateRequestStatus]);

  const denyRequest = useCallback((requestId: string) => {
    updateRequestStatus(requestId, 'denied', 'Denied');
  }, [updateRequestStatus]);
  
  const cancelRequest = useCallback((requestId: string) => {
    if (!currentUser) return;
    setUnplannedRequests(prev =>
      prev.map(req =>
        (req.id === requestId && req.requesterUserId === currentUser.id && req.status === 'pending')
          ? { ...req, status: 'cancelled' }
          : req
      )
    );
     toast({ title: "Request Cancelled", description: "Your request has been cancelled." });
  }, [currentUser, toast]);


  const getPendingRequestsForApartment = useCallback((apartmentId: ApartmentId) => {
    return unplannedRequests.filter(req => req.targetApartmentId === apartmentId && req.status === 'pending');
  }, [unplannedRequests]);

  const getRequestsByMe = useCallback((userId: string) => {
    return unplannedRequests.filter(req => req.requesterUserId === userId);
  }, [unplannedRequests]);


  return (
    <UnplannedRequestContext.Provider value={{
      unplannedRequests,
      createUnplannedRequest,
      approveRequest,
      denyRequest,
      cancelRequest,
      getPendingRequestsForApartment,
      getRequestsByMe,
    }}>
      {children}
    </UnplannedRequestContext.Provider>
  );
};
