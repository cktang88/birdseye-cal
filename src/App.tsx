import { useState, useMemo } from "react";
import { CalendarGrid } from "./components/Calendar/CalendarGrid";
import { EventModal } from "./components/Modal/EventModal";
import { SettingsModal } from "./components/Modal/SettingsModal";
import { useEventStore } from "./store/eventStore";
import { useUserStore, DEFAULT_CALENDAR_ID } from "./store/userStore";
import type { Event, GridCell, EventFormData } from "./types";
import { toISODateString, randomColor } from "./utils/dateHelpers";
import { calculateEventLanes } from "./utils/eventLayout";

function App() {
  const currentYear = new Date().getFullYear();
  const [yearRange] = useState({
    start: currentYear,
    end: currentYear + 15,
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initialData?: Partial<EventFormData>;
    editingEvent?: Event;
  }>({
    isOpen: false,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
  const { calendars, activeCalendarId, setActiveCalendar } = useUserStore();

  const handleCreateEvent = (startCell: GridCell, endCell?: GridCell) => {
    const startDate = toISODateString(startCell.date);
    const endDate = endCell ? toISODateString(endCell.date) : startDate;

    setModalState({
      isOpen: true,
      initialData: {
        startDate,
        endDate,
        color: randomColor(),
      },
    });
  };

  const handleEventClick = (event: Event) => {
    setModalState({
      isOpen: true,
      editingEvent: event,
    });
  };

  const handleModalSave = (formData: EventFormData) => {
    if (modalState.editingEvent) {
      updateEvent(modalState.editingEvent.id, formData);
    } else {
      addEvent(formData);
    }
  };

  const handleModalDelete = () => {
    if (modalState.editingEvent) {
      deleteEvent(modalState.editingEvent.id);
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  // Filter events by active calendar
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // If no calendarId is set (backward compatibility), treat as default calendar
      const eventCalId = event.calendarId || DEFAULT_CALENDAR_ID;
      return eventCalId === activeCalendarId;
    });
  }, [events, activeCalendarId]);

  // Calculate event lanes for each year to prevent overlapping
  const eventLayoutByYear = useMemo(() => {
    const layoutByYear = new Map();
    for (let year = yearRange.start; year <= yearRange.end; year++) {
      layoutByYear.set(year, calculateEventLanes(filteredEvents, year));
    }
    return layoutByYear;
  }, [filteredEvents, yearRange]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              BirdsEye Calendar
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Long-term event visualization • Click or drag to create events
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Calendar Switcher */}
            <select
              value={activeCalendarId}
              onChange={(e) => setActiveCalendar(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Calendar Grid with integrated event bars */}
        <CalendarGrid
          startYear={yearRange.start}
          endYear={yearRange.end}
          events={filteredEvents}
          eventLayoutByYear={eventLayoutByYear}
          onCreateEvent={handleCreateEvent}
          onEventClick={handleEventClick}
        />
      </main>

      {/* Event Modal */}
      <EventModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        onDelete={modalState.editingEvent ? handleModalDelete : undefined}
        initialData={modalState.initialData}
        existingEvent={modalState.editingEvent}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
