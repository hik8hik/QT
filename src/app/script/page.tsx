import { ScriptSettingsProvider } from "@/context/ScriptSettingsContext";
import ScriptStudio from "@/components/ScriptStudio";
export default function ScriptPage() {
  return (
    <ScriptSettingsProvider>
      <main className="page-wrapper"><ScriptStudio /></main>
    </ScriptSettingsProvider>
  );
}
