export type Calendar = {
  id: string;
  name: string;
  color: string; // hex color for calendar identification
}

export type Event = {
  id: string;
  name: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  color: string;     // hex color (#rrggbb)
  calendarId?: string; // optional for backward compatibility
  duration?: string; // optional duration string (e.g., "1.5y", "3m", "1d")
}

export type GridCell = {
  year: number;
  month: number; // 1-12
  date: Date;    // First day of that month
}

export type EventFormData = {
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  calendarId?: string;
  duration?: string; // optional duration string (e.g., "1.5y", "3m", "1d")
}

export type DragState = {
  isDragging: boolean;
  startCell: GridCell | null;
  endCell: GridCell | null;
}
