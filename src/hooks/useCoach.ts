import { useAppStore } from "../store/AppContext";
import { getCoachInsight } from "../api/gemini.api";
import { useToast } from "./useToast";

export function useCoach() {
  const store = useAppStore();
  const { showToast } = useToast();

  const handleGetCoachInsight = async () => {
    if (!store.coachPrompt.trim()) {
      showToast("Please enter a question for the AI Coach.");
      return;
    }
    store.setLoadingCoach(true);
    store.setCoachResponse("");
    try {
      const insight = await getCoachInsight(store.coachPrompt, store.coachMode);
      store.setCoachResponse(insight);
      const modelLabel =
        store.coachMode === "fast" ? "gemini-3.1-flash-lite"
        : store.coachMode === "thinking" ? "gemini-3.1-pro-preview (Thinking)"
        : "gemini-3.5-flash";
      showToast(`Strategy advice delivered via ${modelLabel}`);
    } catch (err: any) {
      showToast("Could not fetch strategic insights.");
    } finally {
      store.setLoadingCoach(false);
    }
  };

  return { handleGetCoachInsight };
}
