"use client";
import Link from "next/link";
import SettingsPanel from "@/components/SettingsPanel";

export default function SettingsPage() {
  return (
    <main className="page-wrapper">
      <header className="header">
        <Link href="/" className="brand" aria-label="Back to reader">
          <span className="brand-icon">۞</span>
          <span>@quranbrain</span>
        </Link>
        <div className="header-meta">Settings</div>
        <Link href="/" className="icon-btn" aria-label="Close settings">✕</Link>
      </header>
      <div className="settings-list" style={{ maxWidth: 520, margin: "0 auto" }}>
        <SettingsPanel />
      </div>
    </main>
  );
}
