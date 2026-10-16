/* ---------------------------------------------------------------------- */
/* Registry cost sheet                                                     */
/* Parses the product team's "Orderbox TLD Registry Pricing Data" workbook */
/* into a TLD -> cost lookup. The sheet holds internal registry costs, so  */
/* it is only ever loaded from a file the user picks and kept in their     */
/* browser - never bundled with the app or committed to the repo.          */
/* ---------------------------------------------------------------------- */

// Header text in the sheet -> field name. Matched loosely (case and
// whitespace-insensitive, by prefix) so small header edits don't break it.
const COLUMNS = {
  tld: ["tld"],
  productKey: ["product key"],
  currency: ["currency"],
  icann: ["icann fee"],
  registration: ["registration fee"],
  renewal: ["renew fee"],
  transfer: ["transfer fee"],
  restore: ["total restore fee"],
};

const normHeader = (h) =>
  String(h ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// "com", ".com", " .COM ", ".id (second level)" -> "com" / "id"
export function normalizeTld(tld) {
  return String(tld ?? "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/^\.+/, "");
}

// Cells mix numbers with text like "$76.00 " or "1,300".
function parseMoney(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const cleaned = String(v ?? "").replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const headers = rows[i].map(normHeader);
    const index = {};
    for (const [field, prefixes] of Object.entries(COLUMNS)) {
      const col = headers.findIndex((h) =>
        prefixes.some((p) => h === p || h.startsWith(p)),
      );
      if (col !== -1) index[field] = col;
    }
    if (index.tld !== undefined && index.registration !== undefined) {
      return { headerRow: i, index };
    }
  }
  return null;
}

/**
 * Parse the workbook (an ArrayBuffer) with the given SheetJS module.
 * Reads the first *visible* sheet that has TLD + Registration Fee columns;
 * hidden helper sheets in the workbook are ignored.
 */
export function parseCostSheet(buffer, XLSX, sourceName = "") {
  const wb = XLSX.read(buffer, { type: "array" });
  const meta = wb.Workbook?.Sheets || [];
  const visible = wb.SheetNames.filter((_, i) => !meta[i]?.Hidden);

  for (const sheetName of visible) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: true,
    });
    const found = findHeaderRow(rows);
    if (!found) continue;

    const { headerRow, index } = found;
    const entries = {};
    const conflicts = new Set();
    const currencies = {};
    let skipped = 0;

    for (const r of rows.slice(headerRow + 1)) {
      const rawTld = String(r[index.tld] ?? "").trim();
      const key = normalizeTld(rawTld);
      if (!key) continue;
      const entry = {
        tld: rawTld,
        productKey: String(r[index.productKey] ?? "").trim(),
        currency: String(r[index.currency] ?? "").trim().toUpperCase() || "USD",
        icann: parseMoney(r[index.icann]) ?? 0,
        registration: parseMoney(r[index.registration]),
        renewal: parseMoney(r[index.renewal]),
        transfer: parseMoney(r[index.transfer]),
        restore: parseMoney(r[index.restore]),
      };
      if (
        entry.registration === null &&
        entry.renewal === null &&
        entry.transfer === null &&
        entry.restore === null
      ) {
        skipped++;
        continue;
      }
      const existing = entries[key];
      if (existing) {
        conflicts.add(key);
        // The sheet lists some TLDs twice (e.g. "in" and ".in"). Prefer the
        // row whose product key is the canonical "dot<tld>".
        const canonical = `dot${key.replace(/\./g, "")}`;
        if (existing.productKey === canonical) continue;
        if (entry.productKey !== canonical) continue;
        currencies[existing.currency]--;
      }
      entries[key] = entry;
      currencies[entry.currency] = (currencies[entry.currency] || 0) + 1;
    }

    const count = Object.keys(entries).length;
    if (count === 0) continue;
    return {
      entries,
      count,
      skipped,
      conflicts: Array.from(conflicts),
      currencies,
      sheetName,
      sourceName,
      loadedAt: new Date().toISOString(),
    };
  }
  throw new Error(
    "Couldn't find a sheet with 'tld' and 'Registration Fee' columns",
  );
}

export function lookupTld(sheet, tld) {
  if (!sheet) return null;
  const key = normalizeTld(tld);
  return key ? sheet.entries[key] || null : null;
}

const OP_FIELD = {
  Registration: "registration",
  Renewal: "renewal",
  Transfer: "transfer",
  Restore: "restore",
};

/**
 * Cost for one TLD + operation, in the sheet's currency:
 * fee + ICANN fee. The sheet gives the ICANN fee in USD, so it's only added
 * to USD costs (`icannIncluded` says whether it was).
 */
export function sheetCost(entry, operation) {
  if (!entry) return null;
  const base = entry[OP_FIELD[operation]];
  if (base === null || base === undefined) return null;
  const icannIncluded = entry.currency === "USD" && entry.icann > 0;
  const amount = base + (icannIncluded ? entry.icann : 0);
  return {
    amount: Math.round(amount * 100) / 100,
    currency: entry.currency,
    icann: entry.icann,
    icannIncluded,
  };
}

/** Sheet TLDs formatted for the TLD autocomplete (".com", ".co.uk"...). */
export function sheetTldSuggestions(sheet) {
  if (!sheet) return [];
  return Object.keys(sheet.entries)
    .map((k) => `.${k}`)
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
}
