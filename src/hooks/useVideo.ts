import { useAppStore } from "../store/AppContext";
import { startVideoGeneration, checkVideoStatus } from "../api/gemini.api";
import { saveCreation, fetchCreations } from "../api/creations.api";
import { executeQuery } from "../api/db.api";
import { useToast } from "./useToast";

export function useVideo() {
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
    return !!result.success;
  };

  const pollVideoStatus = (opName: string) => {
    let tick = 0;
    const statusMessages = [
      "Initializing camera tracks over Rift Valley landscapes...",
      "Rendering futuristic transport matrices over savanna...",
      "Refining pixel frame buffer interpolators...",
      "Applying deep texture contrasts...",
    ];

    const interval = setInterval(async () => {
      tick++;
      store.setVideoProgress(Math.min(store.videoProgress + 15, 95));
      store.setVideoStatusText(statusMessages[tick % statusMessages.length]);

      try {
        const { done } = await checkVideoStatus(opName);
        if (done) {
          clearInterval(interval);
          store.setVideoProgress(100);
          store.setVideoStatusText("Veo 3 compilation successful!");
          const downloadUrl = `/api/gemini/video-download?operationName=${encodeURIComponent(opName)}`;
          store.setVideoDownloadUrl(downloadUrl);
          store.setVideoPolling(false);
          showToast("AI Video ready in workspace!");

          await saveCreation({ user_id: store.selectedUserId, type: "video", prompt: store.videoPrompt, video_url: downloadUrl });
          const creations = await fetchCreations(store.selectedUserId);
          store.setSavedCreations(creations);
        }
      } catch {
        clearInterval(interval);
        store.setVideoPolling(false);
        showToast("Video polling interrupted.");
      }
    }, 4000);
  };

  const handleGenerateVideo = async () => {
    if (!store.selectedUserId) {
      showToast("Please register or sign in to generate videos.");
      store.setAuthScreen("register");
      return;
    }
    const debited = await debitCoins(15, "Video Studio");
    if (!debited) return;

    store.setVideoPolling(true);
    store.setVideoDownloadUrl("");
    store.setVideoProgress(10);
    store.setVideoStatusText("Booting Veo 3 compute node...");

    try {
      const opName = await startVideoGeneration(store.videoPrompt, store.videoAspectRatio);
      store.setVideoOperationName(opName);
      pollVideoStatus(opName);
    } catch (err: any) {
      showToast(`Video Studio failed: ${err.message}`);
      store.setVideoPolling(false);
    }
  };

  return { handleGenerateVideo };
}
