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

/**
 * Calculate age at a specific month/year given a birthday
 * Returns the age they turn in that month of that year, or null if birthday not set
 * or if the month hasn't reached their birthday month yet in that year
 */
export function calculateAgeAtCell(
  birthday: string | null,
  year: number,
  month: number
): number | null {
  if (!birthday) return null;

  const birthDate = parseISO(birthday);
  const birthYear = getYear(birthDate);
  const birthMonth = getMonth(birthDate) + 1; // getMonth returns 0-11, we want 1-12

  // Only show age in the birth month
  if (month !== birthMonth) return null;

  // Calculate age: the age they turn in this year
  const age = year - birthYear;

  // Don't show age for years before they were born
  if (age < 0) return null;

  return age;
}


  // Parse duration string (e.g., "1.5y", "3m", "1d") and calculate end date
export function parseDurationAndCalculateEndDate(
    startDate: string,
    duration: string
  ): string | null  {
    if (!startDate || !duration) return null;

    const match = duration.trim().match(/^(\d+\.?\d*)\s*([ymwdh])$/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    const start = new Date(startDate);
    let end = new Date(start);

    // For fractional values, convert to days for accurate calculation
    const hasFraction = value % 1 !== 0;

    if (hasFraction) {
      let daysToAdd = 0;
      switch (unit) {
        case "y": // years (approximate: 365.25 days per year)
          daysToAdd = value * 365.25;
          break;
        case "m": // months (approximate: 30.44 days per month)
          daysToAdd = value * 30.44;
          break;
        case "w": // weeks
          daysToAdd = value * 7;
          break;
        case "d": // days
          daysToAdd = value;
          break;
        case "h": // hours
          end = new Date(start.getTime() + value * 60 * 60 * 1000);
          return toISODateString(end);
        default:
          return null;
      }
      // Add days using milliseconds for precision
      end = new Date(
        start.getTime() + Math.round(daysToAdd * 24 * 60 * 60 * 1000)
      );
    } else {
      // For whole numbers, use the built-in methods for more accurate month/year handling
      switch (unit) {
        case "y": // years
          end.setFullYear(end.getFullYear() + value);
          break;
        case "m": // months
          end.setMonth(end.getMonth() + value);
          break;
        case "w": // weeks
          end.setDate(end.getDate() + value * 7);
          break;
        case "d": // days
          end.setDate(end.getDate() + value);
          break;
        case "h": // hours
          end.setHours(end.getHours() + value);
          break;
        default:
          return null;
      }
    }

    return toISODateString(end);
  };

/**
 * Calculate duration string from start and end dates
 * Returns a duration string like "3m" or "1.5y"
 */
export function calculateDurationFromDates(
  startDate: string,
  endDate: string
): string {
  if (!startDate || !endDate) return "1m";

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate difference in milliseconds
  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // If less than 7 days, return in days
  if (diffDays < 7) {
    return `${Math.max(1, Math.round(diffDays))}d`;
  }

  // If less than 60 days, return in weeks
  if (diffDays < 60) {
    const weeks = diffDays / 7;
    return `${Math.round(weeks * 10) / 10}w`;
  }

  // Calculate month difference
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();
  const endDay = end.getDate();

  // Calculate the number of full or partial months between the dates
  let monthDiff = (endYear - startYear) * 12 + (endMonth - startMonth);
  
  // If the end day is greater than or equal to start day, count it as a full additional month
  if (endDay >= startDay) {
    monthDiff += 1;
  }

  // If less than 12 months, return in months
  if (monthDiff < 12) {
    return `${Math.max(1, monthDiff)}m`;
  }

  // Return in years
  const years = monthDiff / 12;
  // Round to 1 decimal place
  const roundedYears = Math.round(years * 10) / 10;
  return `${roundedYears}y`;
}