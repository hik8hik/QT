"use client";
import { SettingsProvider } from "@/context/SettingsContext";
import { UIProvider } from "@/context/UIContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <UIProvider>{children}</UIProvider>
    </SettingsProvider>
  );
}
