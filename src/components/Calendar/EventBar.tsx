import type { Event } from "../../types";
import { getGridPosition, fromISODateString } from "../../utils/dateHelpers";

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

  // Position in pixels (48px per cell + 4px gap)
  const cellWidth = 52; // 48px width + 4px gap (w-12 + gap-1)
  const left = (barStartWeek - 1) * cellWidth;
  const width = (barEndWeek - barStartWeek + 1) * cellWidth - 4; // -4 to account for gap

  // Calculate vertical position based on lane (cell height is 48px, each lane is 12px)
  const laneHeight = 10; // 25% of 48px
  const top = lane * laneHeight + 18;

  return (
    <div
      className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden pointer-events-auto"
      style={{
        backgroundColor: event.color,
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: `${laneHeight}px`,
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
