"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useSettings, Theme, ViewMode, FontFamily, FontWeight,
} from "@/context/SettingsContext";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className="toggle"
      data-on={on ? "true" : "false"} aria-pressed={on}
      onClick={() => onChange(!on)} />
  );
}
function Segment<T extends string>({ value, options, onChange }: {
  value: T; options: readonly T[]; onChange: (v: T) => void;
}) {
  return (
    <div className="segment">
      {options.map((o) => (
        <button key={o} type="button"
          data-active={o === value ? "true" : "false"}
          onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}
function Slider({ value, min, max, step, onChange, format }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div className="slider-wrap">
      <input type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <span className="value">{format ? format(value) : value.toFixed(2)}</span>
    </div>
  );
}
function Row({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <div className="setting-label">{label}{hint && <small>{hint}</small>}</div>
      {children}
    </div>
  );
}

export default function SettingsPanel({ onClose }: { onClose?: () => void }) {
  const { settings, update, reset } = useSettings();
  const router = useRouter();

  function setViewMode(v: ViewMode) {
    update({ viewMode: v });
    if (v === "mushaf") router.push("/?view=mushaf&page=1");
    else if (v === "page") router.push("/?view=page&chapter=24");
    else router.push("/?chapter=24");
  }

  return (
    <div className="settings-list">

      <section className="drawer-section">
        <h3>Appearance</h3>
        <Row label="Theme" hint="Auto follows your system; Black is OLED">
          <Segment<Theme> value={settings.theme}
            options={["light", "dark", "black", "auto"] as const}
            onChange={(v) => update({ theme: v })} />
        </Row>
        <Row label="Font family">
          <Segment<FontFamily> value={settings.fontFamily}
            options={["uthmanic", "amiri", "scheherazade"] as const}
            onChange={(v) => update({ fontFamily: v })} />
        </Row>
        <Row label="Font weight">
          <Segment<FontWeight> value={settings.fontWeight}
            options={["regular", "medium", "semibold", "bold"] as const}
            onChange={(v) => update({ fontWeight: v })} />
        </Row>
        <Row label="Font size" hint="Scroll & page modes only">
          <Slider value={settings.fontSize} min={1} max={3} step={0.05}
            onChange={(v) => update({ fontSize: v })}
            format={(v) => v.toFixed(2) + "rem"} />
        </Row>
        <Row label="Line height" hint="Scroll & page modes only">
          <Slider value={settings.lineHeight} min={1.4} max={4} step={0.05}
            onChange={(v) => update({ lineHeight: v })}
            format={(v) => v.toFixed(2)} />
        </Row>
      </section>

      <section className="drawer-section">
        <h3>Text Outline</h3>
        <Row label="Enable outline" hint="Adds a coloured stroke around the Arabic glyphs — useful when placing exports over busy backgrounds">
          <Toggle on={settings.strokeEnabled}
            onChange={(v) => update({ strokeEnabled: v })} />
        </Row>
        {settings.strokeEnabled && (
          <>
            <Row label="Stroke width">
              <Slider value={settings.strokeWidth} min={0.25} max={4} step={0.25}
                onChange={(v) => update({ strokeWidth: v })}
                format={(v) => v.toFixed(2) + "px"} />
            </Row>
            <Row label="Stroke colour">
              <div className="color-picker-wrap">
                <input type="color" className="color-picker"
                  value={settings.strokeColor}
                  onChange={(e) => update({ strokeColor: e.target.value })} />
                <span className="color-value">{settings.strokeColor}</span>
              </div>
            </Row>
          </>
        )}
      </section>

      <section className="drawer-section">
        <h3>Reading</h3>
        <Row label="View mode" hint="Scroll / Page / Mushaf">
          <Segment<ViewMode> value={settings.viewMode}
            options={["scroll", "page", "mushaf"] as const}
            onChange={setViewMode} />
        </Row>
        <Row label="Page flip animation" hint="Animate Mushaf page changes (respects prefers-reduced-motion)">
          <Toggle on={settings.pageAnimation}
            onChange={(v) => update({ pageAnimation: v })} />
        </Row>
        <Row label="Smooth scrolling">
          <Toggle on={settings.smoothScroll}
            onChange={(v) => update({ smoothScroll: v })} />
        </Row>
        <Row label="Auto-scroll" hint="Scroll mode only">
          <Toggle on={settings.autoScroll}
            onChange={(v) => update({ autoScroll: v })} />
        </Row>
        {settings.autoScroll && (
          <Row label="Auto-scroll speed">
            <Slider value={settings.autoScrollSpeed} min={10} max={200} step={5}
              onChange={(v) => update({ autoScrollSpeed: v })}
              format={(v) => v + " px/s"} />
          </Row>
        )}
      </section>

      <section className="drawer-section">
        <h3>Tajweed &amp; Script</h3>
        <Row label="Tajweed colours">
          <Toggle on={settings.showTajweedColors}
            onChange={(v) => update({ showTajweedColors: v })} />
        </Row>
        <Row label="Verse numbers">
          <Toggle on={settings.showVerseNumbers}
            onChange={(v) => update({ showVerseNumbers: v })} />
        </Row>
      </section>

      <section className="drawer-section">
        <h3>Studio</h3>
        <Row label="Script studio" hint="Paste text, export each line as a PNG">
          <Link href="/script" className="btn">Open ↗</Link>
        </Row>
      </section>

      <section className="drawer-section">
        <Row label="Restore defaults">
          <button className="btn btn-danger" onClick={reset}>Reset all</button>
        </Row>
      </section>

      {onClose && (
        <div style={{ textAlign: "center", padding: "0.5rem 0 1.5rem" }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
}
