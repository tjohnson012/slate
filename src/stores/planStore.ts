import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EveningPlan, PlanningEvent, VibeVector, AvailabilityMatrix } from '@/lib/types';

interface UserVibeProfile {
  id: string;
  vibeVector: VibeVector;
  favoritePhotos: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PlanState {
  currentPlan: EveningPlan | null;
  events: PlanningEvent[];
  matrix: AvailabilityMatrix | null;
  isPlanning: boolean;
  error: string | null;
  userVibeProfile: UserVibeProfile | null;

  setCurrentPlan: (plan: EveningPlan | null) => void;
  addEvent: (event: PlanningEvent) => void;
  clearEvents: () => void;
  setMatrix: (matrix: AvailabilityMatrix | null) => void;
  setIsPlanning: (isPlanning: boolean) => void;
  setError: (error: string | null) => void;
  setUserVibeProfile: (profile: UserVibeProfile | null) => void;
  updateVibeVector: (vibeVector: VibeVector) => void;
  setFavoritePhotos: (photoIds: string[]) => void;
  reset: () => void;

  startPlanStream: (prompt: string) => Promise<void>;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      events: [],
      matrix: null,
      isPlanning: false,
      error: null,
      userVibeProfile: null,

      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      clearEvents: () => set({ events: [] }),
      setMatrix: (matrix) => set({ matrix }),
      setIsPlanning: (isPlanning) => set({ isPlanning }),
      setError: (error) => set({ error }),
      setUserVibeProfile: (profile) => set({ userVibeProfile: profile }),

      updateVibeVector: (vibeVector) => set((state) => ({
        userVibeProfile: state.userVibeProfile
          ? { ...state.userVibeProfile, vibeVector, updatedAt: new Date() }
          : {
              id: crypto.randomUUID(),
              vibeVector,
              favoritePhotos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
      })),

      setFavoritePhotos: (photoIds) => set((state) => ({
        userVibeProfile: state.userVibeProfile
          ? { ...state.userVibeProfile, favoritePhotos: photoIds, updatedAt: new Date() }
          : null,
      })),

      reset: () => set({
        currentPlan: null,
        events: [],
        matrix: null,
        isPlanning: false,
        error: null,
      }),

      startPlanStream: async (prompt: string) => {
        const { userVibeProfile } = get();

        set({ isPlanning: true, error: null, events: [], currentPlan: null, matrix: null });

        try {
          const response = await fetch('/api/plan/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, userVibeProfile }),
          });

          if (!response.ok) throw new Error('Failed to start planning');
          if (!response.body) throw new Error('No response body');

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'final') {
                  set({ currentPlan: data.plan, isPlanning: false });
                } else if (data.type === 'matrix_update') {
                  set({ matrix: data.data });
                  get().addEvent(data);
                } else {
                  get().addEvent(data);
                }
              } catch {
                // Skip malformed events
              }
            }
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Planning failed',
            isPlanning: false,
          });
        }
      },
    }),
    {
      name: 'slate-plan-storage',
      partialize: (state) => ({ userVibeProfile: state.userVibeProfile }),
    }
  )
);
