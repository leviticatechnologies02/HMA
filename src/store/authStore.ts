import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  userId: string | null;
  role: string | null;
  accessToken: string | null;
  hostelIds: string[];
  activeHostelId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: { id: string; role: string; email: string; } | null;

  setActiveHostelId: (id: string) => void;
  setAuth: (userId: string, role: string, accessToken: string, hostelIds?: string[]) => void;
  clearAuth: () => void;
  setUser: (userId: string, role: string, accessToken: string, hostelIds?: string[]) => void;

  clearUser: () => void;
  
  setLoading: (loading: boolean) => void;
  
  setError: (error: string | null) => void;


};

type PersistedAuthState = Pick<
  AuthState,
  "userId" | "role" | "accessToken" | "hostelIds" | "activeHostelId" | "isAuthenticated" | "user"
>;

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], PersistedAuthState>(
    (set) => ({
      userId: null,
      role: null,
      accessToken: null,
      hostelIds: [],
      activeHostelId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,

      setActiveHostelId: (id) => set({ activeHostelId: id }),

      setAuth: (userId, role, accessToken, hostelIds = []) =>
        set({
          userId,
          role,
          accessToken,
          hostelIds,
          activeHostelId: hostelIds[0] ?? null,
          isAuthenticated: true,
          user: { id: userId, role, email: "" },
          error: null
        }),

      clearAuth: () =>
        set({
          userId: null,
          role: null,
          accessToken: null,
          hostelIds: [],
          activeHostelId: null,
          isAuthenticated: false,
          user: null,
          error: null
        }),

      setUser: (userId, role, accessToken, hostelIds = []) => {
        set({
          userId,
          role,
          accessToken,
          hostelIds,
          activeHostelId: hostelIds[0] ?? null,
          isAuthenticated: true,
          user: { id: userId, role, email: "" },
          error: null
        });
      },

      clearUser: () => {
        set({
          userId: null,
          role: null,
          accessToken: null,
          hostelIds: [],
          activeHostelId: null,
          isAuthenticated: false,
          user: null,
          error: null
        });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      
    }),
    {
      name: "auth-store",
      // sessionStorage: cleared on tab close — more secure than localStorage for tokens
      storage: {
        getItem: (name) => {
          try {
            const val = sessionStorage.getItem(name);
            return val ? JSON.parse(val) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch {
            // sessionStorage full or unavailable — fail silently
          }
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        accessToken: state.accessToken,
        hostelIds: state.hostelIds,
        isAuthenticated: state.isAuthenticated,
        user: state.user,

        activeHostelId: state.activeHostelId, // include activeHostelId in persistence
      }),
    }
  )
);
