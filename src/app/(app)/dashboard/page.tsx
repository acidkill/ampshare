
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSchedule } from '@/hooks/useSchedule';
import { ScheduledAppliance, DayOfWeek, ALL_DAYS, getApartmentDisplayName } from '@/types';
import { ApplianceIcon, getApplianceName } from '@/components/icons/ApplianceIcons';
import { AlertCircle, CalendarCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function DashboardPage() {
  const { getCombinedSchedule, conflictResolutionResult } = useSchedule();
  const combinedSchedule = getCombinedSchedule();

  // Group schedule by day
  const scheduleByDay = ALL_DAYS.reduce((acc, day) => {
    acc[day] = combinedSchedule.filter(item => item.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<DayOfWeek, ScheduledAppliance[]>);

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <CalendarCheck className="h-7 w-7" />
            Combined Appliance Schedule
          </CardTitle>
          <CardDescription>
            Overview of all scheduled high-voltage appliance usage across both households.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conflictResolutionResult && conflictResolutionResult.conflictsDetected && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Scheduling Conflicts Detected!</AlertTitle>
              <AlertDescription>
                {conflictResolutionResult.conflictSummary} Please review the{' '}
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/conflicts">Conflict Resolution page</Link>
                </Button>{' '}
                for suggestions.
              </AlertDescription>
            </Alert>
          )}
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {ALL_DAYS.map(day => (
                <Card key={day} className="min-w-[300px] flex-shrink-0">
                  <CardHeader>
                    <CardTitle className="text-lg">{day}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scheduleByDay[day].length === 0 ? (
                      <p className="text-sm text-muted-foreground">No appliances scheduled.</p>
                    ) : (
                      <ul className="space-y-3">
                        {scheduleByDay[day].map(item => (
                          <li key={item.id} className={`p-3 rounded-md border ${item.apartmentId === 'stensvoll' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                            <div className="flex items-center gap-3">
                              <ApplianceIcon type={item.applianceType} className={`h-6 w-6 ${item.apartmentId === 'stensvoll' ? 'text-blue-600' : 'text-green-600'}`} />
                              <div>
                                <p className="font-semibold">{getApplianceName(item.applianceType)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.startTime} - {item.endTime} ({getApartmentDisplayName(item.apartmentId)})
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
           <div className="mt-6 flex justify-end">
            <Button asChild>
              <Link href="/conflicts">
                <Zap className="mr-2 h-4 w-4" /> Check for Conflicts
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-accent flex items-center gap-2">
            <AlertCircle className="h-7 w-7" />
            Real-time Alerts & Unplanned Requests
          </CardTitle>
          <CardDescription>
            Notifications about upcoming appliance use, potential overloads, and manage unplanned usage requests. (Feature placeholder)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active alerts or pending requests.</p>
          {/* Placeholder for alert list and unplanned request management */}
        </CardContent>
      </Card>
    </div>
  );
}
