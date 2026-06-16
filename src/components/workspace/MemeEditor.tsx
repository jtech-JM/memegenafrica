import React from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Download, Save } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { useMeme } from "../../hooks/useMeme";
import { MEME_TEMPLATES } from "../../data/templates";
import { TEXT_PRESETS, QUICK_COLORS } from "../../data/uiPresets";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";

export default function MemeEditor() {
  const store = useAppStore();
  const { handleTemplateSelect, handleGenerateSatire, handleSaveMeme, handleMemeRating, downloadMeme } = useMeme();

  const displayText = (t: string) => (store.textUppercase ? t.toUpperCase() : t);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* LEFT: Canvas preview */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative">
          <img
            src={store.selectedTemplate.imageUrl}
            alt={store.selectedTemplate.name}
            className="w-full object-cover aspect-square"
          />
          {/* Top text */}
          {store.topText && (
            <div
              className="absolute top-4 left-0 right-0 text-center px-4 pointer-events-none"
              style={{ fontSize: store.textSize, color: store.textColor, WebkitTextStroke: `2px ${store.strokeColor}`, fontWeight: 900, fontFamily: "Impact, sans-serif", textTransform: store.textUppercase ? "uppercase" : "none", textShadow: `2px 2px 0 ${store.strokeColor}` }}
            >
              {displayText(store.topText)}
            </div>
          )}
          {/* Bottom text */}
          {store.bottomText && (
            <div
              className="absolute bottom-4 left-0 right-0 text-center px-4 pointer-events-none"
              style={{ fontSize: store.textSize, color: store.textColor, WebkitTextStroke: `2px ${store.strokeColor}`, fontWeight: 900, fontFamily: "Impact, sans-serif", textTransform: store.textUppercase ? "uppercase" : "none", textShadow: `2px 2px 0 ${store.strokeColor}` }}
            >
              {displayText(store.bottomText)}
            </div>
          )}
        </div>

        {/* Template info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <p className="text-xs font-bold text-amber-400">{store.selectedTemplate.localName}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{store.selectedTemplate.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={handleSaveMeme} icon={<Save />} className="flex-1">Save to Album</Button>
          <Button variant="secondary" size="sm" onClick={downloadMeme} icon={<Download />} className="flex-1">Download</Button>
        </div>

        {/* Feedback */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 font-mono">Rate this meme:</span>
          <button onClick={() => handleMemeRating("like")} className={`p-2 rounded-lg border transition-all cursor-pointer ${store.memeRating === "like" ? "bg-green-500/20 border-green-500/40 text-green-400" : "border-slate-800 text-gray-500 hover:text-green-400"}`}>
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleMemeRating("dislike")} className={`p-2 rounded-lg border transition-all cursor-pointer ${store.memeRating === "dislike" ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-slate-800 text-gray-500 hover:text-red-400"}`}>
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
          {store.ratingStatusText && <span className="text-[9px] text-gray-500">{store.ratingStatusText}</span>}
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="space-y-4">

        {/* Template picker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Template</h3>
          <div className="grid grid-cols-3 gap-2">
            {MEME_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t)}
                className={`rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${store.selectedTemplate.id === t.id ? "border-amber-500 scale-[1.03]" : "border-slate-800 hover:border-slate-600"}`}
              >
                <img src={t.imageUrl} alt={t.name} className="w-full aspect-square object-cover" />
                <p className="text-[8px] text-gray-400 px-1 py-1 truncate">{t.localName}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Text Overlays</h3>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Top Caption</label>
              <input
                value={store.topText}
                onChange={(e) => store.setTopText(e.target.value)}
                placeholder="Top text..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Bottom Caption</label>
              <input
                value={store.bottomText}
                onChange={(e) => store.setBottomText(e.target.value)}
                placeholder="Bottom text..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Size: {store.textSize}px</label>
              <input type="range" min={14} max={48} value={store.textSize} onChange={(e) => store.setTextSize(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Uppercase</label>
              <button
                onClick={() => store.setTextUppercase(!store.textUppercase)}
                className={`w-full py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${store.textUppercase ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "border-slate-800 text-gray-500"}`}
              >
                {store.textUppercase ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Quick colors */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2">Text Color</label>
            <div className="flex gap-2 flex-wrap">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => store.setTextColor(c.code)}
                  title={c.name}
                  className={`h-6 w-6 rounded-full border-2 transition-all cursor-pointer ${store.textColor === c.code ? "border-amber-400 scale-110" : "border-slate-700"}`}
                  style={{ backgroundColor: c.code }}
                />
              ))}
              <input type="color" value={store.textColor} onChange={(e) => store.setTextColor(e.target.value)} className="h-6 w-6 rounded-full cursor-pointer bg-transparent border-none" title="Custom color" />
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2">Style Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {TEXT_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { store.setTextColor(p.textColor); store.setStrokeColor(p.strokeColor); store.setTextSize(p.size); store.setTextUppercase(p.uppercase); }}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-gray-300 hover:text-amber-400 rounded-lg transition-all cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Satire generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI Satire Generator
          </h3>
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Topic</label>
            <input
              value={store.satireTopic}
              onChange={(e) => store.setSatireTopic(e.target.value)}
              placeholder="e.g. Nairobi fuel prices, M-Pesa fees..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={store.generatingSatire}
            onClick={handleGenerateSatire}
            icon={<Sparkles />}
            className="w-full"
          >
            {store.generatingSatire ? "Generating..." : "Generate Satire Ideas"}
          </Button>

          {store.satireOutput.length > 0 && (
            <div className="space-y-2 mt-2">
              {store.satireOutput.map((idea, i) => (
                <button
                  key={i}
                  onClick={() => { store.setTopText(store.selectedTemplate.localName.toUpperCase()); store.setBottomText(idea.caption); }}
                  className="w-full text-left bg-slate-950 border border-slate-800 hover:border-amber-500/30 rounded-xl p-3 transition-all cursor-pointer group"
                >
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">{idea.language}</span>
                  <p className="text-[11px] text-white font-bold mt-0.5">{idea.caption}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 group-hover:text-gray-400">{idea.interpretation}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
