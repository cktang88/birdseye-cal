import type { GridCell as GridCellType } from "../../types";

interface GridCellProps {
  cell: GridCellType;
  onCellClick: (cell: GridCellType) => void;
  onCellMouseDown: (cell: GridCellType) => void;
  onCellMouseEnter: (cell: GridCellType) => void;
  onCellMouseUp: (cell: GridCellType) => void;
  isInDragSelection: boolean;
}

export function GridCell({
  cell,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  isInDragSelection,
}: GridCellProps) {
  return (
    <div
      className={`
        w-12 h-12
        border border-gray-300
        hover:bg-blue-100
        cursor-pointer
        transition-colors
        ${isInDragSelection ? "bg-blue-100" : "bg-white"}
      `}
      onClick={() => onCellClick(cell)}
      onMouseDown={() => onCellMouseDown(cell)}
      onMouseEnter={() => onCellMouseEnter(cell)}
      onMouseUp={() => onCellMouseUp(cell)}
      title={`Year ${cell.year}, Week ${cell.week}`}
    />
  );
}
