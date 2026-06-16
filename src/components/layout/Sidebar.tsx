import React from "react";
import {
  BookOpen, Layers, Sparkles, FileVideo, Search, Cpu,
  Database, CreditCard, Terminal, TrendingUp,
} from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { useToast } from "../../hooks/useToast";

type Tab =
  | "dashboard" | "editor" | "image" | "video"
  | "caption" | "advisor" | "portfolio" | "billing" | "logs";

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
}

type NavItem = { id: Tab; name: string; desc: string; icon: React.ElementType };

const creativeItems: NavItem[] = [
  { id: "editor",  name: "Meme Creator",    desc: "Design & sarcasm overlays",   icon: Layers    },
  { id: "image",   name: "Image Studio",    desc: "Generate illustrative art",    icon: Sparkles  },
  { id: "video",   name: "Video Maker",     desc: "Animate visual scenes",        icon: FileVideo },
];
const strategyItems: NavItem[] = [
  { id: "caption", name: "Copywriter",      desc: "Witty Sheng voice drafts",     icon: Search    },
  { id: "advisor", name: "Audience Advisor",desc: "EA market strategy",           icon: Cpu       },
];
const personalItems: NavItem[] = [
  { id: "portfolio", name: "My Album",      desc: "Saved creations & works",      icon: Database  },
  { id: "billing",   name: "Top Up",        desc: "Plans & M-Pesa billing",       icon: CreditCard},
];
const adminItems: NavItem[] = [
  { id: "logs",    name: "System Console",  desc: "Logs & SQL sandbox",           icon: Terminal  },
];

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void; key?: React.Key }) {
  const Icon = item.icon;
  const isAdmin = item.id === "logs";
  const activeClass = isAdmin
    ? "bg-red-500 text-slate-950 font-bold shadow-md shadow-red-500/10 scale-[1.01]"
    : "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10 scale-[1.01]";
  const iconActiveClass = isAdmin ? "text-slate-950" : "text-slate-950";
  const iconInactiveClass = isAdmin ? "text-red-400" : "text-amber-500";

  return (
    <button
      onClick={onClick}
      className={`w-40 lg:w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 lg:shrink cursor-pointer ${
        active ? activeClass : "text-gray-300 hover:text-white hover:bg-slate-950/40"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? iconActiveClass : iconInactiveClass}`} />
      <div className="truncate min-w-0">
        <p className="text-xs font-bold leading-none">{item.name}</p>
        <p className={`text-[9.5px] mt-0.5 leading-none ${active ? "text-slate-800" : "text-gray-400"}`}>{item.desc}</p>
      </div>
    </button>
  );
}

function SectionLabel({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span className={`hidden lg:block text-[9px] uppercase font-bold tracking-wider px-2 mt-1 mb-1 ${accent ? "text-red-400" : "text-amber-500/90"}`}>
      {label}
    </span>
  );
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const store = useAppStore();
  const { showToast } = useToast();

  // System Console is only visible in development mode
  const isAdmin = import.meta.env.DEV;

  const go = (tab: Tab) => {
    setActiveTab(tab);
    showToast(`Loaded ${tab} workspace`);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">

      {/* Navigation */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-lg flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-none">

        {/* Hub */}
        <NavButton
          item={{ id: "dashboard", name: "Central Hub", desc: "2×3 Feature Grid Suite", icon: BookOpen }}
          active={activeTab === "dashboard"}
          onClick={() => go("dashboard")}
        />

        <div className="h-px bg-slate-800/80 hidden lg:block my-0.5" />
        <SectionLabel label="🎨 Creative Studios" />
        <div className="flex flex-row lg:flex-col gap-1">
          {creativeItems.map((item) => (
            <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => go(item.id)} />
          ))}
        </div>

        <div className="h-px bg-slate-800/80 hidden lg:block my-0.5" />
        <SectionLabel label="💡 Copy & Strategy" />
        <div className="flex flex-row lg:flex-col gap-1">
          {strategyItems.map((item) => (
            <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => go(item.id)} />
          ))}
        </div>

        <div className="h-px bg-slate-800/80 hidden lg:block my-0.5" />
        <SectionLabel label="👤 Personal Space" />
        <div className="flex flex-row lg:flex-col gap-1">
          {personalItems.map((item) => (
            <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => go(item.id)} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="h-px bg-slate-800/80 hidden lg:block my-0.5" />
            <SectionLabel label="⚙️ System Settings" accent />
            <div className="flex flex-row lg:flex-col gap-1">
              {adminItems.map((item) => (
                <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => go(item.id)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trend spotlight card */}
      <div className="bg-gradient-to-br from-amber-500/10 to-slate-900 border border-slate-800 p-4 rounded-2xl hidden lg:flex flex-col gap-2 shadow-md">
        <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 uppercase">
          <TrendingUp className="h-3.5 w-3.5" /> Trend Spotlight
        </span>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          "Late night fuel tariff sarcasm triggers 92% higher viral engagement on TikTok in Kenya."
        </p>
        <button
          onClick={() => { go("editor"); store.setSatireTopic("High fuel prices and wrong-number refunds"); showToast("Applied viral trend topic!"); }}
          className="text-[10px] font-bold text-amber-500 hover:underline text-left mt-1 inline-flex items-center gap-1 cursor-pointer"
        >
          Load Trend Now →
        </button>
      </div>

    </aside>
  );
}
