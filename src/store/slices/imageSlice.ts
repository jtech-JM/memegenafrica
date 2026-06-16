export type ImageState = {
  imagePrompt: string;
  generatingImage: boolean;
  generatedImgUrl: string;
  imageFallbackUsed: boolean;
  imageMode: "generate" | "edit";
  imageAspectRatio: "1:1" | "16:9" | "9:16" | "3:4" | "4:3";
  inputEditImageBase64: string;
  editImageSource: "upload" | "template";
};

export type ImageActions = {
  setImagePrompt: (s: string) => void;
  setGeneratingImage: (b: boolean) => void;
  setGeneratedImgUrl: (s: string) => void;
  setImageFallbackUsed: (b: boolean) => void;
  setImageMode: (m: "generate" | "edit") => void;
  setImageAspectRatio: (r: "1:1" | "16:9" | "9:16" | "3:4" | "4:3") => void;
  setInputEditImageBase64: (s: string) => void;
  setEditImageSource: (s: "upload" | "template") => void;
};

export function createImageSlice(set: (fn: (s: any) => any) => void): ImageState & ImageActions {
  return {
    imagePrompt: "A Nairobi tech graduate smiling, styled as colorful cartoon vector art",
    generatingImage: false,
    generatedImgUrl: "",
    imageFallbackUsed: false,
    imageMode: "generate",
    imageAspectRatio: "1:1",
    inputEditImageBase64: "",
    editImageSource: "template",
    setImagePrompt: (s) => set(() => ({ imagePrompt: s })),
    setGeneratingImage: (b) => set(() => ({ generatingImage: b })),
    setGeneratedImgUrl: (s) => set(() => ({ generatedImgUrl: s })),
    setImageFallbackUsed: (b) => set(() => ({ imageFallbackUsed: b })),
    setImageMode: (m) => set(() => ({ imageMode: m })),
    setImageAspectRatio: (r) => set(() => ({ imageAspectRatio: r })),
    setInputEditImageBase64: (s) => set(() => ({ inputEditImageBase64: s })),
    setEditImageSource: (s) => set(() => ({ editImageSource: s })),
  };
}
