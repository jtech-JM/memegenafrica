export type VideoState = {
  videoPrompt: string;
  videoAspectRatio: "16:9" | "9:16";
  videoOperationName: string;
  videoPolling: boolean;
  videoDownloadUrl: string;
  videoStatusText: string;
  videoProgress: number;
};

export type VideoActions = {
  setVideoPrompt: (s: string) => void;
  setVideoAspectRatio: (r: "16:9" | "9:16") => void;
  setVideoOperationName: (s: string) => void;
  setVideoPolling: (b: boolean) => void;
  setVideoDownloadUrl: (s: string) => void;
  setVideoStatusText: (s: string) => void;
  setVideoProgress: (n: number) => void;
};

export function createVideoSlice(set: (fn: (s: any) => any) => void): VideoState & VideoActions {
  return {
    videoPrompt: "Wide cinematic drone shot of future high-tech Nairobi cityscape emerging from green savanna forest, hyperdetailed, 3d render, warm sunset",
    videoAspectRatio: "16:9",
    videoOperationName: "op-dummy-video-rendering",
    videoPolling: false,
    videoDownloadUrl: "",
    videoStatusText: "",
    videoProgress: 0,
    setVideoPrompt: (s) => set(() => ({ videoPrompt: s })),
    setVideoAspectRatio: (r) => set(() => ({ videoAspectRatio: r })),
    setVideoOperationName: (s) => set(() => ({ videoOperationName: s })),
    setVideoPolling: (b) => set(() => ({ videoPolling: b })),
    setVideoDownloadUrl: (s) => set(() => ({ videoDownloadUrl: s })),
    setVideoStatusText: (s) => set(() => ({ videoStatusText: s })),
    setVideoProgress: (n) => set(() => ({ videoProgress: n })),
  };
}
