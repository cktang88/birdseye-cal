import { useState, useEffect } from 'react';
import type { Event, EventFormData } from '../../types';
import { toISODateString } from '../../utils/dateHelpers';

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
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    startDate: '',
    endDate: '',
    color: '#3b82f6',
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (existingEvent) {
        // Editing existing event
        setFormData({
          name: existingEvent.name,
          startDate: existingEvent.startDate,
          endDate: existingEvent.endDate,
          color: existingEvent.color,
        });
      } else if (initialData) {
        // Creating new event with initial data
        setFormData({
          name: initialData.name || '',
          startDate: initialData.startDate || toISODateString(new Date()),
          endDate: initialData.endDate || initialData.startDate || toISODateString(new Date()),
          color: initialData.color || '#3b82f6',
        });
      }
      setErrors([]);
    }
  }, [isOpen, initialData, existingEvent]);

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Event name is required');
    }

    if (!formData.startDate) {
      newErrors.push('Start date is required');
    }

    if (!formData.endDate) {
      newErrors.push('End date is required');
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.push('End date must be after or equal to start date');
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
    if (onDelete && confirm('Are you sure you want to delete this event?')) {
      onDelete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          {existingEvent ? 'Edit Event' : 'Create Event'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Event Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event name"
              autoFocus
            />
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md cursor-pointer"
            />
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
              {existingEvent ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
