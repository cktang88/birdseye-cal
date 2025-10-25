import type { Event } from "../types";
import { fromISODateString, getGridPosition } from "./dateHelpers";

export type EventLayoutInfo = {
  laneMap: Map<string, number>;
  maxLanesUsed: number; // Maximum number of overlapping events (1-4)
};

/**
 * Determines the lane (vertical position) for each event within a year
 * to prevent overlapping. Returns a map of event ID to lane number (0-3)
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
      };
    })
    .filter((e) => e !== null)
    .sort((a, b) => a!.startMonth - b!.startMonth);

  // Track which lanes are occupied by which month ranges
  // lanes[i] = endMonth of the event currently occupying lane i (or -1 if free)
  const lanes: number[] = [-1, -1, -1, -1]; // Support up to 4 lanes

  for (const item of yearEvents) {
    if (!item) continue;

    const { event, startMonth, endMonth } = item;

    // Find the first available lane (topmost lane that's free)
    let assignedLane = -1;
    for (let lane = 0; lane < lanes.length; lane++) {
      if (lanes[lane] < startMonth) {
        // This lane is free at the start month
        assignedLane = lane;
        lanes[lane] = endMonth;
        break;
      }
    }

    // If no lane found, assign to lane 0 (will overlap, but better than nothing)
    if (assignedLane === -1) {
      assignedLane = 0;
      lanes[0] = endMonth;
    }

    laneMap.set(event.id, assignedLane);
    maxLanesUsed = Math.max(maxLanesUsed, assignedLane + 1);
  }

  return { laneMap, maxLanesUsed: maxLanesUsed || 1 };
}

