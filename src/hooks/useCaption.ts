import { useAppStore } from "../store/AppContext";
import { generateCaption } from "../api/gemini.api";
import { useToast } from "./useToast";

export function useCaption() {
  const store = useAppStore();
  const { showToast } = useToast();

  const handleGenerateCaption = async () => {
    if (!store.selectedUserId) {
      showToast("Please register or sign in to generate captions.");
      store.setAuthScreen("register");
      return;
    }
    store.setGeneratingCaption(true);
    store.setCopiedCaption(false);
    try {
      const caption = await generateCaption({
        product: store.captionProduct,
        tone: store.captionTone,
        platform: store.captionPlatform,
        language: store.captionLanguage,
      });
      store.setGeneratedCaption(caption);
      showToast("Caption & hashtags generated successfully!");
    } catch (err: any) {
      showToast("Caption generation failed. Check connectivity.");
    } finally {
      store.setGeneratingCaption(false);
    }
  };

  const copyCaption = () => {
    if (store.generatedCaption) {
      navigator.clipboard.writeText(store.generatedCaption);
      store.setCopiedCaption(true);
      showToast("Caption copied to clipboard!");
      setTimeout(() => store.setCopiedCaption(false), 2000);
    }
  };

  return { handleGenerateCaption, copyCaption };
}
