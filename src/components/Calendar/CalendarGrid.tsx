import { useState, useMemo } from 'react';
import type { GridCell as GridCellType, DragState } from '../../types';
import { generateGridCells } from '../../utils/dateHelpers';
import { GridCell } from './GridCell';

interface CalendarGridProps {
  startYear: number;
  endYear: number;
  onCreateEvent: (startCell: GridCellType, endCell?: GridCellType) => void;
}

export function CalendarGrid({
  startYear,
  endYear,
  onCreateEvent,
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

  const handleCellClick = (cell: GridCellType) => {
    if (!dragState.isDragging) {
      onCreateEvent(cell);
    }
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

  const handleCellMouseUp = () => {
    if (dragState.isDragging && dragState.startCell && dragState.endCell) {
      // Determine which cell is actually the start and end (in case user dragged backwards)
      const start = dragState.startCell;
      const end = dragState.endCell;

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
      onMouseUp={handleCellMouseUp}
      onMouseLeave={handleCellMouseUp}
    >
      <div className="inline-block">
        {/* Header: Week numbers */}
        <div className="flex mb-2">
          <div className="w-16 flex-shrink-0" /> {/* Year label space */}
          {Array.from({ length: maxWeeks }, (_, i) => (
            <div
              key={i}
              className="w-3 text-xs text-gray-400 text-center flex-shrink-0"
            >
              {(i + 1) % 5 === 0 ? i + 1 : ''}
            </div>
          ))}
        </div>

        {/* Grid rows by year */}
        {years.map((year) => {
          const cells = cellsByYear.get(year)!;

          return (
            <div key={year} className="flex mb-1">
              {/* Year label */}
              <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-700 pr-2 text-right">
                {year}
              </div>

              {/* Week cells */}
              <div className="flex gap-px">
                {cells.map((cell) => (
                  <div key={`${cell.year}-${cell.week}`} className="w-3 h-3">
                    <GridCell
                      cell={cell}
                      onCellClick={handleCellClick}
                      onCellMouseDown={handleCellMouseDown}
                      onCellMouseEnter={handleCellMouseEnter}
                      onCellMouseUp={handleCellMouseUp}
                      isInDragSelection={isCellInDragSelection(cell)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
