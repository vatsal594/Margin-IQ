import { useState } from "react";
import { AlertTriangle, ArrowLeftRight, RefreshCw } from "lucide-react";
import { FX_SOURCE, conversionRate, usdRate } from "../lib/fx.js";
import { fmtDate } from "../lib/format.js";

// Number input that only commits on blur / Enter, so clearing the field to
// type a new value doesn't snap back to the previous one mid-edit.
function CommitInput({ T, value, placeholder, onCommit, className, label }) {
  const [draft, setDraft] = useState(null);
  const commit = () => {
    if (draft === null) return;
    const trimmed = draft.trim();
    const n = parseFloat(trimmed);
    onCommit(trimmed === "" ? null : Number.isFinite(n) && n >= 0 ? n : undefined);
    setDraft(null);
  };
  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
      value={draft ?? (value ?? "")}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") setDraft(null);
      }}
      className={`rounded-lg border px-2 py-1 text-sm text-right font-mono-num ${T.input} ${className}`}
    />
  );
}

export default function FxBar({ T, fx, currency, status, onOverride, onBuffer, onRefresh }) {
  const isUsd = currency.code === "USD";
  const ecb = fx?.usd?.[currency.code] ?? null;
  const plain = usdRate(fx, currency.code);
  const effective = isUsd ? null : conversionRate(fx, "USD", currency.code);
  const sym = currency.symbol.trim();

  return (
    <div
      className={`rounded-xl border border-indigo-500/20 ${T.isDark ? "bg-indigo-500/[0.06]" : "bg-indigo-50/60"} px-3.5 py-3 mb-4 flex flex-col gap-2`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <ArrowLeftRight size={14} className="text-indigo-500" /> Forex
        </span>

        {!isUsd && (
          <label className="flex items-center gap-1.5">
            <span className={T.muted}>1 USD =</span>
            <span className={T.muted}>{sym}</span>
            <CommitInput
              T={T}
              label={`Rate: ${currency.code} per 1 USD`}
              value={fx?.override ?? ecb}
              placeholder="rate"
              onCommit={(n) => n !== undefined && onOverride(n)}
              className="w-24"
            />
          </label>
        )}

        <label className="flex items-center gap-1.5">
          <span className={T.muted}>+ buffer</span>
          <CommitInput
            T={T}
            label="Forex buffer percent"
            value={fx?.bufferPct ?? 0}
            placeholder="0"
            onCommit={(n) => n !== undefined && onBuffer(n ?? 0)}
            className="w-14"
          />
          <span className={T.muted}>%</span>
        </label>

        {effective !== null && (
          <span className="font-mono-num">
            <span className={T.muted}>= </span>
            <span className="font-semibold">
              {sym}
              {effective.toFixed(2)}
            </span>
            <span className={T.muted}> per USD for costs</span>
          </span>
        )}

        <button
          onClick={onRefresh}
          disabled={status.loading}
          className={`${T.btn} ml-auto text-xs px-2.5 py-1.5`}
          title={`Get today's ${FX_SOURCE} reference rate`}
        >
          <RefreshCw size={12} className={status.loading ? "animate-spin" : ""} />
          {status.loading ? "Updating..." : "Update rate"}
        </button>
      </div>

      <div className={`text-[11px] ${T.muted} flex flex-wrap items-center gap-x-2 gap-y-1`}>
        {status.error ? (
          <span className="text-amber-500 flex items-center gap-1">
            <AlertTriangle size={11} /> Couldn't get today's rate ({status.error})
            {isUsd ? "" : " - type one in to convert costs"}.
          </span>
        ) : fx?.override != null && !isUsd ? (
          <span>
            Your rate{ecb ? ` (${FX_SOURCE}: ${ecb} on ${fmtDate(fx.date)})` : ""} -{" "}
            <button onClick={() => onOverride(null)} className="text-indigo-500 hover:underline">
              use the reference rate
            </button>
          </span>
        ) : fx?.date ? (
          <span>
            {FX_SOURCE} reference rate, {fmtDate(fx.date)}. Saved with this
            proposal - it won't change unless you update it.
          </span>
        ) : status.loading ? (
          <span>Fetching today's rate...</span>
        ) : (
          <span>No rate yet.</span>
        )}
        {!isUsd && plain && (
          <span>
            Costs in USD are converted and shown with their USD value; the
            client's quote shows {currency.code} only.
          </span>
        )}
      </div>
    </div>
  );
}
