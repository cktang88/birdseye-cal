import type { Event } from '../../types';
import { getGridPosition, fromISODateString } from '../../utils/dateHelpers';

interface EventBarProps {
  event: Event;
  year: number;
  maxWeeks: number;
  onEventClick: (event: Event) => void;
}

export function EventBar({ event, year, maxWeeks, onEventClick }: EventBarProps) {
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

  // Position in pixels (assuming 12px per cell + 1px gap)
  const cellWidth = 13; // 12px width + 1px gap
  const left = (barStartWeek - 1) * cellWidth;
  const width = (barEndWeek - barStartWeek + 1) * cellWidth - 1; // -1 to account for gap

  return (
    <div
      className="absolute h-3 rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
      style={{
        backgroundColor: event.color,
        left: `${left}px`,
        width: `${width}px`,
        top: 0,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
      title={event.name}
    >
      <span className="text-[10px] text-white font-medium pl-1 whitespace-nowrap">
        {event.name}
      </span>
    </div>
  );
}
