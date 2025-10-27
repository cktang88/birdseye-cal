import type { Event } from "../../types";
import {
  getGridPosition,
  fromISODateString,
  getMonthFraction,
  getMonthFractionEnd,
} from "../../utils/dateHelpers";
import { LANE_HEIGHT_PX, LANE_TOP_OFFSET_PX } from "../../constants/grid";
import { getDarkerTextColor } from "../../utils/colorHelpers";

interface EventBarProps {
  event: Event;
  year: number;
  maxMonths: number;
  lane: number; // 0-5, determines vertical position
  maxLanesUsed: number; // Number of overlapping events (1-6) for dynamic height
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

  // Position as percentage (each month is 1/12 = 8.333...%)
  // Start position: (month-1) / 12 + (fraction within that month / 12)
  const leftPercent = ((barStartMonth - 1 + startFraction) / 12) * 100;

  // Width calculation as percentage:
  // Total months spanned, adjusted for fractional start and end
  const monthsSpanned =
    barEndMonth - barStartMonth + 1 - startFraction + endFraction - 1;
  const widthPercent = (monthsSpanned / 12) * 100 - 0.2; // Subtract small gap

  // Calculate dynamic height based on number of overlapping events
  // Minimum of 2 lanes to ensure single events are 50% of max height
  const eventHeight = LANE_HEIGHT_PX / Math.max(maxLanesUsed, 3);

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

  // Determine rounded corners based on whether event starts/ends in this year
  // Only round corners at the actual beginning and end of the event
  const isEventStart = startPos.year === year;
  const isEventEnd = endPos.year === year;

  const BORDER_RADIUS_PX = "12px";

  const borderRadius = `${isEventStart ? BORDER_RADIUS_PX : "0px"} ${
    isEventEnd ? BORDER_RADIUS_PX : "0px"
  } ${isEventEnd ? BORDER_RADIUS_PX : "0px"} ${
    isEventStart ? BORDER_RADIUS_PX : "0px"
  }`;

  // Get darker text color based on background color (Apple Calendar style)
  const textColor = getDarkerTextColor(event.color);

  return (
    <div
      className="absolute cursor-pointer hover:opacity-80 transition-opacity overflow-hidden pointer-events-auto flex items-center select-none"
      style={{
        backgroundColor: event.color,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        top: `${top}px`,
        height: `${eventHeight}px`,
        borderRadius,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
      title={event.name}
    >
      <span
        className={`${textSize} ${lineHeight} font-medium px-1.5 whitespace-nowrap truncate`}
        style={{ color: textColor }}
      >
        {event.name}
      </span>
    </div>
  );
}
