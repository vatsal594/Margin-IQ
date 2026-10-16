import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Copy,
  MoreHorizontal,
  Percent,
  Plus,
  Sparkles,
  Star,
  Table2,
  Trash2,
  Upload,
} from "lucide-react";
import { HEALTH, OPERATIONS, parseMarginInput, priceForMargin } from "../lib/pricing.js";
import { fmtMoney, fmtPct } from "../lib/format.js";
import { useOutsideClose } from "../lib/useOutsideClose.js";
import { fmtSource } from "../lib/fx.js";
import FxBar from "./FxBar.jsx";

// TLD | Registration | Renewal | Transfer | Restore | menu
const GRID_COLS =
  "md:grid-cols-[minmax(120px,1fr)_repeat(4,minmax(104px,1fr))_32px]";

/* ---------------------------------------------------------------------- */
/* Toolbar                                                                 */
/* ---------------------------------------------------------------------- */

function BulkMarginButton({ T, onApply }) {
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState("20");
  const [mode, setMode] = useState("empty");
  const ref = useRef(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const apply = () => {
    const n = parseFloat(pct);
    if (!Number.isFinite(n) || n >= 100) return;
    onApply(n, mode);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${T.btn} text-xs px-3 py-1.5`}
        aria-expanded={open}
      >
        <Percent size={13} /> Set margin
      </button>
      {open && (
        <div
          className={`absolute right-0 z-30 mt-2 w-64 ${T.menu} p-3 flex flex-col gap-3 animate-rise`}
        >
          <div className="text-xs font-medium">Price everything at a margin</div>
          <label className={`flex items-center gap-2 text-xs ${T.muted}`}>
            Margin
            <input
              autoFocus
              type="number"
              min="0"
              max="99"
              step="0.5"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              className={`w-20 rounded-lg border px-2 py-1 text-sm font-mono-num ${T.input}`}
            />
            %
          </label>
          <div className="flex flex-col gap-1 text-xs">
            {[
              ["empty", "Only prices not set yet"],
              ["all", "All prices (overwrite)"],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bulk-mode"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                  className="accent-indigo-600"
                />
                {label}
              </label>
            ))}
          </div>
          <p className={`text-[11px] ${T.muted}`}>
            Uses each cost: price = cost / (1 - margin). Cells without a cost
            are skipped.
          </p>
          <button
            onClick={apply}
            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Row menu                                                                */
/* ---------------------------------------------------------------------- */

function RowMenu({ T, isFirst, isLast, onMove, onCopy, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, open, () => setOpen(false));
  const item = `w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left ${T.hover} disabled:opacity-30`;
  const run = (fn) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`p-1.5 rounded-lg ${T.muted} ${T.hover}`}
        aria-label="Row actions"
        aria-expanded={open}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-30 mt-1 w-44 ${T.menu} py-1 animate-rise`}
        >
          <button className={item} disabled={isFirst} onClick={run(() => onMove(-1))}>
            <ArrowUp size={14} /> Move up
          </button>
          <button className={item} disabled={isLast} onClick={run(() => onMove(1))}>
            <ArrowDown size={14} /> Move down
          </button>
          <button className={item} onClick={run(onCopy)}>
            <Copy size={14} /> Copy prices
          </button>
          <button className={`${item} text-red-500`} onClick={run(onDelete)}>
            <Trash2 size={14} /> Remove TLD
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* One operation cell: price, cost and margin                              */
/* ---------------------------------------------------------------------- */

function OpCell({ T, row, op, currency, onCellChange, onPriceCommit, onUseSheetCost, onPriceKeyDown }) {
  if (!row) return <div />;
  const sheet = row.sheet;
  const target = parseMarginInput(row.price);
  const preview = target !== null ? priceForMargin(row.cost, target) : null;
  const health = HEALTH[row.status];
  const negative = parseFloat(row.price) < 0 || parseFloat(row.cost) < 0;

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className={`md:hidden text-[11px] font-medium ${T.muted}`}>{op}</span>
      <input
        data-price
        type="text"
        inputMode="decimal"
        aria-label={`${row.tld || "TLD"} ${op} selling price`}
        placeholder="Price or 20%"
        title="Type a price, or a margin like 20% to calculate the price"
        value={row.price}
        onChange={(e) => onCellChange(row.id, "price", e.target.value)}
        onBlur={(e) => onPriceCommit(row.id, e.target.value)}
        onKeyDown={onPriceKeyDown}
        className={`w-full rounded-lg border px-2.5 py-2 text-sm font-medium text-right font-mono-num ${T.input} ${
          negative ? "border-red-500" : ""
        }`}
      />
      <div className={`flex items-center justify-end gap-1 text-[11px] ${T.muted}`}>
        <span>Cost</span>
        <input
          type="text"
          inputMode="decimal"
          aria-label={`${row.tld || "TLD"} ${op} cost`}
          value={row.cost}
          placeholder="0.00"
          onChange={(e) => onCellChange(row.id, "cost", e.target.value)}
          className={`w-16 bg-transparent border-b border-dashed ${T.border} text-right font-mono-num focus:outline-none focus:border-indigo-500`}
        />
        {row.costSource === "sheet" && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
            title={
              sheet?.icannIncluded
                ? `From the cost sheet, incl. ICANN fee ${fmtMoney(sheet.icann, currency.symbol)}`
                : "From the cost sheet"
            }
          />
        )}
      </div>
      {row.costSource === "sheet" && sheet?.converted && (
        <span
          className={`text-[10px] text-right font-mono-num ${T.muted}`}
          title={`Sheet cost ${fmtSource(sheet.amount, sheet.currency)} converted at ${sheet.rate.toFixed(4)} (rate + forex buffer)`}
        >
          = {fmtSource(sheet.amount, sheet.currency)} @ {sheet.rate.toFixed(2)}
        </span>
      )}
      {preview !== null ? (
        <span className="text-[11px] text-right text-indigo-500">
          = {fmtMoney(preview, currency.symbol)} at {target}%
        </span>
      ) : sheet && sheet.value === null && row.cost === "" ? (
        <span className="text-[11px] text-right text-amber-500" title="The cost sheet lists this TLD in another currency and there's no exchange rate for it yet">
          Sheet: {sheet.amount.toFixed(2)} {sheet.currency}
        </span>
      ) : sheet && sheet.value !== null && row.costSource !== "sheet" && parseFloat(row.cost) !== sheet.value ? (
        <button
          onClick={() => onUseSheetCost(row.id)}
          className="text-[11px] text-right text-indigo-500 hover:underline"
          title="Replace with the cost from the sheet"
        >
          Sheet cost {fmtMoney(sheet.value, currency.symbol)} - use
        </button>
      ) : (
        <span
          className={`self-end inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-mono-num ${health.pill}`}
          title={row.status === "empty" ? "No selling price yet" : `${health.label} - profit ${fmtMoney(row.margin, currency.symbol)}`}
        >
          {row.status === "loss" && <AlertTriangle size={10} />}
          {row.status === "empty"
            ? "-"
            : `${fmtPct(row.marginPct)} · ${fmtMoney(row.margin, currency.symbol)}`}
        </span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Grid                                                                    */
/* ---------------------------------------------------------------------- */

export default function PricingGrid(props) {
  const {
    T,
    groups,
    currency,
    costSheet,
    tldSuggestions,
    favoriteTlds,
    fileInputRef,
    onImport,
    onCopyTable,
    onFillFromSheet,
    onBulkMargin,
    onAddTld,
    onTldChange,
    onTldBlur,
    onCellChange,
    onPriceCommit,
    onUseSheetCost,
    onToggleStar,
    onMove,
    onCopyGroup,
    onDeleteGroup,
    showFx,
    fx,
    fxStatus,
    onFxOverride,
    onFxBuffer,
    onFxRefresh,
  } = props;
  const [suggestFor, setSuggestFor] = useState(null);
  const gridRef = useRef(null);

  // Enter moves to the next price cell, like a spreadsheet.
  const focusNextPrice = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const cells = [...gridRef.current.querySelectorAll("input[data-price]")];
    const next = cells[cells.indexOf(e.currentTarget) + 1];
    if (next) next.focus();
    else e.currentTarget.blur();
  };
  const focusFirstPrice = (e, groupEl) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    groupEl?.querySelector("input[data-price]")?.focus();
  };

  return (
    <div className={`${T.card} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="font-display font-bold text-base">TLD pricing</div>
          <div className={`text-[11px] ${T.muted}`}>
            Type a price, or a margin like <span className="font-mono-num">20%</span>{" "}
            to work out the price. Leave an operation blank to leave it out of
            the quote.
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${T.btn} text-xs px-3 py-1.5`}
          >
            <Upload size={13} /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={onImport}
          />
          {costSheet && (
            <button
              onClick={onFillFromSheet}
              title="Fill empty costs from the registry cost sheet"
              className={`${T.btn} text-xs px-3 py-1.5`}
            >
              <Table2 size={13} /> Fill costs
            </button>
          )}
          <BulkMarginButton T={T} onApply={onBulkMargin} />
          <button
            onClick={onCopyTable}
            className={`${T.btn} hidden sm:inline-flex text-xs px-3 py-1.5`}
          >
            <Copy size={13} /> Copy table
          </button>
        </div>
      </div>

      {showFx && (
        <FxBar
          T={T}
          fx={fx}
          currency={currency}
          status={fxStatus}
          onOverride={onFxOverride}
          onBuffer={onFxBuffer}
          onRefresh={onFxRefresh}
        />
      )}

      {groups.length === 0 ? (
        <div className={`text-center py-14 ${T.muted}`}>
          <Sparkles size={22} className="mx-auto mb-2 opacity-50" />
          <div className="text-sm mb-3">No TLDs yet - add your first one to start pricing.</div>
          <button
            onClick={() => onAddTld()}
            className={`${T.btnPrimary} text-sm px-4 py-2`}
          >
            <Plus size={15} /> Add TLD
          </button>
        </div>
      ) : (
        <div ref={gridRef}>
          <div
            className={`hidden md:grid ${GRID_COLS} gap-3 px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-semibold ${T.faint} ${T.surfaceAlt}`}
          >
            <div>TLD</div>
            {OPERATIONS.map((op) => (
              <div key={op} className="text-right">
                {op}
              </div>
            ))}
            <div />
          </div>

          {groups.map((g, i) => {
            const matches = tldSuggestions
              .filter((s) => g.tld && s.startsWith(g.tld.toLowerCase()) && s !== g.tld.toLowerCase())
              .slice(0, 6);
            const notInSheet = costSheet && g.tld.trim() && !g.rows.some((r) => r.sheet);
            return (
              <div
                key={g.id}
                data-group={g.id}
                className={`relative grid grid-cols-2 ${GRID_COLS} gap-x-3 gap-y-3 px-3 py-3.5 border-b ${T.border} last:border-0 rounded-lg transition-colors ${
                  T.isDark ? "hover:bg-zinc-800/30" : "hover:bg-zinc-50"
                }`}
              >
                <div className="col-span-2 md:col-span-1 flex items-start gap-2 pr-10 md:pr-0">
                  <button
                    onClick={() => onToggleStar(g.id)}
                    className="mt-2"
                    title={g.starred ? "Remove from quick add" : "Add to quick add"}
                    aria-label={g.starred ? "Unstar TLD" : "Star TLD"}
                  >
                    <Star
                      size={14}
                      className={g.starred ? "fill-amber-400 text-amber-400" : T.muted}
                    />
                  </button>
                  <div className="relative flex-1 min-w-0">
                    <input
                      aria-label="TLD"
                      className={`w-full rounded-lg border px-2.5 py-2 text-sm font-semibold ${T.input}`}
                      value={g.tld}
                      placeholder=".com"
                      onChange={(e) => onTldChange(g.id, e.target.value)}
                      onFocus={() => setSuggestFor(g.id)}
                      onBlur={() => {
                        onTldBlur(g.id);
                        setTimeout(() => setSuggestFor(null), 150);
                      }}
                      onKeyDown={(e) => focusFirstPrice(e, e.currentTarget.closest("[data-group]"))}
                    />
                    {suggestFor === g.id && matches.length > 0 && (
                      <div
                        className={`absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border ${T.border} ${T.surface} shadow-lg`}
                      >
                        {matches.map((s) => (
                          <button
                            key={s}
                            onMouseDown={() => onTldChange(g.id, s)}
                            className={`w-full text-left px-3 py-1.5 text-xs font-mono-num ${T.hover}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {notInSheet && (
                      <div className="mt-1 text-[11px] text-slate-400">Not in cost sheet</div>
                    )}
                  </div>
                </div>

                {OPERATIONS.map((op) => (
                  <OpCell
                    key={op}
                    T={T}
                    op={op}
                    row={g.byOp[op]}
                    currency={currency}
                    onCellChange={onCellChange}
                    onPriceCommit={onPriceCommit}
                    onUseSheetCost={onUseSheetCost}
                    onPriceKeyDown={focusNextPrice}
                  />
                ))}

                <div className="absolute top-3 right-2 md:static md:flex md:justify-end">
                  <RowMenu
                    T={T}
                    isFirst={i === 0}
                    isLast={i === groups.length - 1}
                    onMove={(dir) => onMove(g.id, dir)}
                    onCopy={() => onCopyGroup(g.id)}
                    onDelete={() => onDeleteGroup(g.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {groups.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={() => onAddTld()}
            className={`${T.btnPrimary} text-sm px-3.5 py-2`}
          >
            <Plus size={14} /> Add TLD
          </button>
          {favoriteTlds.length > 0 && (
            <>
              <span className={`text-[11px] ${T.muted} flex items-center gap-1 ml-1`}>
                <Star size={11} className="fill-amber-400 text-amber-400" /> Quick add:
              </span>
              {favoriteTlds.map((tld) => (
                <button
                  key={tld}
                  onClick={() => onAddTld(tld)}
                  className={`text-[11px] px-2 py-1 rounded-full border font-mono-num ${T.border} ${T.hover}`}
                >
                  {tld}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
