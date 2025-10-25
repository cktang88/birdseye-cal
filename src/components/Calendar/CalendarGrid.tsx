import { useState, useMemo } from "react";
import type { GridCell as GridCellType, DragState, Event } from "../../types";
import { generateGridCells } from "../../utils/dateHelpers";
import { GridCell } from "./GridCell";
import { EventBar } from "./EventBar";

interface CalendarGridProps {
  startYear: number;
  endYear: number;
  events: Event[];
  eventLanesByYear: Map<number, Map<string, number>>;
  onCreateEvent: (startCell: GridCellType, endCell?: GridCellType) => void;
  onEventClick: (event: Event) => void;
}

export function CalendarGrid({
  startYear,
  endYear,
  events,
  eventLanesByYear,
  onCreateEvent,
  onEventClick,
}: CalendarGridProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startCell: null,
    endCell: null,
  });

  // Generate all grid cells
  const gridCells = useMemo(
    () => generateGridCells(startYear, endYear),
    [startYear, endYear]
  );

  // Group cells by year
  const cellsByYear = useMemo(() => {
    const grouped = new Map<number, GridCellType[]>();

    gridCells.forEach((cell) => {
      if (!grouped.has(cell.year)) {
        grouped.set(cell.year, []);
      }
      grouped.get(cell.year)!.push(cell);
    });

    return grouped;
  }, [gridCells]);

  const years = Array.from(cellsByYear.keys()).sort((a, b) => a - b);

  const handleCellClick = () => {
    // Don't create modal on click - let mouse up handle it
    // This prevents duplicate modal creation
  };

  const handleCellMouseDown = (cell: GridCellType) => {
    setDragState({
      isDragging: true,
      startCell: cell,
      endCell: cell,
    });
  };

  const handleCellMouseEnter = (cell: GridCellType) => {
    if (dragState.isDragging) {
      setDragState((prev) => ({
        ...prev,
        endCell: cell,
      }));
    }
  };

  const handleCellMouseUp = (cell?: GridCellType) => {
    if (dragState.isDragging && dragState.startCell) {
      // This was a drag operation
      const start = dragState.startCell;
      const end = dragState.endCell || cell || start;

      onCreateEvent(start, end);

      setDragState({
        isDragging: false,
        startCell: null,
        endCell: null,
      });
    } else if (cell && !dragState.isDragging) {
      // This was a single click (no drag started)
      onCreateEvent(cell);
    }
  };

  const handleContainerMouseUp = () => {
    // Handle mouse up on container (end drag if dragging)
    if (dragState.isDragging && dragState.startCell) {
      const start = dragState.startCell;
      const end = dragState.endCell || start;

      onCreateEvent(start, end);

      setDragState({
        isDragging: false,
        startCell: null,
        endCell: null,
      });
    }
  };

  const isCellInDragSelection = (cell: GridCellType): boolean => {
    if (!dragState.isDragging || !dragState.startCell || !dragState.endCell) {
      return false;
    }

    const start = dragState.startCell;
    const end = dragState.endCell;

    // Calculate cell index for comparison
    const getCellIndex = (c: GridCellType) => c.year * 100 + c.week;
    const cellIndex = getCellIndex(cell);
    const startIndex = getCellIndex(start);
    const endIndex = getCellIndex(end);

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    return cellIndex >= minIndex && cellIndex <= maxIndex;
  };

  // Get max weeks to normalize grid width
  const maxWeeks = Math.max(
    ...Array.from(cellsByYear.values()).map((cells) => cells.length)
  );

  return (
    <div
      className="overflow-auto p-4"
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
    >
      <div className="inline-block">
        {/* Header: Week numbers */}
        <div className="flex mb-2">
          {/* w-16 = YEAR_LABEL_WIDTH_PX (64px) */}
          <div className="w-16 shrink-0" /> {/* Year label space */}
          {Array.from({ length: maxWeeks }, (_, i) => (
            <div
              key={i}
              // w-12 = CELL_WIDTH_PX (48px)
              className="w-12 text-xs text-gray-400 text-center shrink-0"
            >
              {(i + 1) % 5 === 0 ? i + 1 : ""}
            </div>
          ))}
        </div>

        {/* Grid rows by year */}
        {years.map((year) => {
          const cells = cellsByYear.get(year)!;

          return (
            <div key={year} className="flex mb-2">
              {/* Year label - w-16 = YEAR_LABEL_WIDTH_PX (64px) */}
              <div className="w-16 shrink-0 text-sm font-medium text-gray-700 pr-2 text-right">
                {year}
              </div>

              {/* Week cells with event bars overlay - gap-1 = CELL_GAP_PX (4px) */}
              <div className="relative flex gap-1">
                {cells.map((cell) => (
                  <GridCell
                    key={`${cell.year}-${cell.week}`}
                    cell={cell}
                    onCellClick={handleCellClick}
                    onCellMouseDown={handleCellMouseDown}
                    onCellMouseEnter={handleCellMouseEnter}
                    onCellMouseUp={handleCellMouseUp}
                    isInDragSelection={isCellInDragSelection(cell)}
                  />
                ))}

                {/* Event bars overlay for this year */}
                <div className="absolute inset-0 pointer-events-none">
                  {events.map((event) => {
                    const lane = eventLanesByYear.get(year)?.get(event.id) ?? 0;
                    return (
                      <EventBar
                        key={event.id}
                        event={event}
                        year={year}
                        maxWeeks={maxWeeks}
                        lane={lane}
                        onEventClick={onEventClick}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
