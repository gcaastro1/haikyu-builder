import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      login: (password: string) => {
        if (password === '@L0ntra667104') {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
