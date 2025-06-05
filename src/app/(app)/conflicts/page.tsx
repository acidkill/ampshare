'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchedule } from '@/hooks/useSchedule';
import { Zap, Lightbulb, AlertTriangle, CheckCircle2, RefreshCw, PackageOpen } from 'lucide-react';
import { ApplianceIcon, getApplianceName } from '@/components/icons/ApplianceIcons';
import { AISuggestedTimeChange } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function ConflictResolutionPage() {
  const { runConflictDetection, loadingConflicts, conflictResolutionResult, clearConflictResult } = useSchedule();

  const handleResolveSuggestion = (suggestion: AISuggestedTimeChange) => {
    // Placeholder for applying suggestion. This would involve:
    // 1. Finding the original conflicting item.
    // 2. Updating its startTime and endTime.
    // 3. Potentially creating new items if the suggestion splits tasks.
    // 4. Calling updateScheduleItem.
    alert(`Applying suggestion for ${suggestion.applianceType}: ${suggestion.suggestedStartTime} - ${suggestion.suggestedEndTime}. (Functionality to be implemented)`);
    // After applying, ideally re-run conflict detection or update UI.
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Zap className="h-7 w-7" />
            Schedule Conflict Resolution
          </CardTitle>
          <CardDescription>
            Detect and resolve overlapping appliance usage with AI-powered suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex justify-center">
            <Button onClick={runConflictDetection} disabled={loadingConflicts} size="lg">
              {loadingConflicts ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Detecting Conflicts...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> Detect Scheduling Conflicts
                </>
              )}
            </Button>
            {conflictResolutionResult && (
                 <Button onClick={clearConflictResult} variant="outline" className="ml-4" size="lg">
                    Clear Results
                </Button>
            )}
          </div>

          {conflictResolutionResult && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {conflictResolutionResult.conflictsDetected ? (
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    )}
                    Detection Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {conflictResolutionResult.conflictsDetected ? (
                     <p className="text-destructive">{conflictResolutionResult.conflictSummary}</p>
                  ) : (
                    <p className="text-green-600">{conflictResolutionResult.conflictSummary || "No conflicts found."}</p>
                  )}
                 
                </CardContent>
              </Card>

              {conflictResolutionResult.conflictsDetected && conflictResolutionResult.suggestedTimeChanges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-6 w-6 text-accent" />
                      Suggested Resolutions
                    </CardTitle>
                     <CardDescription>AI recommendations to resolve detected conflicts. You can accept a suggestion or manually adjust your schedule.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {conflictResolutionResult.suggestedTimeChanges.map((suggestion, index) => (
                      <Card key={index} className="bg-accent/10 border-accent">
                        <CardHeader className="pb-3">
                           <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ApplianceIcon type={suggestion.applianceType as any} className="h-5 w-5 text-accent"/>
                                {getApplianceName(suggestion.applianceType as any)}
                            </CardTitle>
                            <Badge variant="outline" className="border-accent text-accent">AI Suggestion</Badge>
                           </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p>
                            <strong>Suggested Time:</strong> {suggestion.suggestedStartTime} - {suggestion.suggestedEndTime}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {suggestion.reason}
                          </p>
                          <div className="flex gap-2 pt-2">
                            <Button onClick={() => handleResolveSuggestion(suggestion)} size="sm">
                              Accept Suggestion
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => alert('Manual override functionality to be implemented. Please adjust the schedule directly on the apartment schedule pages.')}>
                              Manual Override
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}
               {conflictResolutionResult.conflictsDetected && conflictResolutionResult.suggestedTimeChanges.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                    Conflicts were detected, but the AI could not provide specific time change suggestions. Please review your schedule manually.
                </p>
               )}
            </div>
          )}
           {!loadingConflicts && !conflictResolutionResult && (
            <div className="text-center py-10">
                <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Click &quot;Detect Scheduling Conflicts&quot; to analyze your current schedule.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
