export type Event = {
  id: string;
  name: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  color: string;     // hex color (#rrggbb)
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
}

export type DragState = {
  isDragging: boolean;
  startCell: GridCell | null;
  endCell: GridCell | null;
}
