import { useState, useEffect, useRef } from "react";
import type { Event, EventFormData } from "../../types";
import { toISODateString } from "../../utils/dateHelpers";
import { EVENT_COLORS } from "../../constants/grid";
import { useUserStore, DEFAULT_CALENDAR_ID } from "../../store/userStore";
import { useEventStore } from "../../store/eventStore";
import { Dropdown } from "../ui/Dropdown";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => void;
  onDelete?: () => void;
  initialData?: Partial<EventFormData>;
  existingEvent?: Event;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  existingEvent,
}: EventModalProps) {
  const { calendars, activeCalendarId } = useUserStore();
  const { events } = useEventStore();

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    startDate: "",
    endDate: "",
    color: EVENT_COLORS[0], // Default to first color in palette
    calendarId: activeCalendarId || DEFAULT_CALENDAR_ID,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isManualColorChange, setIsManualColorChange] = useState(false);
  const [autocompleteSuggestion, setAutocompleteSuggestion] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingEvent) {
        // Editing existing event
        setFormData({
          name: existingEvent.name,
          startDate: existingEvent.startDate,
          endDate: existingEvent.endDate,
          color: existingEvent.color,
          calendarId: existingEvent.calendarId || DEFAULT_CALENDAR_ID,
        });
        setIsManualColorChange(true); // Existing event already has a color
      } else if (initialData) {
        // Creating new event with initial data
        setFormData({
          name: initialData.name || "",
          startDate: initialData.startDate || toISODateString(new Date()),
          endDate:
            initialData.endDate ||
            initialData.startDate ||
            toISODateString(new Date()),
          color: initialData.color || EVENT_COLORS[0],
          calendarId:
            initialData.calendarId || activeCalendarId || DEFAULT_CALENDAR_ID,
        });
        setIsManualColorChange(false); // New event, allow auto color matching
      }
      setErrors([]);
      setAutocompleteSuggestion("");
    }
  }, [isOpen, initialData, existingEvent, activeCalendarId]);

  // Auto-match color based on event name (only for new events in the same calendar)
  useEffect(() => {
    if (
      !isOpen ||
      existingEvent ||
      isManualColorChange ||
      !formData.name.trim()
    ) {
      return;
    }

    // Find existing event with the same name in the same calendar (case-insensitive)
    const matchingEvent = events.find(
      (event) =>
        event.calendarId === formData.calendarId &&
        event.name.trim().toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (matchingEvent) {
      setFormData((prev) => ({ ...prev, color: matchingEvent.color }));
    }
  }, [
    formData.name,
    formData.calendarId,
    isOpen,
    existingEvent,
    isManualColorChange,
    events,
  ]);

  // Autocomplete for event name (only from the same calendar)
  useEffect(() => {
    if (!isOpen || !formData.name) {
      setAutocompleteSuggestion("");
      return;
    }

    // Get unique event names from existing events in the same calendar
    const calendarEvents = events.filter(
      (e) => e.calendarId === formData.calendarId
    );
    const uniqueNames = Array.from(new Set(calendarEvents.map((e) => e.name)));

    // Find the first match that starts with the current input (case-insensitive)
    const lowerInput = formData.name.toLowerCase();
    const match = uniqueNames.find(
      (name) =>
        name.toLowerCase().startsWith(lowerInput) &&
        name.toLowerCase() !== lowerInput
    );

    if (match) {
      setAutocompleteSuggestion(match);
    } else {
      setAutocompleteSuggestion("");
    }
  }, [formData.name, formData.calendarId, isOpen, events]);

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push("Event name is required");
    }

    if (!formData.startDate) {
      newErrors.push("Start date is required");
    }

    if (!formData.endDate) {
      newErrors.push("End date is required");
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      newErrors.push("End date must be after or equal to start date");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm("Are you sure you want to delete this event?")) {
      onDelete();
      onClose();
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && autocompleteSuggestion) {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, name: autocompleteSuggestion }));
      setAutocompleteSuggestion("");
    }
  };

  const handleStartDateChange = (newStartDate: string) => {
    setFormData((prev) => ({ ...prev, startDate: newStartDate }));
  };

  const handleEndDateChange = (newEndDate: string) => {
    setFormData((prev) => ({ ...prev, endDate: newEndDate }));
  };

  const handleCalendarChange = (newCalendarId: string) => {
    setFormData((prev) => ({ ...prev, calendarId: newCalendarId }));
    // Reset autocomplete when calendar changes
    setAutocompleteSuggestion("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">
          {existingEvent ? "Edit Event" : "Create Event"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Event Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <div className="relative">
              {/* Autocomplete suggestion overlay */}
              {autocompleteSuggestion && (
                <div className="absolute inset-0 px-3 py-2 pointer-events-none flex items-center">
                  <span className="invisible">{formData.name}</span>
                  <span className="text-gray-400">
                    {autocompleteSuggestion.substring(formData.name.length)}
                  </span>
                </div>
              )}
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={handleNameKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative bg-transparent"
                placeholder="Enter event name"
                autoFocus
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Calendar Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calendar
            </label>
            <Dropdown
              value={formData.calendarId || DEFAULT_CALENDAR_ID}
              onChange={handleCalendarChange}
              options={calendars.map((calendar) => ({
                value: calendar.id,
                label: calendar.name,
              }))}
              className="w-full"
            />
          </div>

          {/* Color */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, color }));
                    setIsManualColorChange(true);
                  }}
                  className={`w-10 h-10 rounded-md transition-all ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-gray-800 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {existingEvent && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {existingEvent ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
