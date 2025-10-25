import type { GridCell as GridCellType } from "../../types";
import { calculateAgeAtCell } from "../../utils/dateHelpers";

interface GridCellProps {
  cell: GridCellType;
  birthday: string | null;
  onCellClick: (cell: GridCellType) => void;
  onCellMouseDown: (cell: GridCellType) => void;
  onCellMouseEnter: (cell: GridCellType) => void;
  onCellMouseUp: (cell: GridCellType) => void;
  isInDragSelection: boolean;
}

export function GridCell({
  cell,
  birthday,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  isInDragSelection,
}: GridCellProps) {
  const age = calculateAgeAtCell(birthday, cell.year, cell.month);

  // Add stronger border for quarter boundaries (months 3, 6, 9, 12)
  const isQuarterEnd = cell.month % 3 === 0;
  const isFirstMonth = cell.month === 1;

  return (
    <div
      // w-32 = CELL_WIDTH_PX (128px), h-25 = CELL_HEIGHT_PX (100px)
      className={`
        w-32 h-25
        ${
          isQuarterEnd
            ? "border-r-2 border-gray-300"
            : "border-r border-gray-200"
        }
        ${isFirstMonth ? "border-l-2 border-gray-300" : ""}
        hover:bg-blue-50
        cursor-pointer
        transition-colors
        relative
        bg-transparent
        ${isInDragSelection ? "!bg-blue-100" : ""}
      `}
      onClick={() => onCellClick(cell)}
      onMouseDown={() => onCellMouseDown(cell)}
      onMouseEnter={() => onCellMouseEnter(cell)}
      onMouseUp={() => onCellMouseUp(cell)}
      title={`Year ${cell.year}, Month ${cell.month}`}
    >
      {age !== null && (
        <div className="absolute top-1 right-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-full w-5 h-5 flex items-center justify-center border border-purple-200 z-50">
          {age}
        </div>
      )}
    </div>
  );
}
