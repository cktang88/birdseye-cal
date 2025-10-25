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

    weeks.forEach((weekStart) => {
      const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
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
  return {
    year: getYear(date),
    week: getWeek(date, { weekStartsOn: 1 })
  };
}

/**
 * Calculate if a date falls within a specific year-week cell
 */
export function isDateInCell(date: Date, cell: GridCell): boolean {
  const dateYear = getYear(date);
  const dateWeek = getWeek(date, { weekStartsOn: 1 });

  return dateYear === cell.year && dateWeek === cell.week;
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
