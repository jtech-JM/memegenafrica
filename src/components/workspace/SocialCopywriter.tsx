import React from "react";
import { Copy, Check, Search } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { useCaption } from "../../hooks/useCaption";
import Button from "../ui/Button";

const PLATFORMS = ["TikTok", "Instagram", "WhatsApp", "Twitter/X", "Facebook"];
const TONES = ["witty Sheng-slang", "professional", "funny", "inspirational", "sarcastic", "informative"];
const LANGUAGES = ["Sheng", "Swahili", "English", "Kikuyu Slang", "Luo Dholuo"];

export default function SocialCopywriter() {
  const store = useAppStore();
  const { handleGenerateCaption, copyCaption } = useCaption();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* LEFT: Generated caption output */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-64 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-emerald-400" /> Generated Caption
            </h3>
            {store.generatedCaption && (
              <button
                onClick={copyCaption}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-[10px] font-bold text-gray-400 hover:text-emerald-400 rounded-lg transition-all cursor-pointer"
              >
                {store.copiedCaption ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {store.copiedCaption ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          {store.generatingCaption ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Crafting viral Sheng caption...</p>
              </div>
            </div>
          ) : store.generatedCaption ? (
            <pre className="flex-grow text-xs text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
              {store.generatedCaption}
            </pre>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center">
              <div>
                <Search className="h-8 w-8 text-emerald-500/20 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Your caption will appear here</p>
                <p className="text-[10px] text-gray-600 mt-1">Set your product details and hit Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="space-y-4">

        {/* Product */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">What are you promoting?</h3>
          <input
            value={store.captionProduct}
            onChange={(e) => store.setCaptionProduct(e.target.value)}
            placeholder="e.g. MemeGen Africa, my restaurant, new album..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none"
          />
        </div>

        {/* Platform */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h3>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => store.setCaptionPlatform(p)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${store.captionPlatform === p ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-slate-800 text-gray-400 hover:text-white"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tone of Voice</h3>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => store.setCaptionTone(t)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${store.captionTone === t ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-slate-800 text-gray-400 hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Language</h3>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => store.setCaptionLanguage(l)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${store.captionLanguage === l ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-slate-800 text-gray-400 hover:text-white"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          loading={store.generatingCaption}
          onClick={handleGenerateCaption}
          icon={<Search />}
          className="w-full"
        >
          {store.generatingCaption ? "Writing Caption..." : "Generate Caption"}
        </Button>
      </div>
    </div>
  );
}
