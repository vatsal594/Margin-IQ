import { AlertTriangle, TrendingUp } from "lucide-react";
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
    <div className="min-w-0">
      <div
        className={`flex h-2 gap-0.5 rounded-full overflow-hidden ${
          total ? "" : T.isDark ? "bg-zinc-800" : "bg-zinc-200"
        }`}
      >
        {total > 0 &&
          BANDS.map((b) =>
            summary.counts[b] ? (
              <div
                key={b}
                className={`${HEALTH[b].bar} first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${(summary.counts[b] / total) * 100}%` }}
                title={`${summary.counts[b]} ${HEALTH[b].label}`}
              />
            ) : null,
          )}
      </div>
      <div className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] ${T.muted}`}>
        {BANDS.map((b) => (
          <span key={b} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-sm ${HEALTH[b].bar}`} />
            {HEALTH[b].label}
            <span className={`font-mono-num font-semibold ${T.text}`}>{summary.counts[b]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * A slim strip of headline numbers above the grid, so the pricing grid can
 * use the full width of the page.
 */
export function SummaryPanel({ T, summary, currency, thresholds, usdRate }) {
  const showUsd = currency.code !== "USD" && usdRate > 0;
  const loss = summary.totalMargin < 0;
  const label = `text-[10px] font-semibold uppercase tracking-wider ${T.faint}`;
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-[minmax(200px,1.1fr)_minmax(150px,0.8fr)_minmax(240px,1.6fr)_minmax(120px,0.6fr)] gap-3">
        {/* profit */}
        <div
          className={`relative overflow-hidden rounded-2xl px-4 py-3 text-white shadow-md col-span-2 lg:col-span-1 ${
            loss
              ? "bg-linear-to-br from-red-500 to-rose-700 shadow-red-600/20"
              : "bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-indigo-600/20"
          }`}
        >
          <div className="absolute -right-6 -top-10 w-28 h-28 rounded-full bg-white/10" />
          <div className="relative flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                <TrendingUp size={12} /> Estimated profit
              </div>
              <div className="text-2xl font-display font-bold font-mono-num tracking-tight truncate">
                {fmtMoney(summary.totalMargin, currency.symbol)}
              </div>
            </div>
            {showUsd && (
              <div
                className="text-[11px] font-mono-num text-white/75 text-right shrink-0"
                title="At the proposal's exchange rate, without the forex buffer"
              >
                ≈ {fmtMoney(summary.totalMargin / usdRate, "$")}
                <div className="text-white/60">USD</div>
              </div>
            )}
          </div>
        </div>

        {/* margin */}
        <div className={`${T.card} px-4 py-3`}>
          <div className={label} title="Total profit / total of all prices set">Overall margin</div>
          <div className={`text-2xl font-display font-bold font-mono-num ${marginTone(summary, thresholds)}`}>
            {summary.pricedCount ? fmtPct(summary.blendedPct) : "-"}
          </div>
          <div className={`text-[11px] ${T.muted}`}>
            Lowest {summary.pricedCount ? fmtPct(summary.lowestPct) : "-"}
          </div>
        </div>

        {/* health */}
        <div className={`${T.card} px-4 py-3 col-span-2 lg:col-span-1 order-last lg:order-none flex flex-col justify-center`}>
          <div className={`${label} mb-2`}>Margin health</div>
          <HealthBar T={T} summary={summary} />
        </div>

        {/* coverage */}
        <div className={`${T.card} px-4 py-3`}>
          <div className={label}>Prices set</div>
          <div className="text-2xl font-display font-bold font-mono-num">
            {summary.pricedCount}
            <span className={`text-sm font-medium ${T.muted}`}>/{summary.cellCount}</span>
          </div>
          <div className={`text-[11px] ${T.muted}`}>
            {summary.tldCount} TLD{summary.tldCount === 1 ? "" : "s"} · {fmtMoney(summary.totalRevenue, currency.symbol)}
          </div>
        </div>
      </div>

      {(summary.negativeCount > 0 || summary.duplicates.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {summary.negativeCount > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-xs px-3 py-1.5 flex items-center gap-1.5 animate-rise">
              <AlertTriangle size={13} /> {summary.negativeCount} price
              {summary.negativeCount > 1 ? "s" : ""} below cost
            </div>
          )}
          {summary.duplicates.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-3 py-1.5 flex items-center gap-1.5 animate-rise">
              <AlertTriangle size={13} /> {summary.duplicates.join(", ")} listed more than once - exports
              keep only the last price
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Phones and tablets: profit and margin stay visible while scrolling. */
export function SummaryBar({ T, summary, currency, thresholds }) {
  const tone = marginTone(summary, thresholds);
  return (
    <div
      className={`no-print md:hidden fixed inset-x-0 bottom-0 z-40 border-t ${T.border} ${
        T.isDark ? "bg-zinc-900/95" : "bg-white/95"
      } backdrop-blur px-4 py-2.5 flex items-center justify-between gap-3`}
    >
      <div>
        <div className={`text-[10px] ${T.muted}`}>Profit</div>
        <div className={`text-sm font-bold font-mono-num ${summary.totalMargin < 0 ? "text-red-500" : ""}`}>
          {fmtMoney(summary.totalMargin, currency.symbol)}
        </div>
      </div>
      <div className="text-center">
        <div className={`text-[10px] ${T.muted}`}>Margin</div>
        <div className={`text-sm font-bold font-mono-num ${tone}`}>
          {summary.pricedCount ? fmtPct(summary.blendedPct) : "-"}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-[10px] ${T.muted}`}>Prices set</div>
        <div className="text-sm font-bold font-mono-num flex items-center justify-end gap-1">
          {summary.negativeCount > 0 && <AlertTriangle size={12} className="text-red-500" />}
          {summary.pricedCount}/{summary.cellCount}
        </div>
      </div>
    </div>
  );
}
