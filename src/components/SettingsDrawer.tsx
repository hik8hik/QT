"use client";
import { useScriptSettings, TextAlign } from "@/context/ScriptSettingsContext";

const FONTS = ["Roboto","Inter","Poppins","Montserrat","Playfair Display","Merriweather","Lora","Nunito"];
const WEIGHTS = [300, 400, 500, 600, 700, 800] as const;
const SCALES  = [1, 2, 4, 8] as const;
const ALIGNS: TextAlign[] = ["left", "center", "right"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className="toggle"
      data-on={on ? "true" : "false"} aria-pressed={on}
      onClick={() => onChange(!on)} />
  );
}
function Segment<T extends string | number>({ value, options, onChange, format }: {
  value: T; options: readonly T[]; onChange: (v: T) => void; format?: (v: T) => string;
}) {
  return (
    <div className="segment">
      {options.map((o) => (
        <button key={String(o)} type="button"
          data-active={o === value ? "true" : "false"}
          onClick={() => onChange(o)}>{format ? format(o) : String(o)}</button>
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
      <span className="value">{format ? format(value) : String(value)}</span>
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

export default function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, update, reset } = useScriptSettings();
  return (
    <>
      <div className="drawer-backdrop"
        data-open={open ? "true" : "false"}
        onClick={onClose} aria-hidden={!open} />
      <aside className="drawer"
        data-open={open ? "true" : "false"}
        aria-label="Script settings">
        <div className="drawer-header">
          <h2>Script Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <section className="drawer-section">
          <h3>Typography</h3>
          <Row label="Font family">
            <select className="neo-select" value={settings.fontFamily}
              onChange={(e) => update({ fontFamily: e.target.value })}>
              {FONTS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>{f}</option>
              ))}
            </select>
          </Row>
          <Row label="Font weight">
            <Segment<number> value={settings.fontWeight} options={WEIGHTS}
              onChange={(v) => update({ fontWeight: v })} />
          </Row>
          <Row label="Font size">
            <Slider value={settings.fontSize} min={12} max={240} step={1}
              onChange={(v) => update({ fontSize: v })} format={(v) => v + "px"} />
          </Row>
          <Row label="Letter spacing">
            <Slider value={settings.letterSpacing} min={-5} max={30} step={0.5}
              onChange={(v) => update({ letterSpacing: v })} format={(v) => v.toFixed(1) + "px"} />
          </Row>
          <Row label="Line height">
            <Slider value={settings.lineHeight} min={0.9} max={3} step={0.05}
              onChange={(v) => update({ lineHeight: v })} format={(v) => v.toFixed(2)} />
          </Row>
        </section>

        <section className="drawer-section">
          <h3>Text Outline</h3>
          <Row label="Enable outline" hint="For visibility over busy backgrounds">
            <Toggle on={settings.strokeEnabled}
              onChange={(v) => update({ strokeEnabled: v })} />
          </Row>
          {settings.strokeEnabled && (
            <>
              <Row label="Stroke width">
                <Slider value={settings.strokeWidth} min={0.25} max={6} step={0.25}
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
          <h3>Colors</h3>
          <Row label="Text colour">
            <div className="color-picker-wrap">
              <input type="color" className="color-picker"
                value={settings.textColor}
                onChange={(e) => update({ textColor: e.target.value })} />
              <span className="color-value">{settings.textColor}</span>
            </div>
          </Row>
          <Row label="Background colour">
            <div className="color-picker-wrap">
              <input type="color" className="color-picker"
                value={settings.bgColor}
                disabled={settings.transparent}
                onChange={(e) => update({ bgColor: e.target.value })} />
              <span className="color-value">{settings.bgColor}</span>
            </div>
          </Row>
          <Row label="Transparent background">
            <Toggle on={settings.transparent}
              onChange={(v) => update({ transparent: v })} />
          </Row>
        </section>

        <section className="drawer-section">
          <h3>Layout</h3>
          <Row label="Text align">
            <Segment<TextAlign> value={settings.textAlign} options={ALIGNS}
              onChange={(v) => update({ textAlign: v })} />
          </Row>
          <Row label="Wrap text">
            <Toggle on={settings.wrap} onChange={(v) => update({ wrap: v })} />
          </Row>
          <Row label="Max width">
            <Slider value={settings.maxWidth} min={200} max={2400} step={20}
              onChange={(v) => update({ maxWidth: v })} format={(v) => v + "px"} />
          </Row>
          <Row label="Padding">
            <Slider value={settings.padding} min={0} max={240} step={4}
              onChange={(v) => update({ padding: v })} format={(v) => v + "px"} />
          </Row>
          <Row label="Border radius">
            <Slider value={settings.borderRadius} min={0} max={120} step={2}
              onChange={(v) => update({ borderRadius: v })} format={(v) => v + "px"} />
          </Row>
        </section>

        <section className="drawer-section">
          <h3>Export</h3>
          <Row label="PNG scale">
            <Segment<number> value={settings.exportScale} options={SCALES}
              onChange={(v) => update({ exportScale: v })} format={(v) => v + "×"} />
          </Row>
        </section>

        <section className="drawer-section">
          <Row label="Restore defaults">
            <button className="btn btn-danger" onClick={reset}>Reset</button>
          </Row>
        </section>
      </aside>
    </>
  );
}
