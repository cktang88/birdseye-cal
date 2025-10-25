import type { Event } from "../../types";
import {
  getGridPosition,
  fromISODateString,
  getMonthFraction,
  getMonthFractionEnd,
} from "../../utils/dateHelpers";
import {
  CELL_TOTAL_WIDTH_PX,
  CELL_GAP_PX,
  LANE_HEIGHT_PX,
  LANE_TOP_OFFSET_PX,
} from "../../constants/grid";

interface EventBarProps {
  event: Event;
  year: number;
  maxMonths: number;
  lane: number; // 0-3, determines vertical position
  maxLanesUsed: number; // Number of overlapping events (1-4) for dynamic height
  onEventClick: (event: Event) => void;
}

export function EventBar({
  event,
  year,
  maxMonths,
  lane,
  maxLanesUsed,
  onEventClick,
}: EventBarProps) {
  const startDate = fromISODateString(event.startDate);
  const endDate = fromISODateString(event.endDate);

  const startPos = getGridPosition(startDate);
  const endPos = getGridPosition(endDate);

  // Only render if event overlaps with this year
  if (endPos.year < year || startPos.year > year) {
    return null;
  }

  // Calculate the bar position within this year
  const barStartMonth = startPos.year === year ? startPos.month : 1;
  const barEndMonth = endPos.year === year ? endPos.month : maxMonths;

  // Calculate fractional offsets within the months
  // For start: if event starts in this year, use the day fraction; otherwise start at 0.0
  const startFraction =
    startPos.year === year ? getMonthFraction(startDate) : 0.0;

  // For end: if event ends in this year, use the day fraction (inclusive); otherwise end at 1.0 (full month)
  const endFraction = endPos.year === year ? getMonthFractionEnd(endDate) : 1.0;

  // Position in pixels with fractional offsets
  // Start position: month cell start + fractional offset within that month
  const left =
    (barStartMonth - 1) * CELL_TOTAL_WIDTH_PX +
    startFraction * CELL_TOTAL_WIDTH_PX;

  // Width calculation:
  // - Total months spanned in pixels
  // - Add the end fraction (portion of the end month)
  // - Subtract the start fraction (portion of start month we're not using)
  // - Subtract the gap
  const totalMonthsWidth =
    (barEndMonth - barStartMonth + 1) * CELL_TOTAL_WIDTH_PX;
  const width =
    totalMonthsWidth -
    startFraction * CELL_TOTAL_WIDTH_PX +
    endFraction * CELL_TOTAL_WIDTH_PX -
    CELL_TOTAL_WIDTH_PX -
    CELL_GAP_PX;

  // Calculate dynamic height based on number of overlapping events
  const eventHeight = LANE_HEIGHT_PX / maxLanesUsed;

  // Calculate vertical position based on lane
  const top = lane * eventHeight + LANE_TOP_OFFSET_PX;

  // Determine text size based on event height
  const textSize =
    eventHeight >= 20
      ? "text-xs"
      : eventHeight >= 12
      ? "text-[10px]"
      : "text-[8px]";
  const lineHeight =
    eventHeight >= 20
      ? "leading-5"
      : eventHeight >= 12
      ? "leading-3"
      : "leading-[10px]";

  return (
    <div
      className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden pointer-events-auto flex items-center"
      style={{
        backgroundColor: event.color,
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: `${eventHeight}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
      title={event.name}
    >
      <span
        className={`${textSize} ${lineHeight} text-white font-medium px-1.5 whitespace-nowrap truncate`}
      >
        {event.name}
      </span>
    </div>
  );
}
