import { useAppStore } from "../store/AppContext";

export function useToast() {
  const store = useAppStore();

  const showToast = (msg: string) => {
    store.setToastMessage(msg);
    setTimeout(() => store.setToastMessage(""), 4000);
  };

  return { showToast };
}
