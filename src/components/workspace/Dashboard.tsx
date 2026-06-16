import React from "react";
import { Layers, Sparkles, FileVideo, Search, Cpu, Database, CreditCard, Terminal, ArrowRight } from "lucide-react";
import { useAppStore } from "../../store/AppContext";

type Tab = "dashboard" | "editor" | "image" | "video" | "caption" | "advisor" | "portfolio" | "billing" | "logs";

interface DashboardProps {
  setActiveTab: (t: Tab) => void;
}

const CARDS = [
  {
    id: "editor" as Tab,
    title: "Design & Sarcasm Overlays",
    subtitle: "Kenyan Meme Creator Studio",
    desc: "Customize legendary East African memes, overlay viral WhatsApp jokes, apply styles with Swahili typography and dynamic social simulators.",
    icon: Layers,
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-500 hover:border-amber-400",
    pill: "🔥 Popular",
    credits: "Free / 1 🪙",
  },
  {
    id: "image" as Tab,
    title: "Creative Image Studio",
    subtitle: "AI Illustrative Studio",
    desc: "Generate professional illustrations, cartoon avatar vectors, or edit template backdrops using descriptive local prompts and Sheng concepts.",
    icon: Sparkles,
    color: "from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-400 hover:border-blue-400",
    pill: "🔮 AI Powered",
    credits: "5 🪙",
  },
  {
    id: "video" as Tab,
    title: "High-Quality Video Maker",
    subtitle: "Kenyan Scenes Animator",
    desc: "Animate static illustrations or textual prompts into smooth video clips with East African viewport aspect ratios.",
    icon: FileVideo,
    color: "from-purple-500/20 to-fuchsia-600/10 border-purple-500/30 text-purple-400 hover:border-purple-400",
    pill: "🎬 Cinematic",
    credits: "15 🪙",
  },
  {
    id: "caption" as Tab,
    title: "Social Copywriter",
    subtitle: "Sheng AI Slang Copywriter",
    desc: "Generate witty social media captions and viral taglines optimized for TikTok, Instagram, and WhatsApp in Swahili and Sheng.",
    icon: Search,
    color: "from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400",
    pill: "✍️ Content AI",
    credits: "1 🪙",
  },
  {
    id: "advisor" as Tab,
    title: "Audience Advisor",
    subtitle: "EA Viral Market Strategy",
    desc: "Consult our AI strategy coach for campaign timing, local audience demographics, viral themes, and Sheng branding ideas.",
    icon: Cpu,
    color: "from-pink-500/20 to-rose-600/10 border-pink-500/30 text-pink-400 hover:border-pink-400",
    pill: "💡 Advisor",
    credits: "Free",
  },
  {
    id: "portfolio" as Tab,
    title: "My Album & Saved Works",
    subtitle: "Private Creator Archive",
    desc: "Access your vault of generated memes, video exports, captions, saved drafts, and downloaded media history.",
    icon: Database,
    color: "from-violet-500/20 to-purple-600/10 border-violet-500/30 text-violet-400 hover:border-violet-400",
    pill: "📁 Vault",
    credits: "Free Storage",
  },
  {
    id: "billing" as Tab,
    title: "Top Up Meme Coins",
    subtitle: "Safaricom M-Pesa & Plans",
    desc: "Reload your Meme Coins with Safaricom M-Pesa STK Push, manage monthly creator plans, and review billing receipts.",
    icon: CreditCard,
    color: "from-orange-500/20 to-amber-600/10 border-orange-500/30 text-orange-400 hover:border-orange-400",
    pill: "🪙 Coins",
    credits: "M-Pesa STK",
  },
  {
    id: "logs" as Tab,
    title: "System Console",
    subtitle: "Developer Logs & SQL Explorer",
    desc: "Run sandbox tests, review API debug logs, execute SQL assertions, and manage seed creator profiles.",
    icon: Terminal,
    color: "from-red-500/20 to-rose-600/10 border-red-500/30 text-red-400 hover:border-red-400",
    pill: "⚙️ Admin",
    credits: "Superuser",
    adminOnly: true,
  },
];

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const store = useAppStore();
  const activeUser = store.users.find((u) => u.user_id === store.selectedUserId);
  // System Console is only visible in development mode
  const isAdmin = import.meta.env.DEV;

  const visibleCards = CARDS.filter((c) => {
    if (c.adminOnly && !isAdmin) return false;
    if (!store.searchText) return true;
    const q = store.searchText.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-white tracking-tight">
            Welcome to <span className="text-amber-500">MemeGen Africa</span> 🦁
          </h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            East Africa's elite AI-powered satire, illustration, and Sheng media suite. Pick a studio below to get started.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
          {store.selectedUserId ? (
            <>
              <span>{store.userCredits.find((c) => c.user_id === store.selectedUserId)?.remaining_credits?.toLocaleString() ?? 0}</span>
              <span className="text-amber-600 font-normal">🪙 Meme Coins</span>
            </>
          ) : (
            <span className="text-gray-500 font-normal">Guest — <button onClick={() => store.setAuthScreen("register")} className="text-amber-400 underline cursor-pointer bg-transparent border-none p-0">Register for 50 🪙 free</button></span>
          )}
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className={`group bg-gradient-to-br ${card.color} border rounded-2xl p-5 text-left hover:scale-[1.01] transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-black/20 ${card.color.split(" ")[3]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-black/20 px-2 py-1 rounded-lg text-gray-300">
                  {card.pill}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white leading-tight">{card.title}</h4>
              <p className="text-[10px] font-semibold text-gray-400 mt-0.5 mb-2">{card.subtitle}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{card.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-mono text-gray-500 bg-black/20 px-2 py-0.5 rounded">{card.credits}</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
