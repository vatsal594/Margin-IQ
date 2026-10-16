/* ---------------------------------------------------------------------- */
/* Pricing model                                                           */
/* A proposal is a flat list of rows, one per TLD + operation. The editor  */
/* shows them grouped: each TLD is one line with a cell per operation, and */
/* rows of the same TLD share a `group` id.                                */
/* ---------------------------------------------------------------------- */

import { lookupTld, sheetCost } from "./costSheet.js";
import { conversionRate } from "./fx.js";

export const OPERATIONS = ["Registration", "Renewal", "Transfer", "Restore"];

export const DEFAULT_THRESHOLDS = { low: 15, excellent: 35 };

export const HEALTH = {
  excellent: {
    label: "Excellent",
    pill: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25",
    bar: "bg-emerald-500",
  },
  good: {
    label: "Healthy",
    pill: "text-sky-500 bg-sky-500/10 border-sky-500/25",
    bar: "bg-sky-500",
  },
  low: {
    label: "Low",
    pill: "text-amber-500 bg-amber-500/10 border-amber-500/25",
    bar: "bg-amber-500",
  },
  loss: {
    label: "Loss",
    pill: "text-red-500 bg-red-500/10 border-red-500/25",
    bar: "bg-red-500",
  },
  empty: {
    label: "No price",
    pill: "text-slate-400 bg-slate-500/5 border-slate-500/20",
    bar: "bg-slate-400",
  },
};

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyRow(tld = "") {
  return {
    id: uid("row"),
    group: null,
    tld,
    operation: "Registration",
    cost: "",
    costSource: null, // "sheet" when filled from the cost sheet, else null
    price: "",
    starred: false,
  };
}

/**
 * The sheet cost for a row in the proposal currency: as-is when the
 * currencies match, converted with the proposal's forex rate otherwise.
 * null when the TLD isn't in the sheet or there's no rate for it.
 */
export function sheetCostIn(row, sheet, currency, fx) {
  const c = sheetCost(lookupTld(sheet, row.tld), row.operation);
  if (!c) return null;
  if (c.currency === currency) return { ...c, converted: false, value: c.amount, rate: 1 };
  const rate = conversionRate(fx, c.currency, currency);
  if (rate === null) return { ...c, converted: false, value: null, rate: null };
  return { ...c, converted: true, value: Math.round(c.amount * rate * 100) / 100, rate };
}

// Fills a row's cost from the registry cost sheet when its cost is empty or
// was itself filled from the sheet - a cost the user typed is never touched.
// Costs in another currency are converted with the proposal's forex rate.
export function applySheetCost(row, sheet, currency, fx) {
  if (row.cost !== "" && row.costSource !== "sheet") return row;
  const c = sheetCostIn(row, sheet, currency, fx);
  if (c && c.value !== null) {
    return { ...row, cost: String(c.value), costSource: "sheet" };
  }
  if (row.costSource === "sheet") return { ...row, cost: "", costSource: null };
  return row;
}

export function calcRow(row, thresholds) {
  // No selling price yet (or a "20%" target still being typed) - don't judge
  // the row's margin health.
  const raw = String(row.price).trim();
  if (raw === "" || raw.includes("%")) {
    return { margin: 0, marginPct: 0, status: "empty" };
  }
  const cost = parseFloat(row.cost) || 0;
  const price = parseFloat(row.price) || 0;
  const margin = price - cost;
  const marginPct = price > 0 ? (margin / price) * 100 : cost > 0 ? -100 : 0;
  let status = "excellent";
  if (margin < 0) status = "loss";
  else if (marginPct < thresholds.low) status = "low";
  else if (marginPct < thresholds.excellent) status = "good";
  return { margin, marginPct, status };
}

/** Selling price that gives `pct`% margin on `cost` (margin = profit / price). */
export function priceForMargin(cost, pct) {
  const c = parseFloat(cost);
  if (!(c > 0) || !Number.isFinite(pct) || pct >= 100) return null;
  return Math.round((c / (1 - pct / 100)) * 100) / 100;
}

/** "20%" or "20 %" -> 20; anything else -> null. */
export function parseMarginInput(value) {
  const m = String(value).trim().match(/^(-?\d+(?:\.\d+)?)\s*%$/);
  return m ? parseFloat(m[1]) : null;
}

/** A typed selling price as a number; null when empty or a "20%" target. */
export function parsePrice(value) {
  const raw = String(value ?? "").trim();
  if (raw === "" || raw.includes("%")) return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

/** The four rows (one per operation) for a newly added TLD. */
export function newTldRows(tld, sheet, currency, fx) {
  const group = uid("tld");
  return OPERATIONS.map((operation) =>
    applySheetCost({ ...emptyRow(tld), operation, group }, sheet, currency, fx),
  );
}

/** Rows grouped by TLD, in the order the TLDs first appear. */
export function groupRows(rows) {
  const map = new Map();
  for (const r of rows) {
    let g = map.get(r.group);
    if (!g) {
      g = { id: r.group, tld: r.tld, starred: false, rows: [], byOp: {} };
      map.set(r.group, g);
    }
    g.rows.push(r);
    if (!g.byOp[r.operation]) g.byOp[r.operation] = r;
    if (r.starred) g.starred = true;
  }
  return Array.from(map.values());
}

/**
 * Older drafts and spreadsheet imports store one row per operation with no
 * group. Give every row a group (one per TLD) and make sure each group has a
 * row for all four operations, so the grid can show every cell.
 */
export function ensureGroups(rows, sheet, currency, fx) {
  const keyToGroup = new Map();
  const grouped = rows.map((r) => {
    if (r.group) return r;
    const key = r.tld.trim().toLowerCase() || r.id;
    if (!keyToGroup.has(key)) keyToGroup.set(key, uid("tld"));
    return { ...r, group: keyToGroup.get(key) };
  });
  const out = [];
  for (const g of groupRows(grouped)) {
    out.push(...g.rows);
    for (const operation of OPERATIONS) {
      if (!g.byOp[operation]) {
        out.push(
          applySheetCost(
            { ...emptyRow(g.tld), operation, group: g.id, starred: g.starred },
            sheet,
            currency,
            fx,
          ),
        );
      }
    }
  }
  return out;
}
