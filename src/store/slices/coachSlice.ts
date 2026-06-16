export type CoachState = {
  coachPrompt: string;
  coachMode: "fast" | "general" | "thinking";
  coachResponse: string;
  loadingCoach: boolean;
};

export type CoachActions = {
  setCoachPrompt: (s: string) => void;
  setCoachMode: (m: "fast" | "general" | "thinking") => void;
  setCoachResponse: (s: string) => void;
  setLoadingCoach: (b: boolean) => void;
};

export function createCoachSlice(set: (fn: (s: any) => any) => void): CoachState & CoachActions {
  return {
    coachPrompt: "Provide deep strategic reasoning on pricing packages and user acquisition in Swahili-speaking markets.",
    coachMode: "thinking",
    coachResponse: "",
    loadingCoach: false,
    setCoachPrompt: (s) => set(() => ({ coachPrompt: s })),
    setCoachMode: (m) => set(() => ({ coachMode: m })),
    setCoachResponse: (s) => set(() => ({ coachResponse: s })),
    setLoadingCoach: (b) => set(() => ({ loadingCoach: b })),
  };
}
