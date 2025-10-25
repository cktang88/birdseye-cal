import {
  startOfYear,
  endOfYear,
  eachWeekOfInterval,
  getWeek,
  getYear,
  format,
  parseISO,
  startOfWeek
} from 'date-fns';
import type { GridCell } from '../types';

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
 * Generate a random hex color
 */
export function randomColor(): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
