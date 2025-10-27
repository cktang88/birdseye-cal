import { useState, useEffect, useRef } from "react";
import { useUserStore, DEFAULT_CALENDAR_ID } from "../../store/userStore";
import { useEventStore } from "../../store/eventStore";
import { EVENT_COLORS } from "../../constants/grid";
import { Download, Upload, Edit2, Copy, Trash2 } from "lucide-react";
import { askConfirm, showMessage } from "../../utils/dialogHelpers";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    birthday,
    setBirthday,
    defaultEventDuration,
    setDefaultEventDuration,
    calendars,
    addCalendar,
    deleteCalendar,
    cloneCalendar,
    updateCalendar,
  } = useUserStore();
  const { events, addEvent, deleteEventsByCalendar } = useEventStore();
  const [birthdayInput, setBirthdayInput] = useState<string>("");
  const [durationInput, setDurationInput] = useState<string>("");
  const [newCalendarName, setNewCalendarName] = useState<string>("");
  const [newCalendarColor, setNewCalendarColor] = useState<string>(
    EVENT_COLORS[0]
  );
  const [editingCalendarId, setEditingCalendarId] = useState<string | null>(
    null
  );
  const [editingName, setEditingName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBirthdayInput(birthday || "");
      setDurationInput(defaultEventDuration);
      setNewCalendarName("");
      setNewCalendarColor(EVENT_COLORS[0]);
      setEditingCalendarId(null);
      setEditingName("");
    }
  }, [isOpen, birthday, defaultEventDuration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBirthday(birthdayInput || null);

    // Validate and save duration
    const durationMatch = durationInput
      .trim()
      .match(/^(\d+\.?\d*)\s*([ymwdh])$/i);
    if (durationMatch) {
      setDefaultEventDuration(durationInput.trim().toLowerCase());
    } else if (durationInput.trim() === "") {
      // If empty, reset to default
      setDefaultEventDuration("1m");
    }
    // If invalid, just keep the current setting (don't update)

    onClose();
  };

  const handleClear = () => {
    setBirthdayInput("");
    setBirthday(null);
  };

  const handleAddCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCalendarName.trim()) {
      addCalendar({
        name: newCalendarName.trim(),
        color: newCalendarColor,
      });
      setNewCalendarName("");
      setNewCalendarColor(EVENT_COLORS[0]);
    }
  };

  const handleDeleteCalendar = async (id: string) => {
    if (id === DEFAULT_CALENDAR_ID) {
      await showMessage("Cannot delete the default calendar", {
        title: "Cannot Delete",
        okLabel: "OK",
      });
      return;
    }
    const confirmed = await askConfirm(
      "Are you sure you want to delete this calendar? All events in this calendar will also be permanently deleted.",
      {
        title: "Delete Calendar",
        okLabel: "Delete",
        cancelLabel: "Cancel",
      }
    );
    if (confirmed) {
      deleteEventsByCalendar(id);
      deleteCalendar(id);
    }
  };

  const handleCloneCalendar = (id: string) => {
    // Clone the calendar
    const newCalendarId = cloneCalendar(id);
    if (!newCalendarId) return;

    // Clone all events from the source calendar
    const calendarEvents = events.filter(
      (event) =>
        event.calendarId === id ||
        (!event.calendarId && id === DEFAULT_CALENDAR_ID)
    );

    calendarEvents.forEach((event) => {
      addEvent({
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        color: event.color,
        calendarId: newCalendarId,
      });
    });
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingCalendarId(id);
    setEditingName(currentName);
  };

  const handleSaveRename = () => {
    if (editingCalendarId && editingName.trim()) {
      updateCalendar(editingCalendarId, { name: editingName.trim() });
      setEditingCalendarId(null);
      setEditingName("");
    }
  };

  const handleCancelRename = () => {
    setEditingCalendarId(null);
    setEditingName("");
  };

  const handleExportCalendar = (calendarId: string) => {
    // Get the calendar
    const calendar = calendars.find((cal) => cal.id === calendarId);
    if (!calendar) return;

    // Get all events for this calendar
    const calendarEvents = events.filter(
      (event) =>
        event.calendarId === calendarId ||
        (!event.calendarId && calendarId === DEFAULT_CALENDAR_ID)
    );

    // Create export data
    const exportData = {
      calendar: {
        name: calendar.name,
        color: calendar.color,
      },
      events: calendarEvents.map((event) => ({
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        color: event.color,
      })),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${calendar.name.replace(/[^a-z0-9]/gi, "_")}_calendar.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCalendar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        // Validate import data
        if (
          !importData.calendar ||
          !importData.events ||
          !Array.isArray(importData.events)
        ) {
          await showMessage("Invalid calendar file format", {
            title: "Import Error",
            okLabel: "OK",
          });
          return;
        }

        // Handle name conflicts by appending numbers
        const calendarName = importData.calendar.name || "Imported Calendar";
        const existingNames = calendars.map((cal) => cal.name);
        let counter = 1;
        let uniqueName = calendarName;

        while (existingNames.includes(uniqueName)) {
          uniqueName = `${calendarName}${counter}`;
          counter++;
        }

        // Create new calendar and get the actual ID
        const newCalendarId = addCalendar({
          name: uniqueName,
          color: importData.calendar.color || EVENT_COLORS[0],
        });

        // Import events with the correct calendar ID
        importData.events.forEach(
          (event: {
            name: string;
            startDate: string;
            endDate: string;
            color: string;
          }) => {
            addEvent({
              name: event.name,
              startDate: event.startDate,
              endDate: event.endDate,
              color: event.color,
              calendarId: newCalendarId,
            });
          }
        );

        await showMessage(`Calendar "${uniqueName}" imported successfully!`, {
          title: "Import Successful",
          okLabel: "OK",
        });
      } catch (error) {
        await showMessage(
          "Error importing calendar: " + (error as Error).message,
          {
            title: "Import Error",
            okLabel: "OK",
          }
        );
      }
    };
    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>

        <form onSubmit={handleSubmit}>
          {/* Birthday Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Birthdate
            </label>
            <input
              type="date"
              value={birthdayInput}
              onChange={(e) => setBirthdayInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="YYYY-MM-DD"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your age will be displayed on each birthday month in the calendar
            </p>
          </div>

          {/* Default Event Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Event Duration
            </label>
            <input
              type="text"
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="e.g., 1m, 3m, 6m, 1y"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum duration for new events (e.g., "1m" = 1 month, "3m" = 3
              months, "6m" = 6 months, "1y" = 1 year)
            </p>
          </div>

          {/* Calendars Management */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-3">Calendars</h3>

            {/* Existing Calendars List */}
            <div className="mb-4 space-y-2">
              {calendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: calendar.color }}
                    />
                    {editingCalendarId === calendar.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename();
                          if (e.key === "Escape") handleCancelRename();
                        }}
                        className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="font-medium truncate">
                          {calendar.name}
                        </span>
                        {calendar.id === DEFAULT_CALENDAR_ID && (
                          <span className="text-xs text-gray-500 italic shrink-0">
                            (default)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {editingCalendarId === calendar.id ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveRename}
                          className="text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          className="text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartRename(calendar.id, calendar.name)
                          }
                          className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"
                          title="Rename calendar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCloneCalendar(calendar.id)}
                          className="text-purple-600 hover:bg-purple-100 p-2 rounded transition-colors"
                          title="Clone calendar and all its events"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportCalendar(calendar.id)}
                          className="text-green-600 hover:bg-green-100 p-2 rounded transition-colors"
                          title="Export calendar"
                        >
                          <Download size={16} />
                        </button>
                        {calendar.id !== DEFAULT_CALENDAR_ID && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCalendar(calendar.id)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
                            title="Delete calendar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Calendar Form */}
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Add New Calendar
                </h4>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition-colors text-sm"
                  title="Import calendar from file"
                >
                  <Upload size={16} />
                  Import
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportCalendar}
                className="hidden"
              />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Calendar Name
                  </label>
                  <input
                    type="text"
                    value={newCalendarName}
                    onChange={(e) => setNewCalendarName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., Work, Personal, Family"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Calendar Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {EVENT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCalendarColor(color)}
                        className={`w-8 h-8 rounded-md transition-all ${
                          newCalendarColor === color
                            ? "ring-2 ring-offset-2 ring-gray-800 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCalendar}
                  disabled={!newCalendarName.trim()}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Add Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t border-gray-200 pt-4">
            {birthdayInput && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Clear Birthday
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
