import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserSettings {
  birthday: string | null; // ISO date string (YYYY-MM-DD)
}

interface UserStore extends UserSettings {
  setBirthday: (birthday: string | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      birthday: null,
      setBirthday: (birthday) => set({ birthday }),
    }),
    {
      name: "birdseye-user-settings",
    }
  )
);

