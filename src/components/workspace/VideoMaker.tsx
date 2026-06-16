import React from "react";
import { FileVideo, Play } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { useVideo } from "../../hooks/useVideo";
import { VIDEO_SCENE_SUGGESTIONS } from "../../data/uiPresets";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

export default function VideoMaker() {
  const store = useAppStore();
  const { handleGenerateVideo } = useVideo();

  const activeCredit = store.userCredits.find((c) => c.user_id === store.selectedUserId);
  const insufficientCredits = (activeCredit?.remaining_credits ?? 0) < 15;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* LEFT: Video preview */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
          {store.videoPolling ? (
            <div className="flex flex-col items-center gap-3 text-center p-6 w-full">
              <Spinner size="lg" />
              <p className="text-xs text-gray-400">{store.videoStatusText || "Processing..."}</p>
              {/* Progress bar */}
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${store.videoProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-amber-500">{store.videoProgress}%</p>
            </div>
          ) : store.videoDownloadUrl ? (
            <video src={store.videoDownloadUrl} controls className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center p-6">
              <FileVideo className="h-8 w-8 text-purple-500/40" />
              <p className="text-xs text-gray-500">Your video will render here</p>
              <p className="text-[10px] text-gray-600">Powered by Veo 3 · Costs 15 🪙 Meme Coins</p>
            </div>
          )}
        </div>

        {store.videoDownloadUrl && !store.videoPolling && (
          <a
            href={store.videoDownloadUrl}
            download="memegen-video.mp4"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-gray-300 hover:text-white rounded-xl transition-all"
          >
            Download MP4
          </a>
        )}
      </div>

      {/* RIGHT: Controls */}
      <div className="space-y-4">

        {/* Aspect ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Aspect Ratio</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["16:9", "9:16"] as const).map((r) => (
              <button
                key={r}
                onClick={() => store.setVideoAspectRatio(r)}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${store.videoAspectRatio === r ? "bg-purple-500/20 border-purple-500/40 text-purple-400" : "border-slate-800 text-gray-400 hover:text-white"}`}
              >
                {r === "16:9" ? "📺 Landscape (16:9)" : "📱 Portrait (9:16)"}
              </button>
            ))}
          </div>
        </div>

        {/* Scene suggestions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scene Suggestions</h3>
          <div className="space-y-1.5">
            {VIDEO_SCENE_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => store.setVideoPrompt(s.prompt)}
                className="w-full text-left px-3 py-2 bg-slate-950 border border-slate-800 hover:border-purple-500/30 text-[10px] text-gray-400 hover:text-purple-400 rounded-xl transition-all cursor-pointer"
              >
                <span className="font-bold text-gray-300 block">{s.label}</span>
                <span className="line-clamp-1">{s.prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Video Prompt</h3>
          <textarea
            value={store.videoPrompt}
            onChange={(e) => store.setVideoPrompt(e.target.value)}
            rows={4}
            placeholder="Describe your video scene in detail..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none resize-none"
          />
        </div>

        {insufficientCredits && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-[11px] text-red-400">
            Not enough Meme Coins. Video generation costs 15 🪙. Top up in Billing.
          </div>
        )}

        <Button
          variant="primary"
          size="md"
          loading={store.videoPolling}
          onClick={handleGenerateVideo}
          disabled={insufficientCredits || store.videoPolling}
          icon={<Play />}
          className="w-full"
        >
          {store.videoPolling ? "Rendering Video..." : "Generate Video (15 🪙)"}
        </Button>
      </div>
    </div>
  );
}
