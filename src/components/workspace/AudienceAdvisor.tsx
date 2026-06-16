import React from "react";
import { Cpu, Send } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { useCoach } from "../../hooks/useCoach";
import Button from "../ui/Button";

const EXAMPLE_PROMPTS = [
  "Advise me on the best time to launch a meme campaign in Nairobi for maximum reach.",
  "What pricing model works best for a Kenyan SaaS product targeting SMEs?",
  "How do I grow a Sheng-speaking audience on TikTok from 0 to 10k followers?",
  "Analyse the best hashtag strategy for East African food content on Instagram.",
];

const MODES = [
  { id: "fast" as const,     label: "⚡ Fast",     desc: "gemini-3.1-flash-lite · Quick answers"     },
  { id: "general" as const,  label: "💬 General",  desc: "gemini-3.5-flash · Balanced response"       },
  { id: "thinking" as const, label: "🧠 Deep",     desc: "gemini-3.1-pro-preview · Thoughtful reasoning" },
];

export default function AudienceAdvisor() {
  const store = useAppStore();
  const { handleGetCoachInsight } = useCoach();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* LEFT: Response output */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-80 flex flex-col">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
            <Cpu className="h-3.5 w-3.5 text-pink-400" /> Strategy Response
          </h3>

          {store.loadingCoach ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-6 w-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Consulting AI strategist...</p>
                {store.coachMode === "thinking" && (
                  <p className="text-[10px] text-pink-500 font-mono">Deep reasoning mode active</p>
                )}
              </div>
            </div>
          ) : store.coachResponse ? (
            <div className="flex-grow overflow-y-auto">
              <pre className="text-xs text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                {store.coachResponse}
              </pre>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center">
              <div>
                <Cpu className="h-8 w-8 text-pink-500/20 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Your strategic insights will appear here</p>
                <p className="text-[10px] text-gray-600 mt-1">Ask a question on the right to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="space-y-4">

        {/* Mode selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Reasoning Mode</h3>
          <div className="space-y-1.5">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => store.setCoachMode(mode.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${store.coachMode === mode.id ? "bg-pink-500/10 border-pink-500/30 text-pink-300" : "border-slate-800 text-gray-400 hover:text-white hover:border-slate-700"}`}
              >
                <span className="text-xs font-bold">{mode.label}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">{mode.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Example prompts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Example Questions</h3>
          <div className="space-y-1.5">
            {EXAMPLE_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => store.setCoachPrompt(p)}
                className="w-full text-left px-3 py-2 bg-slate-950 border border-slate-800 hover:border-pink-500/30 text-[10px] text-gray-400 hover:text-pink-400 rounded-lg transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom question */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Your Question</h3>
          <textarea
            value={store.coachPrompt}
            onChange={(e) => store.setCoachPrompt(e.target.value)}
            rows={4}
            placeholder="Ask your strategic question..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-pink-400 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none resize-none"
          />
        </div>

        <Button
          variant="primary"
          size="md"
          loading={store.loadingCoach}
          onClick={handleGetCoachInsight}
          icon={<Send />}
          className="w-full"
        >
          {store.loadingCoach ? "Thinking..." : "Get Strategic Insights"}
        </Button>
      </div>
    </div>
  );
}
