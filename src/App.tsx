import { useState } from 'react';
import { CalendarGrid } from './components/Calendar/CalendarGrid';
import { EventBar } from './components/Calendar/EventBar';
import { EventModal } from './components/Modal/EventModal';
import { useEventStore } from './store/eventStore';
import type { Event, GridCell, EventFormData } from './types';
import { toISODateString, randomColor } from './utils/dateHelpers';

function App() {
  const currentYear = new Date().getFullYear();
  const [yearRange] = useState({ start: currentYear - 2, end: currentYear + 3 });

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

  // Group cells by year for event rendering
  const maxWeeks = 53;

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
      <main className="relative">
        {/* Calendar Grid */}
        <CalendarGrid
          startYear={yearRange.start}
          endYear={yearRange.end}
          onCreateEvent={handleCreateEvent}
        />

        {/* Event Bars Overlay */}
        <div className="absolute top-0 left-0 pointer-events-none p-4">
          <div className="inline-block">
            {/* Year rows */}
            {Array.from(
              { length: yearRange.end - yearRange.start + 1 },
              (_, i) => yearRange.start + i
            ).map((year) => (
              <div key={year} className="flex mb-1">
                {/* Year label space */}
                <div className="w-16 flex-shrink-0" />

                {/* Event bars for this year */}
                <div className="relative" style={{ height: '12px' }}>
                  <div className="pointer-events-auto">
                    {events.map((event) => (
                      <EventBar
                        key={event.id}
                        event={event}
                        year={year}
                        maxWeeks={maxWeeks}
                        onEventClick={handleEventClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
