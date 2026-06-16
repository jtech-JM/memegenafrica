import { useAppStore } from "../store/AppContext";
import { generateImage as apiGenerateImage } from "../api/gemini.api";
import { executeQuery } from "../api/db.api";
import { saveCreation, fetchCreations } from "../api/creations.api";
import { useToast } from "./useToast";

export function useImage() {
  const store = useAppStore();
  const { showToast } = useToast();

  const debitCoins = async (amount: number, label: string): Promise<boolean> => {
    const credit = store.userCredits.find((c) => c.user_id === store.selectedUserId);
    if (!credit || credit.remaining_credits < amount) {
      showToast(`Not enough Meme Coins for ${label}. Need ${amount} 🪙.`);
      return false;
    }
    const result = await executeQuery(
      `UPDATE user_credits SET remaining_credits = remaining_credits - ${amount} WHERE user_id = '${store.selectedUserId}' AND remaining_credits >= ${amount}`
    );
    if (result.success) {
      showToast(`Spent ${amount} 🪙 on: ${label}`);
      return true;
    }
    showToast(`Meme Coin deduction failed: ${result.error || "Unknown error"}`);
    return false;
  };

  const handleGenerateImage = async () => {
    if (!store.selectedUserId) {
      showToast("Please register or sign in to generate images.");
      store.setAuthScreen("register");
      return;
    }
    const debited = await debitCoins(5, "Image Studio");
    if (!debited) return;

    store.setGeneratingImage(true);
    store.setGeneratedImgUrl("");
    store.setImageFallbackUsed(false);

    try {
      const payload: any = { prompt: store.imagePrompt, aspectRatio: store.imageAspectRatio };

      if (store.imageMode === "edit") {
        if (store.editImageSource === "template") {
          payload.templateUrl = store.selectedTemplate.imageUrl;
        } else {
          if (!store.inputEditImageBase64) {
            showToast("Please select an image file to edit first.");
            store.setGeneratingImage(false);
            return;
          }
          payload.editingImage = store.inputEditImageBase64;
        }
      }

      const result = await apiGenerateImage(payload);
      store.setGeneratedImgUrl(result.imageUrl);
      store.setImageFallbackUsed(!!result.fallback);
      showToast(result.fallback ? "Cost-optimized preview generated!" : "Image generated successfully!");

      // Auto-save
      const creation = await saveCreation({
        user_id: store.selectedUserId,
        type: "image",
        prompt: store.imagePrompt,
        image_url: result.imageUrl,
      });
      if (creation) {
        const creations = await fetchCreations(store.selectedUserId);
        store.setSavedCreations(creations);
      }
    } catch (err: any) {
      showToast(`Image Studio failed: ${err.message}`);
    } finally {
      store.setGeneratingImage(false);
    }
  };

  return { handleGenerateImage };
}
