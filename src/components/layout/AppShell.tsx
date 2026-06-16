import React, { useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Toast from "../ui/Toast";
import Dashboard from "../workspace/Dashboard";
import MemeEditor from "../workspace/MemeEditor";
import ImageStudio from "../workspace/ImageStudio";
import VideoMaker from "../workspace/VideoMaker";
import SocialCopywriter from "../workspace/SocialCopywriter";
import AudienceAdvisor from "../workspace/AudienceAdvisor";
import MyAlbum from "../workspace/MyAlbum";
import Billing from "../workspace/Billing";
import SystemConsole from "../workspace/SystemConsole";
import { useAppStore } from "../../store/AppContext";

type Tab =
  | "dashboard" | "editor" | "image" | "video"
  | "caption" | "advisor" | "portfolio" | "billing" | "logs";

const TAB_TITLES: Record<Tab, string> = {
  dashboard: "🏠 Central Dashboard Hub",
  editor:    "🎨 Interactive Meme Maker",
  image:     "🔮 Creative Image Studio",
  video:     "🎬 High-Quality Video Maker",
  caption:   "💡 Social Copywriter",
  advisor:   "🧠 Audience Advisor",
  billing:   "🪙 Top Up Meme Coins",
  portfolio: "📁 My Album",
  logs:      "⚙️ System Console",
};

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const store = useAppStore();
  const activePlan = store.subscriptionPlans.find(
    (p) => p.plan_id === store.userCredits.find((c) => c.user_id === store.selectedUserId)?.plan_id
  );

  return (
    <div className="min-h-screen bg-[#070a13] text-white flex flex-col">
      <TopBar />

      <div className="flex-grow flex flex-col lg:flex-row gap-0">
        <div className="w-full lg:w-64 shrink-0 p-4 lg:py-6 lg:pl-6 lg:pr-0">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <main className="flex-grow min-w-0 p-4 md:p-6 flex flex-col gap-5">
          {/* Header bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-tight">
                {TAB_TITLES[activeTab]}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Active plan: <span className="text-amber-400 font-bold">{activePlan?.name || "Free Sandbox"}</span>
                {" · "}Currency: <span className="font-bold text-gray-200">{store.currencyMode}</span>
              </p>
            </div>
          </div>

          {activeTab !== "dashboard" && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className="self-start text-[11px] font-mono font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 bg-slate-900/50 hover:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 cursor-pointer"
            >
              ← Back to Central Hub
            </button>
          )}

          {/* Active panel */}
          {activeTab === "dashboard"  && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === "editor"     && <MemeEditor />}
          {activeTab === "image"      && <ImageStudio />}
          {activeTab === "video"      && <VideoMaker />}
          {activeTab === "caption"    && <SocialCopywriter />}
          {activeTab === "advisor"    && <AudienceAdvisor />}
          {activeTab === "portfolio"  && <MyAlbum />}
          {activeTab === "billing"    && <Billing />}
          {activeTab === "logs"       && <SystemConsole />}
        </main>
      </div>

      <Toast />
    </div>
  );
}
