import {
  ChevronsLeft,
  ChevronsRight,
  Command,
  FileText,
  History as HistoryIcon,
  Moon,
  Plus,
  Settings as SettingsIcon,
  Sun,
  Table2,
} from "lucide-react";
import { LogoMark, SocialLinks } from "./Brand.jsx";

const NAV = [
  { key: "editor", label: "Proposal", icon: FileText },
  { key: "history", label: "Proposals", icon: HistoryIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const SHEET_TONE = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  off: "bg-zinc-400",
};

function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NavButton({ T, item, active, count, onClick, compact, iconOnly }) {
  const Icon = item.icon;
  const activeCls = T.isDark
    ? "bg-zinc-800 text-white"
    : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200";
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={iconOnly ? item.label : undefined}
      title={iconOnly ? item.label : undefined}
      className={`relative flex items-center gap-2.5 rounded-lg font-medium transition-colors ${
        iconOnly
          ? "w-10 h-10 justify-center"
          : compact
            ? "px-3 py-1.5 text-xs"
            : "w-full px-3 py-2 text-sm"
      } ${active ? activeCls : `${T.muted} ${T.hover}`}`}
    >
      <Icon size={compact ? 14 : 17} className={active ? "text-indigo-500" : ""} />
      {!iconOnly && <span className="flex-1 text-left">{item.label}</span>}
      {!compact && count > 0 &&
        (iconOnly ? (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-semibold flex items-center justify-center">
            {count}
          </span>
        ) : (
          <span
            className={`text-[11px] font-mono-num px-1.5 rounded-md ${
              T.isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200/70 text-zinc-600"
            }`}
          >
            {count}
          </span>
        ))}
    </button>
  );
}

export default function AppShell({
  T,
  view,
  setView,
  setIsDark,
  collapsed,
  setCollapsed,
  onNew,
  onPalette,
  preparedBy,
  historyCount,
  sheet,
  children,
}) {
  const iconBtn = `w-9 h-9 rounded-lg flex items-center justify-center ${T.muted} ${T.hover}`;
  const themeButton = (
    <button
      onClick={() => setIsDark((d) => !d)}
      className={iconBtn}
      title={T.isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {T.isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
  const collapseButton = (
    <button
      onClick={() => setCollapsed((c) => !c)}
      className={iconBtn}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
    </button>
  );
  const asideBg = T.isDark ? "bg-zinc-950" : "bg-[#eef0f3]";

  return (
    <div className={`app-main ${collapsed ? "lg:pl-[68px]" : "lg:pl-64"} transition-[padding] duration-200`}>
      {/* ---------------------------- desktop sidebar ---------------------------- */}
      {collapsed ? (
        <aside
          className={`no-print hidden lg:flex fixed inset-y-0 left-0 z-40 w-[68px] flex-col items-center gap-2 py-4 border-r ${T.border} ${asideBg}`}
        >
          <LogoMark size={34} className="rounded-xl shadow-md shadow-indigo-600/25 mb-2" />
          <button
            onClick={onNew}
            className={`${T.btnPrimary} w-10 h-10`}
            title="New proposal (Ctrl+N)"
            aria-label="New proposal"
          >
            <Plus size={18} />
          </button>
          <nav className="mt-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavButton
                key={n.key}
                T={T}
                item={n}
                active={view === n.key}
                count={n.key === "history" ? historyCount : 0}
                onClick={() => setView(n.key)}
                iconOnly
              />
            ))}
          </nav>
          <div className="mt-auto flex flex-col items-center gap-1">
            <button
              onClick={() => setView("settings")}
              className={`${iconBtn} relative`}
              title={`Cost sheet: ${sheet.label}${sheet.detail ? ` - ${sheet.detail}` : ""}`}
              aria-label="Cost sheet status"
            >
              <Table2 size={16} />
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${SHEET_TONE[sheet.tone]}`} />
            </button>
            <button onClick={onPalette} className={iconBtn} title="Quick actions (Ctrl+K)" aria-label="Quick actions">
              <Command size={16} />
            </button>
            {themeButton}
            {collapseButton}
          </div>
        </aside>
      ) : (
        <aside
          className={`no-print hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r ${T.border} ${asideBg}`}
        >
          <div className="px-5 pt-5 pb-4 flex items-center gap-3">
            <LogoMark size={34} className="rounded-xl shadow-md shadow-indigo-600/25" />
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[15px] leading-tight">Margin IQ</div>
              <div className={`text-[11px] ${T.muted}`}>Pricing intelligence</div>
            </div>
            {collapseButton}
          </div>

          <div className="px-3">
            <button onClick={onNew} className={`${T.btnPrimary} w-full py-2 text-sm`}>
              <Plus size={15} /> New proposal
            </button>
          </div>

          <nav className="px-3 mt-5 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavButton
                key={n.key}
                T={T}
                item={n}
                active={view === n.key}
                count={n.key === "history" ? historyCount : 0}
                onClick={() => setView(n.key)}
              />
            ))}
          </nav>

          <div className="mt-auto px-3 pb-3 flex flex-col gap-3">
            <button
              onClick={() => setView("settings")}
              className={`w-full text-left rounded-xl border ${T.border} ${T.surface} p-3 ${T.hover}`}
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <Table2 size={13} className="text-indigo-500" /> Cost sheet
                <span className={`ml-auto w-2 h-2 rounded-full ${SHEET_TONE[sheet.tone]}`} />
              </div>
              <div className="mt-1 text-xs">{sheet.label}</div>
              {sheet.detail && <div className={`text-[11px] ${T.muted}`}>{sheet.detail}</div>}
            </button>
            <button
              onClick={onPalette}
              className={`w-full flex items-center gap-2 rounded-lg border ${T.border} ${T.surface} px-3 py-1.5 text-xs ${T.muted} ${T.hover}`}
            >
              <Command size={13} /> Quick actions
              <kbd className={`ml-auto text-[10px] font-sans ${T.faint}`}>Ctrl K</kbd>
            </button>
            <div className={`flex items-center gap-2 pt-3 border-t ${T.border}`}>
              <div
                className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white text-[11px] font-semibold flex items-center justify-center shrink-0"
                title={preparedBy || "Set your name in Settings"}
              >
                {initialsOf(preparedBy)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{preparedBy || "You"}</div>
                <div className={`text-[10px] ${T.muted} truncate`}>Made by Vatsal Savani</div>
              </div>
              {themeButton}
            </div>
            <SocialLinks T={T} size={14} className="justify-between" />
          </div>
        </aside>
      )}

      {/* ----------------------------- mobile top bar ----------------------------- */}
      <header
        className={`no-print lg:hidden sticky top-0 z-40 border-b ${T.border} ${
          T.isDark ? "bg-zinc-950/90" : "bg-white/90"
        } backdrop-blur`}
      >
        <div className="px-4 h-14 flex items-center gap-3">
          <LogoMark size={28} className="rounded-lg" />
          <div className="font-display font-bold text-sm flex-1">Margin IQ</div>
          <button onClick={onNew} className={`${T.btn} w-8 h-8`} aria-label="New proposal">
            <Plus size={15} />
          </button>
          {themeButton}
        </div>
        <nav className="px-3 pb-2 flex gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <NavButton
              key={n.key}
              T={T}
              item={n}
              active={view === n.key}
              onClick={() => setView(n.key)}
              compact
            />
          ))}
        </nav>
      </header>

      <main className="no-print px-4 sm:px-6 lg:px-8 py-5 lg:py-6">{children}</main>
    </div>
  );
}
