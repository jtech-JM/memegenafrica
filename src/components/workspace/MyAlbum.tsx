import React from "react";
import { Database, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { fetchCreations } from "../../api/creations.api";
import { useToast } from "../../hooks/useToast";
import Button from "../ui/Button";

export default function MyAlbum() {
  const store = useAppStore();
  const { showToast } = useToast();

  const handleRefresh = async () => {
    const creations = await fetchCreations(store.selectedUserId);
    store.setSavedCreations(creations);
    showToast("Album refreshed!");
  };

  const memes   = store.savedCreations.filter((c) => c.type === "meme");
  const images  = store.savedCreations.filter((c) => c.type === "image");
  const videos  = store.savedCreations.filter((c) => c.type === "video");

  const Section = ({ title, items, type }: { title: string; items: any[]; type: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
        <span className="text-[9px] text-gray-500 bg-slate-800 px-2 py-0.5 rounded font-mono">{items.length} items</span>
      </div>
      {items.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 text-center">
          <p className="text-xs text-gray-600">No {type}s saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.creation_id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
              {item.image_url ? (
                <img src={item.image_url} alt={item.prompt || "creation"} className="w-full aspect-square object-cover" />
              ) : item.video_url ? (
                <video src={item.video_url} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-slate-800 flex items-center justify-center">
                  <Database className="h-6 w-6 text-slate-600" />
                </div>
              )}
              <div className="p-2">
                {item.caption && (
                  <p className="text-[9px] text-gray-300 font-bold leading-snug line-clamp-2">{item.caption}</p>
                )}
                {item.prompt && (
                  <p className="text-[9px] text-gray-500 leading-snug line-clamp-1 mt-0.5">{item.prompt}</p>
                )}
                <p className="text-[8px] text-gray-600 mt-1 font-mono">
                  {new Date(item.created_at).toLocaleDateString("en-KE")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">
            {store.savedCreations.length} total creation{store.savedCreations.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleRefresh}>Refresh Album</Button>
      </div>

      {store.savedCreations.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <Database className="h-10 w-10 text-violet-500/20 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-400">Your album is empty</p>
          <p className="text-xs text-gray-600 mt-1">Generate memes, images, or videos to see them here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="🎭 Memes" items={memes} type="meme" />
          <Section title="🖼️ Images" items={images} type="image" />
          <Section title="🎬 Videos" items={videos} type="video" />
        </div>
      )}
    </div>
  );
}
