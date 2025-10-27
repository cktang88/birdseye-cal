import type { Event } from "../types";
import { fromISODateString, getGridPosition } from "./dateHelpers";

export type EventLayoutInfo = {
  laneMap: Map<string, number>;
  maxLanesUsed: number; // Maximum number of overlapping events (1-6)
  maxLanesPerEvent: Map<string, number>; // Max lanes for each event based on actual overlaps
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
  const maxLanesPerEvent = new Map<string, number>();
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
      // Sort by actual start date first
      const startCompare = a!.startDate.localeCompare(b!.startDate);
      if (startCompare !== 0) return startCompare;
      
      // If start dates are the same, sort by end date (longer events first)
      const endCompare = b!.endDate.localeCompare(a!.endDate);
      if (endCompare !== 0) return endCompare;
      
      // If both start and end are the same, sort by event ID for deterministic ordering
      return a!.event.id.localeCompare(b!.event.id);
    });

  // For each event, check which lanes are occupied by events that would overlap with it
  for (let i = 0; i < yearEvents.length; i++) {
    const item = yearEvents[i];
    if (!item) continue;

    const { event, startDate, endDate } = item;

    // Check which lanes are already occupied by events that overlap with this one
    const occupiedLanes = new Set<number>();
    for (let j = 0; j < i; j++) {
      const otherItem = yearEvents[j];
      if (!otherItem) continue;

      // Check if this event overlaps with the other event
      // Events overlap if they share any day: startA <= endB AND startB <= endA
      // Using <= handles single-day events correctly
      if (startDate <= otherItem.endDate && otherItem.startDate <= endDate) {
        const otherLane = laneMap.get(otherItem.event.id);
        if (otherLane !== undefined) {
          occupiedLanes.add(otherLane);
        }
      }
    }

    // Find the first available lane (lowest number not in occupiedLanes)
    let assignedLane = 0;
    while (occupiedLanes.has(assignedLane) && assignedLane < 6) {
      assignedLane++;
    }

    laneMap.set(event.id, assignedLane);
    maxLanesUsed = Math.max(maxLanesUsed, assignedLane + 1);
  }

  // Second pass: Group events into overlap clusters
  // Events in the same cluster (transitively overlapping) should have the same height
  const eventGroups: Set<Set<number>> = new Set();
  const eventToGroup = new Map<number, Set<number>>();

  for (let i = 0; i < yearEvents.length; i++) {
    const item = yearEvents[i];
    if (!item) continue;

    // Find all events that directly overlap with this event
    const overlappingIndices = new Set<number>([i]);
    for (let j = 0; j < yearEvents.length; j++) {
      if (i === j) continue;
      const otherItem = yearEvents[j];
      if (!otherItem) continue;

      // Check if the two events overlap (share any day)
      // Events overlap if: startA <= endB AND startB <= endA
      // Using <= handles single-day events correctly
      if (item.startDate <= otherItem.endDate && otherItem.startDate <= item.endDate) {
        overlappingIndices.add(j);
      }
    }

    // Merge with existing groups if any of the overlapping events are already in a group
    let targetGroup: Set<number> | null = null;
    for (const idx of overlappingIndices) {
      if (eventToGroup.has(idx)) {
        const existingGroup = eventToGroup.get(idx)!;
        if (targetGroup === null) {
          targetGroup = existingGroup;
        } else if (targetGroup !== existingGroup) {
          // Merge two groups
          for (const memberIdx of existingGroup) {
            targetGroup.add(memberIdx);
            eventToGroup.set(memberIdx, targetGroup);
          }
          eventGroups.delete(existingGroup);
        }
      }
    }

    // If no existing group found, create a new one
    if (targetGroup === null) {
      targetGroup = new Set<number>();
      eventGroups.add(targetGroup);
    }

    // Add all overlapping events to the target group
    for (const idx of overlappingIndices) {
      targetGroup.add(idx);
      eventToGroup.set(idx, targetGroup);
    }
  }

  // Calculate max lanes for each group
  const groupMaxLanes = new Map<Set<number>, number>();
  for (const group of eventGroups) {
    let maxLanes = 1;
    for (const idx of group) {
      const item = yearEvents[idx];
      if (!item) continue;
      const lane = laneMap.get(item.event.id) ?? 0;
      maxLanes = Math.max(maxLanes, lane + 1);
    }
    groupMaxLanes.set(group, maxLanes);
  }

  // Assign max lanes to each event based on its group
  for (let i = 0; i < yearEvents.length; i++) {
    const item = yearEvents[i];
    if (!item) continue;
    const group = eventToGroup.get(i);
    if (group) {
      const maxLanes = groupMaxLanes.get(group) ?? 1;
      maxLanesPerEvent.set(item.event.id, maxLanes);
    } else {
      maxLanesPerEvent.set(item.event.id, 1);
    }
  }

  return { laneMap, maxLanesUsed: maxLanesUsed || 1, maxLanesPerEvent };
}

