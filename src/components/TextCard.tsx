"use client";
import { forwardRef } from "react";
import { useScriptSettings } from "@/context/ScriptSettingsContext";

interface Props { line: string; index: number; onDownload: () => void; }

const TextCard = forwardRef<HTMLDivElement, Props>(function TextCard(
  { line, index, onDownload }, ref
) {
  const { settings } = useScriptSettings();
  const style: React.CSSProperties = {
    maxWidth: settings.wrap ? settings.maxWidth + "px" : undefined,
    padding: settings.padding + "px",
    borderRadius: settings.borderRadius + "px",
    backgroundColor: settings.transparent ? "transparent" : settings.bgColor,
    color: settings.textColor,
    fontFamily: `"${settings.fontFamily}", sans-serif`,
    fontSize: settings.fontSize + "px",
    fontWeight: settings.fontWeight,
    letterSpacing: settings.letterSpacing + "px",
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    whiteSpace: settings.wrap ? "pre-wrap" : "pre",
    WebkitTextStroke: settings.strokeEnabled
      ? `${settings.strokeWidth}px ${settings.strokeColor}` : undefined,
    paintOrder: "stroke fill",
  };
  return (
    <div className="text-card-wrap" data-transparent={settings.transparent ? "true" : "false"}>
      <div className="text-card-frame">
        <div ref={ref} className="text-card" style={style}>{line}</div>
        <button type="button" data-export-hide
          className="export-btn text-card-dl"
          onClick={onDownload}
          title={`Download line ${index + 1} as PNG`}>
          ⤓ PNG
        </button>
      </div>
    </div>
  );
});
export default TextCard;
