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
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">Margin health</span>
        <span className={`text-[11px] ${T.muted}`}>
          {summary.pricedCount}/{summary.cellCount} priced
        </span>
      </div>
      <div
        className={`flex h-2.5 gap-0.5 rounded-full overflow-hidden ${
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
      <div className={`mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] ${T.muted}`}>
        {BANDS.map((b) => (
          <div key={b} className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-sm shrink-0 ${HEALTH[b].bar}`} />
            <span className="truncate">{HEALTH[b].label}</span>
            <span className={`ml-auto font-mono-num ${T.text}`}>{summary.counts[b]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SummaryPanel({ T, summary, currency, thresholds, usdRate }) {
  const showUsd = currency.code !== "USD" && usdRate > 0;
  const loss = summary.totalMargin < 0;
  return (
    <div className="xl:sticky xl:top-28 flex flex-col gap-4">
      {/* headline */}
      <div
        className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${
          loss
            ? "bg-linear-to-br from-red-500 to-rose-700 shadow-red-600/20"
            : "bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-indigo-600/25"
        }`}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-[-40px] w-24 h-24 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <TrendingUp size={13} /> Estimated profit
          </div>
          <div className="mt-1 text-3xl font-display font-bold font-mono-num tracking-tight">
            {fmtMoney(summary.totalMargin, currency.symbol)}
          </div>
          {showUsd && (
            <div
              className="text-xs font-mono-num text-white/70"
              title="At the proposal's exchange rate, without the forex buffer"
            >
              ≈ {fmtMoney(summary.totalMargin / usdRate, "$")} USD
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
            <div>
              <div className="text-[11px] text-white/70" title="Total profit / total of all prices set">
                Overall margin
              </div>
              <div className="text-lg font-semibold font-mono-num">
                {summary.pricedCount ? fmtPct(summary.blendedPct) : "-"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-white/70">Sum of prices</div>
              <div className="text-lg font-semibold font-mono-num truncate">
                {fmtMoney(summary.totalRevenue, currency.symbol)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* health + counts */}
      <div className={`${T.card} p-4 flex flex-col gap-4`}>
        <HealthBar T={T} summary={summary} />
        <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${T.border}`}>
          <div>
            <div className={`text-[11px] ${T.muted}`}>TLDs</div>
            <div className="text-base font-semibold font-mono-num">{summary.tldCount}</div>
          </div>
          <div>
            <div className={`text-[11px] ${T.muted}`}>Lowest margin</div>
            <div className={`text-base font-semibold font-mono-num ${marginTone(summary, thresholds)}`}>
              {summary.pricedCount ? fmtPct(summary.lowestPct) : "-"}
            </div>
          </div>
        </div>
      </div>

      {summary.negativeCount > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs px-3 py-2.5 flex items-center gap-2 animate-rise">
          <AlertTriangle size={14} className="shrink-0" /> {summary.negativeCount} price
          {summary.negativeCount > 1 ? "s" : ""} below cost
        </div>
      )}
      {summary.duplicates.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-3 py-2.5 flex items-center gap-2 animate-rise">
          <AlertTriangle size={14} className="shrink-0" />
          {summary.duplicates.join(", ")} listed more than once - exports keep only the last price
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
      className={`no-print xl:hidden fixed inset-x-0 bottom-0 z-40 lg:left-64 border-t ${T.border} ${
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
