import type { Event } from "../../types";
import { getGridPosition, fromISODateString } from "../../utils/dateHelpers";
import {
  CELL_TOTAL_WIDTH_PX,
  CELL_GAP_PX,
  LANE_HEIGHT_PX,
  LANE_TOP_OFFSET_PX,
} from "../../constants/grid";

interface EventBarProps {
  event: Event;
  year: number;
  maxWeeks: number;
  lane: number; // 0-3, determines vertical position
  onEventClick: (event: Event) => void;
}

export function EventBar({
  event,
  year,
  maxWeeks,
  lane,
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
  const barStartWeek = startPos.year === year ? startPos.week : 1;
  const barEndWeek = endPos.year === year ? endPos.week : maxWeeks;

  // Position in pixels
  const left = (barStartWeek - 1) * CELL_TOTAL_WIDTH_PX;
  const width =
    (barEndWeek - barStartWeek + 1) * CELL_TOTAL_WIDTH_PX - CELL_GAP_PX;

  // Calculate vertical position based on lane
  const top = lane * LANE_HEIGHT_PX + LANE_TOP_OFFSET_PX;

  return (
    <div
      className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden pointer-events-auto"
      style={{
        backgroundColor: event.color,
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: `${LANE_HEIGHT_PX}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
      title={event.name}
    >
      <span className="text-[9px] text-white font-medium pl-1 whitespace-nowrap leading-[12px]">
        {event.name}
      </span>
    </div>
  );
}
