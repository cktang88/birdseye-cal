import {
  startOfYear,
  endOfYear,
  eachWeekOfInterval,
  getYear,
  format,
  parseISO,
  startOfWeek
} from 'date-fns';
import type { GridCell } from '../types';
import { EVENT_COLORS } from '../constants/grid';

/**
 * Generate all grid cells for a given year range
 * Each cell represents a week in a specific year
 */
export function generateGridCells(startYear: number, endYear: number): GridCell[] {
  const cells: GridCell[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));

    const weeks = eachWeekOfInterval(
      { start: yearStart, end: yearEnd },
      { weekStartsOn: 1 } // Monday
    );

    weeks.forEach((weekStart, index) => {
      const weekNumber = index + 1; // Sequential week number (1, 2, 3, etc.)
      cells.push({
        year,
        week: weekNumber,
        date: weekStart
      });
    });
  }

  return cells;
}

/**
 * Convert a date string to ISO format (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string to Date object
 */
export function fromISODateString(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Get grid position for a given date
 */
export function getGridPosition(date: Date): { year: number; week: number } {
  const year = getYear(date);
  
  // Find which week this date falls into using the same logic as generateGridCells
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  
  const weeks = eachWeekOfInterval(
    { start: yearStart, end: yearEnd },
    { weekStartsOn: 1 }
  );
  
  // Find which week this date falls into
  for (let i = 0; i < weeks.length; i++) {
    const weekStart = weeks[i];
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000); // Add 6 days
    if (date >= weekStart && date <= weekEnd) {
      return {
        year,
        week: i + 1 // Sequential week number
      };
    }
  }
  
  // Fallback to first week
  return {
    year,
    week: 1
  };
}

/**
 * Calculate if a date falls within a specific year-week cell
 */
export function isDateInCell(date: Date, cell: GridCell): boolean {
  const datePos = getGridPosition(date);
  return datePos.year === cell.year && datePos.week === cell.week;
}

/**
 * Get the start of week for a given date
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Get a color from the fixed palette by index
 * Returns colors cycling through the palette
 */
export function getColorFromPalette(index: number): string {
  return EVENT_COLORS[index % EVENT_COLORS.length];
}

/**
 * Generate a random color from the fixed palette
 */
export function randomColor(): string {
  return EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)];
}
