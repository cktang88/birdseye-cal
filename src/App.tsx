import { useState, useMemo } from "react";
import { CalendarGrid } from "./components/Calendar/CalendarGrid";
import { EventModal } from "./components/Modal/EventModal";
import { useEventStore } from "./store/eventStore";
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

  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();

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

  // Calculate event lanes for each year to prevent overlapping
  const eventLayoutByYear = useMemo(() => {
    const layoutByYear = new Map();
    for (let year = yearRange.start; year <= yearRange.end; year++) {
      layoutByYear.set(year, calculateEventLanes(events, year));
    }
    return layoutByYear;
  }, [events, yearRange]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">BirdsEye Calendar</h1>
        <p className="text-sm text-gray-600 mt-1">
          Long-term event visualization • Click or drag to create events
        </p>
      </header>

      {/* Main Content */}
      <main>
        {/* Calendar Grid with integrated event bars */}
        <CalendarGrid
          startYear={yearRange.start}
          endYear={yearRange.end}
          events={events}
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
    </div>
  );
}

export default App;
