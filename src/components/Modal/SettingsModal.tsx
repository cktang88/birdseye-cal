import { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { birthday, setBirthday } = useUserStore();
  const [birthdayInput, setBirthdayInput] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setBirthdayInput(birthday || "");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>

        <form onSubmit={handleSubmit}>
          {/* Birthday Input */}
          <div className="mb-4">
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

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {birthdayInput && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Clear
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
