import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Calendar } from "../types";

const DEFAULT_CALENDAR_ID = "default";

interface UserSettings {
  birthday: string | null; // ISO date string (YYYY-MM-DD)
  calendars: Calendar[];
  activeCalendarId: string;
  defaultEventDuration: string; // Duration string like "1m", "3m", "6m", etc.
}

interface UserStore extends UserSettings {
  setBirthday: (birthday: string | null) => void;
  setDefaultEventDuration: (duration: string) => void;
  addCalendar: (calendar: Omit<Calendar, "id">) => string; // returns new calendar id
  updateCalendar: (id: string, updates: Partial<Omit<Calendar, "id">>) => void;
  deleteCalendar: (id: string) => void;
  cloneCalendar: (id: string) => string | null; // returns new calendar id or null if not found
  setActiveCalendar: (id: string) => void;
  getCalendar: (id: string) => Calendar | undefined;
  importCalendar: (calendarId: string | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      birthday: null,
      calendars: [
        {
          id: DEFAULT_CALENDAR_ID,
          name: "Default Calendar",
          color: "#3b82f6", // blue
        },
      ],
      activeCalendarId: DEFAULT_CALENDAR_ID,
      defaultEventDuration: "1m", // Default to 1 month, but configurable

      setBirthday: (birthday) => set({ birthday }),

      setDefaultEventDuration: (duration) => set({ defaultEventDuration: duration }),

      addCalendar: (calendarData) => {
        const newCalendar: Calendar = {
          ...calendarData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          calendars: [...state.calendars, newCalendar],
        }));
        return newCalendar.id;
      },

      updateCalendar: (id, updates) => {
        set((state) => ({
          calendars: state.calendars.map((cal) =>
            cal.id === id ? { ...cal, ...updates } : cal
          ),
        }));
      },

      deleteCalendar: (id) => {
        // Prevent deleting the default calendar
        if (id === DEFAULT_CALENDAR_ID) return;

        set((state) => {
          const newCalendars = state.calendars.filter((cal) => cal.id !== id);
          // If active calendar is deleted, switch to default
          const newActiveId =
            state.activeCalendarId === id
              ? DEFAULT_CALENDAR_ID
              : state.activeCalendarId;
          return {
            calendars: newCalendars,
            activeCalendarId: newActiveId,
          };
        });
      },

      cloneCalendar: (id) => {
        const sourceCalendar = get().calendars.find((cal) => cal.id === id);
        if (!sourceCalendar) return null;

        const newCalendar: Calendar = {
          id: crypto.randomUUID(),
          name: `${sourceCalendar.name} (copy)`,
          color: sourceCalendar.color,
        };

        set((state) => ({
          calendars: [...state.calendars, newCalendar],
        }));

        return newCalendar.id;
      },

      setActiveCalendar: (id) => {
        set({ activeCalendarId: id });
      },

      getCalendar: (id) => {
        return get().calendars.find((cal) => cal.id === id);
      },

      importCalendar: (calendarId) => {
        // This will be called after events are imported
        // The actual file reading happens in the component
        if (calendarId) {
          set({ activeCalendarId: calendarId });
        }
      },
    }),
    {
      name: "birdseye-user-settings",
    }
  )
);

export { DEFAULT_CALENDAR_ID };

