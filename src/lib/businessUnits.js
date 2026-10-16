/* ---------------------------------------------------------------------- */
/* Business units                                                          */
/* Every proposal is issued by one business unit, and the unit decides the */
/* quote currency. Cost-sheet costs in another currency (mostly USD) are   */
/* converted into it; costs already in that currency are used as they are. */
/* The unit's name is what appears on the client's PDF / Excel.            */
/* ---------------------------------------------------------------------- */

export const BUSINESS_UNITS = [
  { name: "ResellerClub Global", currency: "USD" },
  { name: "ResellerClub India", currency: "INR" },
  { name: "LogicBoxes Global", currency: "USD" },
  { name: "LogicBoxes IN", currency: "INR" },
  { name: "ResellerClub Spain", currency: "EUR" },
  { name: "ResellerClub China", currency: "CNY" },
  { name: "ResellerClub UK", currency: "GBP" },
  { name: "ResellerClub Turkey", currency: "TRY" },
  { name: "ResellerClub Indonesia", currency: "IDR" },
  { name: "ResellerClub Brazil", currency: "BRL" },
];

export const DEFAULT_UNIT = BUSINESS_UNITS[0];

// Only the currencies the business units quote in.
export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "INR", symbol: "₹" },
  { code: "EUR", symbol: "€" },
  { code: "CNY", symbol: "¥" },
  { code: "GBP", symbol: "£" },
  { code: "TRY", symbol: "₺" },
  { code: "IDR", symbol: "Rp" },
  { code: "BRL", symbol: "R$" },
];

export function unitByName(name) {
  return BUSINESS_UNITS.find((u) => u.name === name) || null;
}

/** Symbol for a currency code; drafts saved in a currency no longer offered fall back to the code. */
export function currencyInfo(code) {
  return CURRENCIES.find((c) => c.code === code) || { code, symbol: `${code} ` };
}

/**
 * Proposals saved before business units used "ResellerClub" / "LogicBoxes".
 * Map them to the matching unit by their currency (INR -> India, else
 * Global). Their saved currency is left alone so typed prices keep their
 * meaning; the editor flags any mismatch.
 */
export function migrateCompany(company, currency) {
  if (unitByName(company)) return company;
  if (company === "LogicBoxes") return currency === "INR" ? "LogicBoxes IN" : "LogicBoxes Global";
  if (company === "ResellerClub") {
    const byCurrency = BUSINESS_UNITS.find(
      (u) => u.name.startsWith("ResellerClub") && u.currency === currency,
    );
    return byCurrency ? byCurrency.name : "ResellerClub Global";
  }
  return DEFAULT_UNIT.name;
}
