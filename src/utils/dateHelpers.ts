import {
  getYear,
  getMonth,
  getDate,
  getDaysInMonth,
  format,
  parseISO,
  startOfMonth
} from 'date-fns';
import type { GridCell } from '../types';
import { EVENT_COLORS } from '../constants/grid';

/**
 * Generate all grid cells for a given year range
 * Each cell represents a month in a specific year
 */
export function generateGridCells(startYear: number, endYear: number): GridCell[] {
  const cells: GridCell[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      // Create date for first day of this month
      const monthStart = new Date(year, month - 1, 1);
      
      cells.push({
        year,
        month,
        date: monthStart
      });
    }
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
export function getGridPosition(date: Date): { year: number; month: number } {
  const year = getYear(date);
  const month = getMonth(date) + 1; // getMonth returns 0-11, we want 1-12
  
  return {
    year,
    month
  };
}

/**
 * Calculate if a date falls within a specific year-month cell
 */
export function isDateInCell(date: Date, cell: GridCell): boolean {
  const datePos = getGridPosition(date);
  return datePos.year === cell.year && datePos.month === cell.month;
}

/**
 * Get the start of month for a given date
 */
export function getMonthStart(date: Date): Date {
  return startOfMonth(date);
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

/**
 * Get month names
 */
export function getMonthNames(): string[] {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

/**
 * Get month name for a given month number (1-12)
 */
export function getMonthName(month: number): string {
  const monthNames = getMonthNames();
  return monthNames[month - 1] || '';
}

/**
 * Get the day of the month for a given date (1-31)
 */
export function getDayOfMonth(date: Date): number {
  return getDate(date);
}

/**
 * Get the total number of days in the month for a given date
 */
export function getTotalDaysInMonth(date: Date): number {
  return getDaysInMonth(date);
}

/**
 * Calculate the fractional position within a month for a START date (0.0 to ~0.97)
 * For example, Jan 1 = 0.0, Jan 15 (in 31-day month) ≈ 0.45, Jan 31 ≈ 0.97
 * This represents the START of the day.
 */
export function getMonthFraction(date: Date): number {
  const day = getDayOfMonth(date);
  const totalDays = getTotalDaysInMonth(date);
  // Subtract 1 from day to make the first day start at 0.0
  // Use (day - 1) / totalDays to get a fraction from 0.0 to ~0.97 (not 1.0)
  return (day - 1) / totalDays;
}

/**
 * Calculate the fractional position within a month for an END date (0.0 to 1.0)
 * For example, Jan 1 = ~0.032, Jan 15 (in 31-day month) ≈ 0.48, Jan 31 = 1.0
 * This represents the END of the day (inclusive).
 */
export function getMonthFractionEnd(date: Date): number {
  const day = getDayOfMonth(date);
  const totalDays = getTotalDaysInMonth(date);
  // Don't subtract 1, so the end of day 1 = 1/31, end of day 31 = 31/31 = 1.0
  return day / totalDays;
}
