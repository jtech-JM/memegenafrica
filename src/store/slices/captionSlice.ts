export type CaptionState = {
  captionProduct: string;
  captionTone: string;
  captionPlatform: string;
  captionLanguage: string;
  generatingCaption: boolean;
  generatedCaption: string;
  copiedCaption: boolean;
};

export type CaptionActions = {
  setCaptionProduct: (s: string) => void;
  setCaptionTone: (s: string) => void;
  setCaptionPlatform: (s: string) => void;
  setCaptionLanguage: (s: string) => void;
  setGeneratingCaption: (b: boolean) => void;
  setGeneratedCaption: (s: string) => void;
  setCopiedCaption: (b: boolean) => void;
};

export function createCaptionSlice(set: (fn: (s: any) => any) => void): CaptionState & CaptionActions {
  return {
    captionProduct: "MemeGen Africa AI Web platform",
    captionTone: "witty Sheng-slang",
    captionPlatform: "TikTok",
    captionLanguage: "Sheng",
    generatingCaption: false,
    generatedCaption: "",
    copiedCaption: false,
    setCaptionProduct: (s) => set(() => ({ captionProduct: s })),
    setCaptionTone: (s) => set(() => ({ captionTone: s })),
    setCaptionPlatform: (s) => set(() => ({ captionPlatform: s })),
    setCaptionLanguage: (s) => set(() => ({ captionLanguage: s })),
    setGeneratingCaption: (b) => set(() => ({ generatingCaption: b })),
    setGeneratedCaption: (s) => set(() => ({ generatedCaption: s })),
    setCopiedCaption: (b) => set(() => ({ copiedCaption: b })),
  };
}
