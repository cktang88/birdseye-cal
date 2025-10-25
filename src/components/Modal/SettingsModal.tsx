import { useState, useEffect } from "react";
import { useUserStore, DEFAULT_CALENDAR_ID } from "../../store/userStore";
import { EVENT_COLORS } from "../../constants/grid";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { birthday, setBirthday, calendars, addCalendar, deleteCalendar } =
    useUserStore();
  const [birthdayInput, setBirthdayInput] = useState<string>("");
  const [newCalendarName, setNewCalendarName] = useState<string>("");
  const [newCalendarColor, setNewCalendarColor] = useState<string>(
    EVENT_COLORS[0]
  );

  useEffect(() => {
    if (isOpen) {
      setBirthdayInput(birthday || "");
      setNewCalendarName("");
      setNewCalendarColor(EVENT_COLORS[0]);
    }
  }, [isOpen, birthday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBirthday(birthdayInput || null);
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

  const handleDeleteCalendar = (id: string) => {
    if (id === DEFAULT_CALENDAR_ID) {
      alert("Cannot delete the default calendar");
      return;
    }
    if (
      confirm(
        "Are you sure you want to delete this calendar? Events in this calendar will remain but won't be visible."
      )
    ) {
      deleteCalendar(id);
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
              Your Birthday
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
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <span className="font-medium">{calendar.name}</span>
                    {calendar.id === DEFAULT_CALENDAR_ID && (
                      <span className="text-xs text-gray-500 italic">
                        (default)
                      </span>
                    )}
                  </div>
                  {calendar.id !== DEFAULT_CALENDAR_ID && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCalendar(calendar.id)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Calendar Form */}
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Add New Calendar
              </h4>
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
