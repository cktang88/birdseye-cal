import type { Event } from "../types";
import { fromISODateString, getGridPosition } from "./dateHelpers";

export type EventLayoutInfo = {
  laneMap: Map<string, number>;
  maxLanesUsed: number; // Maximum number of overlapping events (1-6)
};

/**
 * Determines the lane (vertical position) for each event within a year
 * to prevent overlapping. Returns a map of event ID to lane number (0-5)
 * and the maximum number of lanes used for dynamic height calculation.
 */
export function calculateEventLanes(
  events: Event[],
  year: number
): EventLayoutInfo {
  const laneMap = new Map<string, number>();
  let maxLanesUsed = 0;

  // Filter events that appear in this year and sort by start position
  const yearEvents = events
    .map((event) => {
      const startDate = fromISODateString(event.startDate);
      const endDate = fromISODateString(event.endDate);
      const startPos = getGridPosition(startDate);
      const endPos = getGridPosition(endDate);

      // Skip if event doesn't overlap with this year
      if (endPos.year < year || startPos.year > year) {
        return null;
      }

      // Calculate the bar position within this year
      const barStartMonth = startPos.year === year ? startPos.month : 1;
      const barEndMonth = endPos.year === year ? endPos.month : 12;

      return {
        event,
        startMonth: barStartMonth,
        endMonth: barEndMonth,
        startDate: event.startDate,
        endDate: event.endDate,
      };
    })
    .filter((e) => e !== null)
    .sort((a, b) => {
      // Sort by actual start date, not just month
      return a!.startDate.localeCompare(b!.startDate);
    });

  // Track which lanes are occupied by actual end dates
  // lanes[i] = endDate (ISO string) of the event currently occupying lane i (or null if free)
  const lanes: (string | null)[] = [null, null, null, null, null, null]; // Support up to 6 lanes

  for (const item of yearEvents) {
    if (!item) continue;

    const { event, startDate, endDate } = item;

    // Find the first available lane (topmost lane that's free)
    let assignedLane = -1;
    for (let lane = 0; lane < lanes.length; lane++) {
      // A lane is free if it's empty or if the previous event's end date
      // is before or on the same day as the current event's start date
      // (events touching on the same day should not overlap)
      if (lanes[lane] === null || lanes[lane]! <= startDate) {
        // This lane is free at the start date
        assignedLane = lane;
        lanes[lane] = endDate;
        break;
      }
    }

    // If no lane found, assign to lane 0 (will overlap, but better than nothing)
    if (assignedLane === -1) {
      assignedLane = 0;
      lanes[0] = endDate;
    }

    laneMap.set(event.id, assignedLane);
    maxLanesUsed = Math.max(maxLanesUsed, assignedLane + 1);
  }

  return { laneMap, maxLanesUsed: maxLanesUsed || 1 };
}

