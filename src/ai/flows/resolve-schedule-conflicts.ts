// src/ai/flows/resolve-schedule-conflicts.ts
'use server';

/**
 * @fileOverview Detects and resolves scheduling conflicts for high-voltage appliances in a two-apartment building.
 *
 * - resolveScheduleConflicts - A function that takes in appliance schedules and suggests alternative times to resolve conflicts.
 * - ResolveScheduleConflictsInput - The input type for the resolveScheduleConflicts function.
 * - ResolveScheduleConflictsOutput - The return type for the resolveScheduleConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplianceSchema = z.object({
  applianceType: z.string().describe('The type of appliance (e.g., car charger, oven, washing machine).'),
  startTime: z.string().describe('The start time of the appliance usage (e.g., HH:mm).'),
  endTime: z.string().describe('The end time of the appliance usage (e.g., HH:mm).'),
  apartment: z.string().describe('The apartment number using the appliance (e.g., Apartment 1, Apartment 2).'),
  dayOfWeek: z.string().describe('The day of the week for the appliance usage (e.g., Monday, Tuesday).'),
});

const ResolveScheduleConflictsInputSchema = z.object({
  apartment1Schedule: z.array(ApplianceSchema).describe('The schedule for apartment 1.'),
  apartment2Schedule: z.array(ApplianceSchema).describe('The schedule for apartment 2.'),
  usageHistory: z.string().optional().describe('Historical appliance usage data for both apartments.'),
  userPreferences: z.string().optional().describe('User preferences for appliance usage scheduling.'),
});

export type ResolveScheduleConflictsInput = z.infer<typeof ResolveScheduleConflictsInputSchema>;

const SuggestedTimeSchema = z.object({
  applianceType: z.string().describe('The type of appliance.'),
  suggestedStartTime: z.string().describe('The suggested start time (e.g., HH:mm).'),
  suggestedEndTime: z.string().describe('The suggested end time (e.g., HH:mm).'),
  reason: z.string().describe('The reason for the suggested time change.'),
});

const ResolveScheduleConflictsOutputSchema = z.object({
  conflictsDetected: z.boolean().describe('Whether or not conflicts were detected in the schedule.'),
  conflictSummary: z.string().describe('A summary of the detected conflicts.'),
  suggestedTimeChanges: z.array(SuggestedTimeSchema).describe('Suggested time changes to resolve conflicts.'),
});

export type ResolveScheduleConflictsOutput = z.infer<typeof ResolveScheduleConflictsOutputSchema>;

export async function resolveScheduleConflicts(input: ResolveScheduleConflictsInput): Promise<ResolveScheduleConflictsOutput> {
  return resolveScheduleConflictsFlow(input);
}

const resolveScheduleConflictsPrompt = ai.definePrompt({
  name: 'resolveScheduleConflictsPrompt',
  input: {schema: ResolveScheduleConflictsInputSchema},
  output: {schema: ResolveScheduleConflictsOutputSchema},
  prompt: `You are an AI assistant designed to detect and resolve scheduling conflicts for high-voltage appliances in a two-apartment building.

You will receive the schedules for both apartments, and you should identify any overlapping appliance usage.

Based on the usage history and user preferences, suggest alternative times to resolve the conflicts.

Apartment 1 Schedule:
{{#each apartment1Schedule}}
- {{dayOfWeek}}: {{applianceType}} from {{startTime}} to {{endTime}}
{{/each}}

Apartment 2 Schedule:
{{#each apartment2Schedule}}
- {{dayOfWeek}}: {{applianceType}} from {{startTime}} to {{endTime}}
{{/each}}

Usage History: {{{usageHistory}}}
User Preferences: {{{userPreferences}}}

Output:
Conflicts Detected: {{conflictsDetected}}
Conflict Summary: {{conflictSummary}}
Suggested Time Changes: {{#each suggestedTimeChanges}}- Appliance: {{applianceType}}, Suggested Start Time: {{suggestedStartTime}}, Suggested End Time: {{suggestedEndTime}}, Reason: {{reason}}\n{{/each}}`,
});

const resolveScheduleConflictsFlow = ai.defineFlow(
  {
    name: 'resolveScheduleConflictsFlow',
    inputSchema: ResolveScheduleConflictsInputSchema,
    outputSchema: ResolveScheduleConflictsOutputSchema,
  },
  async input => {
    const {output} = await resolveScheduleConflictsPrompt(input);
    return output!;
  }
);
