import { MemeTemplate } from "../../types";
import { MEME_TEMPLATES } from "../../data/templates";

export type MemeState = {
  selectedTemplate: MemeTemplate;
  topText: string;
  bottomText: string;
  textUppercase: boolean;
  textSize: number;
  textColor: string;
  strokeColor: string;
  satireTopic: string;
  generatingSatire: boolean;
  satireOutput: Array<{ language: string; caption: string; interpretation: string }>;
  memeRating: "like" | "dislike" | null;
  ratingStatusText: string;
};

export type MemeActions = {
  setSelectedTemplate: (t: MemeTemplate) => void;
  setTopText: (s: string) => void;
  setBottomText: (s: string) => void;
  setTextUppercase: (b: boolean) => void;
  setTextSize: (n: number) => void;
  setTextColor: (s: string) => void;
  setStrokeColor: (s: string) => void;
  setSatireTopic: (s: string) => void;
  setGeneratingSatire: (b: boolean) => void;
  setSatireOutput: (o: Array<{ language: string; caption: string; interpretation: string }>) => void;
  setMemeRating: (r: "like" | "dislike" | null) => void;
  setRatingStatusText: (s: string) => void;
};

export function createMemeSlice(set: (fn: (s: any) => any) => void): MemeState & MemeActions {
  const defaultTemplate = MEME_TEMPLATES[0];
  return {
    selectedTemplate: defaultTemplate,
    topText: defaultTemplate.defaultTop,
    bottomText: defaultTemplate.defaultBottom,
    textUppercase: true,
    textSize: 24,
    textColor: "#FFFFFF",
    strokeColor: "#000000",
    satireTopic: "Nairobi high fuel cost",
    generatingSatire: false,
    satireOutput: [],
    memeRating: null,
    ratingStatusText: "",
    setSelectedTemplate: (t) => set(() => ({ selectedTemplate: t, topText: t.defaultTop, bottomText: t.defaultBottom, memeRating: null, ratingStatusText: "" })),
    setTopText: (s) => set(() => ({ topText: s })),
    setBottomText: (s) => set(() => ({ bottomText: s })),
    setTextUppercase: (b) => set(() => ({ textUppercase: b })),
    setTextSize: (n) => set(() => ({ textSize: n })),
    setTextColor: (s) => set(() => ({ textColor: s })),
    setStrokeColor: (s) => set(() => ({ strokeColor: s })),
    setSatireTopic: (s) => set(() => ({ satireTopic: s })),
    setGeneratingSatire: (b) => set(() => ({ generatingSatire: b })),
    setSatireOutput: (o) => set(() => ({ satireOutput: o })),
    setMemeRating: (r) => set(() => ({ memeRating: r })),
    setRatingStatusText: (s) => set(() => ({ ratingStatusText: s })),
  };
}
