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
  }) => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  denyRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  getPendingRequestsForApartment: (apartmentId: ApartmentId) => UnplannedRequest[];
  getRequestsByMe: (userId: string) => UnplannedRequest[];
  loadingRequests: boolean;
}

export const UnplannedRequestContext = createContext<UnplannedRequestContextType | undefined>(undefined);

export const UnplannedRequestProvider = ({ children }: { children: ReactNode }) => {
  const [unplannedRequests, setUnplannedRequests] = useState<UnplannedRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchUnplannedRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch('/api/unplanned-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch unplanned requests');
      }
      const data: UnplannedRequest[] = await response.json();
      setUnplannedRequests(data);
    } catch (error) {
      console.error("Error fetching unplanned requests:", error);
      toast({
        title: "Error",
        description: "Could not load unplanned requests.",
        variant: "destructive",
      });
    } finally {
      setLoadingRequests(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUnplannedRequests();
  }, [fetchUnplannedRequests]);

  const createUnplannedRequest = useCallback(async (requestData: {
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

    const newRequestPayload = {
      requesterUserId: currentUser.id,
      requesterApartmentId: currentUser.apartmentId,
      targetApartmentId: currentUser.apartmentId === 'stensvoll' ? 'nowak' : 'stensvoll',
      ...requestData,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/unplanned-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequestPayload),
      });
      if (!response.ok) {
        throw new Error('Failed to create unplanned request');
      }
      const newRequest = await response.json();
      setUnplannedRequests(prev => [...prev, newRequest]);
      toast({ title: "Request Submitted", description: `Your request for ${requestData.applianceType} has been sent.` });
    } catch (error) {
      console.error("Error creating unplanned request:", error);
      toast({ title: "Error", description: "Could not submit unplanned request.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const updateRequestStatus = useCallback(async (requestId: string, status: UnplannedRequestStatus, actionVerb: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/unplanned-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, respondedAt: new Date().toISOString(), responderUserId: currentUser.id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${actionVerb.toLowerCase()} request`);
      }
      const updatedRequest = await response.json();
      setUnplannedRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? updatedRequest
            : req
        )
      );
      toast({ title: `Request ${actionVerb}`, description: `The request has been ${actionVerb.toLowerCase()}.` });
    } catch (error) {
      console.error(`Error ${actionVerb.toLowerCase()} request:`, error);
      toast({ title: "Error", description: `Could not ${actionVerb.toLowerCase()} request.`, variant: "destructive" });
    }
  }, [currentUser, toast]);

  const approveRequest = useCallback(async (requestId: string) => {
    await updateRequestStatus(requestId, 'approved', 'Approved');
  }, [updateRequestStatus]);

  const denyRequest = useCallback(async (requestId: string) => {
    await updateRequestStatus(requestId, 'denied', 'Denied');
  }, [updateRequestStatus]);

  const cancelRequest = useCallback(async (requestId: string) => {
    if (!currentUser) return;
    const requestToCancel = unplannedRequests.find(req => req.id === requestId);

    if (requestToCancel && requestToCancel.requesterUserId === currentUser.id && requestToCancel.status === 'pending') {
      try {
        const response = await fetch(`/api/unplanned-requests/${requestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        if (!response.ok) {
          throw new Error('Failed to cancel request');
        }
        const updatedRequest = await response.json();
        setUnplannedRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? updatedRequest
              : req
          )
        );
        toast({ title: "Request Cancelled", description: "Your request has been cancelled." });
      } catch (error) {
        console.error("Error cancelling request:", error);
        toast({ title: "Error", description: "Could not cancel request.", variant: "destructive" });
      }
    } else {
      toast({ title: "Error", description: "Cannot cancel this request.", variant: "destructive" });
    }
  }, [currentUser, unplannedRequests, toast]);


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
      loadingRequests,
    }}>
      {children}
    </UnplannedRequestContext.Provider>
  );
};
