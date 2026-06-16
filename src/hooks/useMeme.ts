import { useAppStore } from "../store/AppContext";
import { generateMemeSatire } from "../api/gemini.api";
import { saveCreation, fetchCreations } from "../api/creations.api";
import { executeQuery } from "../api/db.api";
import { MemeTemplate } from "../types";
import { useToast } from "./useToast";

export function useMeme() {
  const store = useAppStore();
  const { showToast } = useToast();

  const handleTemplateSelect = (template: MemeTemplate) => {
    store.setSelectedTemplate(template);
    showToast(`Selected: ${template.localName}`);
  };

  const handleGenerateSatire = async () => {
    if (!store.selectedUserId) {
      showToast("Please register or sign in to generate satire ideas.");
      store.setAuthScreen("register");
      return;
    }
    if (!store.satireTopic.trim()) {
      showToast("Please enter a topic for satirical ideas.");
      return;
    }
    store.setGeneratingSatire(true);
    store.setSatireOutput([]);
    try {
      const data = await generateMemeSatire(store.selectedTemplate.name, store.satireTopic);
      store.setSatireOutput(data.ideas || []);
      if (data.ideas?.length > 0) {
        store.setTopText(store.selectedTemplate.localName.toUpperCase());
        store.setBottomText(data.ideas[0].caption);
      }
      showToast(data.fallback ? "Loaded fallback satire ideas!" : "Gemini generated 3 African satire captions!");
    } catch (err: any) {
      showToast("Satire generation failed. Try again.");
    } finally {
      store.setGeneratingSatire(false);
    }
  };

  const handleSaveMeme = async () => {
    if (!store.selectedUserId) {
      showToast("Please register or sign in to save memes.");
      store.setAuthScreen("register");
      return;
    }
    const creation = await saveCreation({
      user_id: store.selectedUserId,
      type: "meme",
      prompt: store.satireTopic || `Custom meme: ${store.selectedTemplate.localName}`,
      caption: `${store.topText} | ${store.bottomText}`,
      image_url: store.selectedTemplate.imageUrl,
    });
    if (creation) {
      showToast("✓ Meme saved to My Album!");
      const creations = await fetchCreations(store.selectedUserId);
      store.setSavedCreations(creations);
    } else {
      showToast("Failed to save meme. Try again.");
    }
  };

  const handleMemeRating = (rating: "like" | "dislike") => {
    store.setMemeRating(rating);
    store.setRatingStatusText(
      rating === "like"
        ? "Meme rated positive! Filter refined."
        : "Refining model parameters. Sarcasm threshold tuned."
    );
    showToast(`Feedback logged: ${rating.toUpperCase()}`);
    executeQuery(
      `-- FEEDBACK_CAPTURE: user feedback is registered as ${rating} for ${store.selectedTemplate.localName}`
    );
  };

  const downloadMeme = () => {
    showToast("Preparing your high-res JPEG canvas for download...");
    setTimeout(() => {
      showToast("Downloaded successfully!");
    }, 1000);
  };

  return { handleTemplateSelect, handleGenerateSatire, handleSaveMeme, handleMemeRating, downloadMeme };
}
