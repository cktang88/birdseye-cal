import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event } from '../types';

interface EventStore {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (eventData) => {
        const newEvent: Event = {
          ...eventData,
          id: crypto.randomUUID(),
        };

        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      getEvent: (id) => {
        return get().events.find((event) => event.id === id);
      },
    }),
    {
      name: 'birdseye-events-storage',
    }
  )
);
