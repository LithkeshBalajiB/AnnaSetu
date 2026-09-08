import { createContext, useContext, useState, type ReactNode } from "react";
import { DATA, type ViewMode, type ViewData } from "@/lib/mock-data";

interface Ctx {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  data: ViewData;
}

const ViewModeContext = createContext<Ctx | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("kitchen");
  return (
    <ViewModeContext.Provider value={{ mode, setMode, data: DATA[mode] }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used inside ViewModeProvider");
  return ctx;
}
