import { AlertTriangle } from "lucide-react";
import { HEALTH } from "../lib/pricing.js";
import { fmtMoney, fmtPct } from "../lib/format.js";

const BANDS = ["loss", "low", "good", "excellent"];

function marginTone(summary, thresholds) {
  if (summary.pricedCount === 0) return "";
  if (summary.blendedPct < 0) return "text-red-500";
  if (summary.blendedPct < thresholds.low) return "text-amber-500";
  if (summary.blendedPct < thresholds.excellent) return "text-sky-500";
  return "text-emerald-500";
}

function HealthBar({ T, summary }) {
  const total = summary.pricedCount;
  return (
    <div>
      <div className={`flex h-2 rounded-full overflow-hidden ${total ? "" : "bg-slate-500/15"}`}>
        {total > 0 &&
          BANDS.map((b) =>
            summary.counts[b] ? (
              <div
                key={b}
                className={HEALTH[b].bar}
                style={{ width: `${(summary.counts[b] / total) * 100}%` }}
                title={`${summary.counts[b]} ${HEALTH[b].label}`}
              />
            ) : null,
          )}
      </div>
      <div className={`mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] ${T.muted}`}>
        {BANDS.map((b) => (
          <div key={b} className="flex items-center gap-1 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${HEALTH[b].bar}`} />
            <span className="truncate">
              {summary.counts[b]} {HEALTH[b].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SummaryPanel({ T, summary, currency, thresholds, usdRate }) {
  const showUsd = currency.code !== "USD" && usdRate > 0;
  const tone = marginTone(summary, thresholds);
  return (
    <div
      className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5 lg:sticky lg:top-36 flex flex-col gap-5`}
    >
      <div className="font-display font-semibold text-sm">Summary</div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
        <div>
          <div className={`text-[11px] ${T.muted}`}>Estimated profit</div>
          <div
            className={`text-2xl font-semibold font-mono-num ${summary.totalMargin < 0 ? "text-red-500" : ""}`}
          >
            {fmtMoney(summary.totalMargin, currency.symbol)}
          </div>
          {showUsd && (
            <div className={`text-[11px] font-mono-num ${T.muted}`} title="At the proposal's exchange rate, without the forex buffer">
              ≈ {fmtMoney(summary.totalMargin / usdRate, "$")} USD
            </div>
          )}
        </div>
        <div>
          <div className={`text-[11px] ${T.muted}`} title="Total profit / total of all prices set">
            Overall margin
          </div>
          <div className={`text-2xl font-semibold font-mono-num ${tone}`}>
            {summary.pricedCount ? fmtPct(summary.blendedPct) : "-"}
          </div>
        </div>
      </div>

      <HealthBar T={T} summary={summary} />

      <div className={`grid grid-cols-3 gap-2 text-center rounded-xl border ${T.border} p-3`}>
        <div>
          <div className="text-sm font-semibold font-mono-num">{summary.tldCount}</div>
          <div className={`text-[10px] ${T.muted}`}>TLDs</div>
        </div>
        <div>
          <div className="text-sm font-semibold font-mono-num">
            {summary.pricedCount}/{summary.cellCount}
          </div>
          <div className={`text-[10px] ${T.muted}`}>Prices set</div>
        </div>
        <div>
          <div className="text-sm font-semibold font-mono-num">
            {fmtMoney(summary.totalRevenue, currency.symbol)}
          </div>
          <div className={`text-[10px] ${T.muted}`}>Sum of prices</div>
        </div>
      </div>

      {summary.negativeCount > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs px-3 py-2.5 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" /> {summary.negativeCount} price
          {summary.negativeCount > 1 ? "s" : ""} below cost
        </div>
      )}
      {summary.duplicates.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-3 py-2.5 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          {summary.duplicates.join(", ")} listed more than once - exports keep
          only the last price
        </div>
      )}
    </div>
  );
}

/** Phones: profit and margin stay visible while scrolling the grid. */
export function SummaryBar({ T, summary, currency, thresholds }) {
  const tone = marginTone(summary, thresholds);
  return (
    <div
      className={`no-print lg:hidden fixed inset-x-0 bottom-0 z-40 border-t ${T.border} ${T.surface} px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]`}
    >
      <div>
        <div className={`text-[10px] ${T.muted}`}>Profit</div>
        <div className={`text-sm font-semibold font-mono-num ${summary.totalMargin < 0 ? "text-red-500" : ""}`}>
          {fmtMoney(summary.totalMargin, currency.symbol)}
        </div>
      </div>
      <div className="text-center">
        <div className={`text-[10px] ${T.muted}`}>Margin</div>
        <div className={`text-sm font-semibold font-mono-num ${tone}`}>
          {summary.pricedCount ? fmtPct(summary.blendedPct) : "-"}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-[10px] ${T.muted}`}>Prices set</div>
        <div className="text-sm font-semibold font-mono-num flex items-center justify-end gap-1">
          {summary.negativeCount > 0 && <AlertTriangle size={12} className="text-red-500" />}
          {summary.pricedCount}/{summary.cellCount}
        </div>
      </div>
    </div>
  );
}
