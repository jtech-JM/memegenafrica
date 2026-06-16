import React, { useRef } from "react";
import { Sparkles, Upload } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { useImage } from "../../hooks/useImage";
import { IMAGE_PROMPT_STYLES } from "../../data/uiPresets";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "3:4", "4:3"] as const;

export default function ImageStudio() {
  const store = useAppStore();
  const { handleGenerateImage } = useImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCredit = store.userCredits.find((c) => c.user_id === store.selectedUserId);
  const insufficientCredits = (activeCredit?.remaining_credits ?? 0) < 5;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => store.setInputEditImageBase64((ev.target?.result as string) || "");
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* LEFT: Generated image */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
          {store.generatingImage ? (
            <div className="flex flex-col items-center gap-3 text-center p-6">
              <Spinner size="lg" />
              <p className="text-xs text-gray-400">Calling Gemini Imagen...</p>
            </div>
          ) : store.generatedImgUrl ? (
            <img src={store.generatedImgUrl} alt="Generated" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center p-6">
              <Sparkles className="h-8 w-8 text-amber-500/40" />
              <p className="text-xs text-gray-500">Your generated image will appear here</p>
              <p className="text-[10px] text-gray-600">Costs 5 🪙 Meme Coins per generation</p>
            </div>
          )}
          {store.imageFallbackUsed && store.generatedImgUrl && (
            <div className="absolute bottom-2 right-2 text-[8px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded font-mono">
              SVG PREVIEW
            </div>
          )}
        </div>

        {store.generatedImgUrl && !store.generatingImage && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => { const a = document.createElement("a"); a.href = store.generatedImgUrl; a.download = "memegen-image.png"; a.click(); }}
          >
            Download Image
          </Button>
        )}
      </div>

      {/* RIGHT: Controls */}
      <div className="space-y-4">

        {/* Mode toggle */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Studio Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["generate", "edit"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => store.setImageMode(mode)}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer capitalize ${store.imageMode === mode ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-800 text-gray-400 hover:text-white"}`}
              >
                {mode === "generate" ? "✨ Generate" : "🎨 Edit Image"}
              </button>
            ))}
          </div>

          {store.imageMode === "edit" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {(["template", "upload"] as const).map((src) => (
                  <button
                    key={src}
                    onClick={() => store.setEditImageSource(src)}
                    className={`py-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${store.editImageSource === src ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "border-slate-800 text-gray-500 hover:text-gray-300"}`}
                  >
                    {src === "template" ? "Use Template" : "Upload Image"}
                  </button>
                ))}
              </div>
              {store.editImageSource === "upload" && (
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl py-4 text-xs text-gray-500 hover:text-gray-300 flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    {store.inputEditImageBase64 ? "Image loaded ✓" : "Click to upload image"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Aspect ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Aspect Ratio</h3>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r}
                onClick={() => store.setImageAspectRatio(r)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${store.imageAspectRatio === r ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-800 text-gray-400 hover:text-white"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Image Prompt</h3>
          <textarea
            value={store.imagePrompt}
            onChange={(e) => store.setImagePrompt(e.target.value)}
            rows={3}
            placeholder="Describe your image in detail..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none resize-none"
          />

          {/* Style suffixes */}
          <div>
            <p className="text-[10px] text-gray-500 mb-2">Quick style presets:</p>
            <div className="flex flex-wrap gap-1.5">
              {IMAGE_PROMPT_STYLES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    // Remove any existing style suffix then append the new one
                    const existingSuffix = IMAGE_PROMPT_STYLES.find(x => store.imagePrompt.endsWith(x.suffix))?.suffix || "";
                    const base = existingSuffix ? store.imagePrompt.slice(0, -existingSuffix.length).trim() : store.imagePrompt.trim();
                    store.setImagePrompt(base + s.suffix);
                  }}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-blue-500/30 text-[10px] text-gray-400 hover:text-blue-400 rounded-lg transition-all cursor-pointer"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meme Coin warning */}
        {insufficientCredits && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-[11px] text-red-400">
            Not enough Meme Coins. Image generation costs 5 🪙. Top up in the Billing section.
          </div>
        )}

        <Button
          variant="primary"
          size="md"
          loading={store.generatingImage}
          onClick={handleGenerateImage}
          disabled={insufficientCredits}
          icon={<Sparkles />}
          className="w-full"
        >
          {store.generatingImage ? "Generating..." : `Generate Image (5 🪙)`}
        </Button>
      </div>
    </div>
  );
}
