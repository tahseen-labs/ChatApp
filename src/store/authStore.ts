import { create } from 'zustand';
import type { UserProfile } from '../types/index';

interface AuthStoreState {
  user: UserProfile | null;
  initializing: boolean;
  setUser: (user: UserProfile | null) => void;
  setInitializing: (val: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  initializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (initializing) => set({ initializing }),
}));
