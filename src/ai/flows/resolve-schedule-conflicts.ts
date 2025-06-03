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
  apartment: z.string().describe('The apartment name using the appliance (e.g., Stensvoll, Nowak).'),
  dayOfWeek: z.string().describe('The day of the week for the appliance usage (e.g., Monday, Tuesday).'),
});

const ResolveScheduleConflictsInputSchema = z.object({
  stensvollSchedule: z.array(ApplianceSchema).describe('The schedule for Stensvoll household.'),
  nowakSchedule: z.array(ApplianceSchema).describe('The schedule for Nowak household.'),
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
  prompt: `You are an AI assistant designed to detect and resolve scheduling conflicts for high-voltage appliances in a two-household building (Stensvoll and Nowak).

You must adhere to the following critical rules for identifying conflicts:
1.  **Car Charger Limit:** A maximum of one car charger can be active simultaneously across both the Stensvoll and Nowak households. If schedules show more than one car charger operating at the same time on the same day, this is a conflict.
2.  **Concurrent Appliance Limit with Car Charger:** If a car charger is active in either household, a maximum of two *other* high-voltage appliances (e.g., oven, washing machine, dryer, dishwasher) can be active simultaneously across both households in total during that car charger's operation period on that day. Usage exceeding this limit (i.e., a car charger plus three or more other appliances) is a conflict. If no car charger is active, this specific limit of two other appliances does not apply, but general overlapping usage of any appliances should still be identified as conflicts if they occur (e.g., multiple high-draw appliances from the same household at once, or too many overall).

You will receive the schedules for both households. Identify any overlapping appliance usage and any violations of the critical rules above.

Based on the usage history (if provided) and user preferences (if provided), suggest alternative times to resolve the conflicts. Prioritize resolving violations of the critical rules.

Stensvoll Household Schedule:
{{#each stensvollSchedule}} 
- {{dayOfWeek}}: {{applianceType}} from {{startTime}} to {{endTime}}
{{/each}}

Nowak Household Schedule:
{{#each nowakSchedule}}
- {{dayOfWeek}}: {{applianceType}} from {{startTime}} to {{endTime}}
{{/each}}

Usage History: {{{usageHistory}}}
User Preferences: {{{userPreferences}}}

Output:
If conflicts are detected, set 'conflictsDetected' to true and provide a clear 'conflictSummary' detailing each conflict, especially violations of the car charger and concurrent use rules.
If no conflicts are detected, set 'conflictsDetected' to false and 'conflictSummary' can state that no conflicts were found or provide a positive affirmation.
Provide 'suggestedTimeChanges' to resolve any identified conflicts. If no conflicts, this array can be empty.`,
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
