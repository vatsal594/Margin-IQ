import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Copy,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Pencil,
  Redo2,
  Save,
  Undo2,
  User,
  X,
} from "lucide-react";
import Field from "./Field.jsx";
import PricingGrid from "./PricingGrid.jsx";
import { SummaryBar, SummaryPanel } from "./SummaryPanel.jsx";
import {
  addDaysISO,
  diffDaysISO,
  fmtAgo,
  fmtDate,
  parseDurationDays,
} from "../lib/format.js";
import { useOutsideClose } from "../lib/useOutsideClose.js";
import { currencyInfo, unitByName } from "../lib/businessUnits.js";

/* ---------------------------------------------------------------------- */
/* Notices: one place for "restore unsaved work", "allow file access" etc. */
/* ---------------------------------------------------------------------- */

const NOTICE_TONES = {
  info: "border-indigo-500/25 bg-indigo-500/5",
  warn: "border-amber-500/30 bg-amber-500/10",
};

function Notices({ T, notices, onAction, onDismiss }) {
  if (notices.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {notices.map((n) => (
        <div
          key={n.id}
          className={`rounded-xl border px-3.5 py-2.5 text-sm flex items-center gap-3 ${NOTICE_TONES[n.tone]}`}
        >
          <n.icon
            size={15}
            className={`shrink-0 ${n.tone === "warn" ? "text-amber-500" : "text-indigo-500"}`}
          />
          <span className={`flex-1 ${T.text}`}>{n.text}</span>
          {n.actionLabel && (
            <button
              onClick={() => onAction(n.id)}
              className="shrink-0 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              {n.actionLabel}
            </button>
          )}
          {n.dismissible && (
            <button
              onClick={() => onDismiss(n.id)}
              className={`shrink-0 p-1 rounded-md ${T.muted} ${T.hover}`}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Action bar                                                              */
/* ---------------------------------------------------------------------- */

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function ExportMenu({ T, onExportPdf, onExportExcel, onCopyTable }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, open, () => setOpen(false));
  const item = `w-full flex items-start gap-2.5 px-3 py-2 text-left ${T.hover}`;
  const run = (fn) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border ${T.border} ${T.hover}`}
      >
        Export <ChevronDown size={14} />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-40 mt-2 w-64 rounded-xl border ${T.border} ${T.surface} shadow-xl py-1`}
        >
          {[
            [FileText, "PDF quote", "Client-ready, prices only", onExportPdf],
            [FileSpreadsheet, "Excel sheet", "Prices only - no costs or margin", onExportExcel],
            [Copy, "Copy table", "Paste straight into Excel or email", onCopyTable],
          ].map(([Icon, label, hint, fn]) => (
            <button key={label} className={item} onClick={run(fn)}>
              <Icon size={15} className="mt-0.5 text-indigo-500 shrink-0" />
              <span>
                <span className="block text-sm">{label}</span>
                <span className={`block text-[11px] ${T.muted}`}>{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionBar(props) {
  const { T, proposal, saveState, onSave, onNew, undo, redo, canUndo, canRedo } = props;
  const now = useNow();
  const title = proposal.resellerName.trim() || "Untitled proposal";
  return (
    <div
      className={`md:sticky md:top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 ${T.bg} border-b ${T.border} flex flex-wrap items-center gap-3`}
    >
      <div className="min-w-0 flex-1">
        <div className="font-display font-semibold text-lg leading-tight truncate">
          {title}
        </div>
        <div className={`text-xs ${T.muted} flex items-center gap-1.5`}>
          {saveState.dirty ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {saveState.savedAt
                ? `Unsaved changes - last saved ${fmtAgo(saveState.savedAt, now)}`
                : "Not saved yet"}
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-emerald-500" /> Saved{" "}
              {fmtAgo(saveState.savedAt, now)}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`hidden sm:flex items-center rounded-lg border ${T.border}`}>
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-l-lg disabled:opacity-30 ${T.hover}`}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-r-lg border-l ${T.border} disabled:opacity-30 ${T.hover}`}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 size={15} />
          </button>
        </div>
        <button
          onClick={onNew}
          className={`p-2 rounded-lg border ${T.border} ${T.hover}`}
          title="New proposal (Ctrl+N)"
          aria-label="New proposal"
        >
          <FilePlus2 size={15} />
        </button>
        <ExportMenu T={T} {...props} />
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all text-white font-medium"
          title="Save draft (Ctrl+S)"
        >
          <Save size={15} /> Save
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Proposal details                                                        */
/* ---------------------------------------------------------------------- */

function DetailsCard(props) {
  const {
    T,
    proposal,
    setProposal,
    units,
    onBusinessUnitChange,
    recentResellers,
    onPickReseller,
  } = props;
  const [open, setOpen] = useState(() => !proposal.resellerName.trim());
  const set = (field) => (e) => setProposal((p) => ({ ...p, [field]: e.target.value }));
  const input = `w-full rounded-lg border px-3 py-2 text-sm ${T.input}`;
  const unit = unitByName(proposal.company);

  if (!open) {
    const validity = proposal.endDate
      ? `${fmtDate(proposal.startDate)} - ${fmtDate(proposal.endDate)}`
      : `From ${fmtDate(proposal.startDate)}`;
    return (
      <button
        onClick={() => setOpen(true)}
        className={`w-full text-left ${T.surface} border ${T.border} rounded-2xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm ${T.hover}`}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Building2 size={14} className="text-indigo-500" />
          {proposal.resellerName || "No reseller"}
        </span>
        <span className={T.muted}>{proposal.company}</span>
        <span className={`font-mono-num ${T.muted}`}>{proposal.currency}</span>
        <span className={`flex items-center gap-1.5 ${T.muted}`}>
          <CalendarRange size={13} /> {validity}
        </span>
        {proposal.preparedBy && (
          <span className={`flex items-center gap-1.5 ${T.muted}`}>
            <User size={13} /> {proposal.preparedBy}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-xs text-indigo-500 font-medium">
          <Pencil size={12} /> Edit details
        </span>
      </button>
    );
  }

  return (
    <div className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-display font-semibold text-sm">
          <Building2 size={16} className="text-indigo-500" /> Proposal details
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          Done
        </button>
      </div>

      {recentResellers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`text-[11px] ${T.muted}`}>Recent:</span>
          {recentResellers.map((name) => (
            <button
              key={name}
              onClick={() => onPickReseller(name)}
              className={`text-[11px] px-2 py-1 rounded-full border ${T.border} ${T.muted} ${T.hover}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Field label="Reseller name" T={T}>
          <input
            autoFocus={!proposal.resellerName}
            className={input}
            value={proposal.resellerName}
            onChange={set("resellerName")}
            placeholder="Acme Web Hosting"
          />
        </Field>
        <Field label="Business unit" T={T}>
          <select
            className={input}
            value={proposal.company}
            onChange={(e) => onBusinessUnitChange(e.target.value)}
          >
            {units.map((u) => (
              <option key={u.name} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quote currency" T={T}>
          <div
            className={`w-full rounded-lg border px-3 py-2 text-sm flex items-center justify-between gap-2 ${T.border} ${T.surfaceAlt}`}
            title="Set by the business unit"
          >
            <span className="font-mono-num">
              {proposal.currency} ({currencyInfo(proposal.currency).symbol.trim()})
            </span>
            <span className={`text-[11px] ${T.muted}`}>set by business unit</span>
          </div>
          {unit && unit.currency !== proposal.currency && (
            <p className="mt-1 text-[11px] text-amber-500">
              Saved in {proposal.currency}, but {unit.name} quotes in{" "}
              {unit.currency}.{" "}
              <button
                onClick={() => onBusinessUnitChange(unit.name)}
                className="text-indigo-500 hover:underline"
              >
                Switch to {unit.currency}
              </button>
            </p>
          )}
        </Field>
        <Field label="Offer duration" T={T}>
          <input
            className={input}
            value={proposal.offerDuration}
            placeholder="30 days"
            onChange={(e) => {
              const val = e.target.value;
              setProposal((p) => {
                const days = parseDurationDays(val);
                const next = { ...p, offerDuration: val };
                if (days !== null && p.startDate) next.endDate = addDaysISO(p.startDate, days);
                return next;
              });
            }}
          />
        </Field>
        <Field label="Start date" T={T}>
          <input
            type="date"
            className={input}
            value={proposal.startDate}
            onChange={(e) => {
              const val = e.target.value;
              setProposal((p) => {
                const next = { ...p, startDate: val };
                if (p.endDate) {
                  const days = diffDaysISO(val, p.endDate);
                  if (days !== null && days >= 0)
                    next.offerDuration = `${days} day${days === 1 ? "" : "s"}`;
                } else {
                  const days = parseDurationDays(p.offerDuration);
                  if (days !== null && val) next.endDate = addDaysISO(val, days);
                }
                return next;
              });
            }}
          />
        </Field>
        <Field label="End date" T={T}>
          <input
            type="date"
            className={input}
            value={proposal.endDate}
            onChange={(e) => {
              const val = e.target.value;
              setProposal((p) => {
                const next = { ...p, endDate: val };
                if (p.startDate && val) {
                  const days = diffDaysISO(p.startDate, val);
                  if (days !== null && days >= 0)
                    next.offerDuration = `${days} day${days === 1 ? "" : "s"}`;
                }
                return next;
              });
            }}
          />
        </Field>
        <Field label="Prepared by" T={T}>
          <input
            className={input}
            value={proposal.preparedBy}
            onChange={set("preparedBy")}
            placeholder="Your name"
          />
        </Field>
        <Field label="Notes (shown on the quote)" T={T} full>
          <textarea
            rows={2}
            className={`${input} resize-none`}
            value={proposal.notes}
            onChange={set("notes")}
            placeholder="Any terms, conditions or special mentions for this offer..."
          />
        </Field>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Editor                                                                  */
/* ---------------------------------------------------------------------- */

export default function EditorView(props) {
  const { T, notices, onNoticeAction, onNoticeDismiss, summary, currency, thresholds, usdRate } = props;
  return (
    <div className="flex flex-col gap-5">
      <ActionBar {...props} />
      <Notices T={T} notices={notices} onAction={onNoticeAction} onDismiss={onNoticeDismiss} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <DetailsCard key={props.loadToken} {...props} />
          <PricingGrid {...props} />
        </div>
        <SummaryPanel
          T={T}
          summary={summary}
          currency={currency}
          thresholds={thresholds}
          usdRate={usdRate}
        />
      </div>
      <SummaryBar T={T} summary={summary} currency={currency} thresholds={thresholds} />
    </div>
  );
}
