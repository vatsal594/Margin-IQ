import { useMemo } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Copy,
  FileText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { calcRow } from "../lib/pricing.js";
import { fmtDate, fmtMoney, fmtPct } from "../lib/format.js";
import { BUSINESS_UNITS, currencyInfo, migrateCompany } from "../lib/businessUnits.js";

// Totals for a saved proposal, worked out from its rows.
function statsFor(entry, thresholds) {
  const rows = (entry.data?.rows || []).filter((r) => String(r.tld || "").trim());
  let profit = 0;
  let revenue = 0;
  let priced = 0;
  for (const r of rows) {
    const c = calcRow(r, thresholds);
    if (c.status === "empty") continue;
    priced++;
    profit += c.margin;
    revenue += parseFloat(r.price) || 0;
  }
  const tlds = new Set(rows.map((r) => r.tld.trim().toLowerCase())).size;
  return { tlds, priced, profit, margin: revenue > 0 ? (profit / revenue) * 100 : null };
}

function marginClass(pct, thresholds) {
  if (pct === null) return "";
  if (pct < 0) return "text-red-500";
  if (pct < thresholds.low) return "text-amber-500";
  if (pct < thresholds.excellent) return "text-sky-500";
  return "text-emerald-500";
}

function isExpired(entry) {
  const end = entry.data?.proposal?.endDate;
  return end ? new Date(`${end}T23:59:59`) < new Date() : false;
}

export default function HistoryView({
  T,
  proposals,
  totalCount,
  historyQuery,
  setHistoryQuery,
  historyFrom,
  setHistoryFrom,
  historyTo,
  setHistoryTo,
  unitFilter,
  setUnitFilter,
  thresholds,
  loadDraft,
  cloneDraft,
  deleteDraft,
  onNew,
}) {
  const filtersActive = historyQuery || historyFrom || historyTo || unitFilter;
  const clearFilters = () => {
    setHistoryQuery("");
    setHistoryFrom("");
    setHistoryTo("");
    setUnitFilter("");
  };
  const cards = useMemo(
    () => proposals.map((p) => ({ p, stats: statsFor(p, thresholds), expired: isExpired(p) })),
    [proposals, thresholds],
  );
  const input = `rounded-lg border px-3 py-2 text-sm ${T.input}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-wider ${T.faint}`}>
            Saved work
          </div>
          <h1 className="font-display font-bold text-2xl">Proposals</h1>
          <p className={`text-sm ${T.muted}`}>
            {totalCount === 0
              ? "Drafts you save appear here."
              : filtersActive
                ? `${proposals.length} of ${totalCount} proposals`
                : `${totalCount} saved proposal${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <button onClick={onNew} className={`${T.btnPrimary} text-sm px-4 py-2`}>
          <FileText size={15} /> New proposal
        </button>
      </div>

      {totalCount > 0 && (
        <div className={`${T.card} p-3 flex flex-wrap items-center gap-2`}>
          <div className={`flex items-center gap-2 rounded-lg border px-3 flex-1 min-w-[200px] ${T.input}`}>
            <Search size={15} className={T.muted} />
            <input
              value={historyQuery}
              onChange={(e) => setHistoryQuery(e.target.value)}
              placeholder="Search by reseller..."
              aria-label="Search proposals by reseller"
              className="flex-1 bg-transparent outline-none text-sm py-2"
            />
          </div>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            aria-label="Filter by business unit"
            className={input}
          >
            <option value="">All business units</option>
            {BUSINESS_UNITS.map((u) => (
              <option key={u.name} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={historyFrom}
              onChange={(e) => setHistoryFrom(e.target.value)}
              className={input}
              aria-label="Created from"
            />
            <span className={`text-xs ${T.muted}`}>to</span>
            <input
              type="date"
              value={historyTo}
              onChange={(e) => setHistoryTo(e.target.value)}
              className={input}
              aria-label="Created until"
            />
          </div>
          {filtersActive && (
            <button onClick={clearFilters} className={`${T.btn} text-xs px-3 py-2`}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      )}

      {totalCount === 0 ? (
        <div className={`${T.card} py-16 px-6 text-center`}>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <FileText size={24} />
          </div>
          <div className="mt-4 font-display font-bold text-lg">No proposals yet</div>
          <p className={`mt-1 text-sm ${T.muted} max-w-sm mx-auto`}>
            Build a quote in the editor and press Save (Ctrl+S) - it will show up here
            with its profit and margin.
          </p>
          <button onClick={onNew} className={`${T.btnPrimary} mt-5 text-sm px-4 py-2`}>
            Start a proposal <ArrowRight size={15} />
          </button>
        </div>
      ) : proposals.length === 0 ? (
        <div className={`${T.card} py-14 text-center ${T.muted}`}>
          <Search size={22} className="mx-auto mb-2 opacity-60" />
          <div className="text-sm">No proposals match these filters.</div>
          <button onClick={clearFilters} className="mt-3 text-xs text-indigo-500 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {cards.map(({ p, stats, expired }, i) => {
            const cur = currencyInfo(p.currency);
            return (
              <div
                key={p.id}
                className={`${T.card} group flex flex-col animate-rise hover:-translate-y-0.5 hover:shadow-md transition`}
                style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
              >
                <button onClick={() => loadDraft(p)} className="text-left p-5 pb-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display font-bold text-base truncate">
                        {p.resellerName}
                      </div>
                      <div className={`mt-0.5 flex items-center gap-1.5 text-xs ${T.muted}`}>
                        <Building2 size={12} /> {migrateCompany(p.company, p.currency)}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        expired
                          ? "text-zinc-500 border-zinc-500/30 bg-zinc-500/10"
                          : "text-sky-500 border-sky-500/30 bg-sky-500/10"
                      }`}
                    >
                      {expired ? "Expired" : p.status || "Draft"}
                    </span>
                  </div>

                  <div className={`mt-4 grid grid-cols-3 gap-2 rounded-xl ${T.surfaceAlt} p-3`}>
                    <div>
                      <div className={`text-[10px] uppercase tracking-wider font-semibold ${T.faint}`}>Profit</div>
                      <div className={`text-sm font-bold font-mono-num truncate ${stats.profit < 0 ? "text-red-500" : ""}`}>
                        {fmtMoney(stats.profit, cur.symbol)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-[10px] uppercase tracking-wider font-semibold ${T.faint}`}>Margin</div>
                      <div className={`text-sm font-bold font-mono-num ${marginClass(stats.margin, thresholds)}`}>
                        {stats.margin === null ? "-" : fmtPct(stats.margin)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-[10px] uppercase tracking-wider font-semibold ${T.faint}`}>TLDs</div>
                      <div className="text-sm font-bold font-mono-num">{stats.tlds}</div>
                    </div>
                  </div>
                </button>

                <div className={`px-5 py-3 border-t ${T.border} flex items-center gap-2`}>
                  <span className={`flex items-center gap-1.5 text-xs ${T.muted} flex-1 min-w-0`}>
                    <CalendarDays size={12} /> Saved {fmtDate(p.updatedDate || p.createdDate)}
                    <span className="font-mono-num">· {p.currency}</span>
                  </span>
                  <button
                    onClick={() => cloneDraft(p)}
                    className={`p-1.5 rounded-lg ${T.muted} ${T.hover}`}
                    title="Duplicate as a new proposal"
                    aria-label={`Duplicate ${p.resellerName}`}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    onClick={() => deleteDraft(p.id)}
                    className={`p-1.5 rounded-lg text-red-500 ${T.hover}`}
                    title="Delete"
                    aria-label={`Delete ${p.resellerName}`}
                  >
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => loadDraft(p)} className={`${T.btn} text-xs px-2.5 py-1.5`}>
                    Open <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
