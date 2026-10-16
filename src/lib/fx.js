/* ---------------------------------------------------------------------- */
/* Forex                                                                   */
/* Converts cost-sheet costs (mostly USD) into the proposal's currency.    */
/* Each proposal keeps its own `fx` so a saved quote doesn't drift when    */
/* rates move:                                                             */
/*   usd       USD -> currency table (ECB reference rates), or null        */
/*   date      the rates' date                                             */
/*   override  your own rate for 1 USD in the proposal currency, or null   */
/*   bufferPct added on top of the rate to protect margins (default 2%)    */
/* Only currency codes go to the rate service - never prices or costs.     */
/* ---------------------------------------------------------------------- */

export const FX_SOURCE = "European Central Bank";
const FX_URL = "https://api.frankfurter.dev/v1/latest?base=USD";

export const DEFAULT_FX_BUFFER = 2;

export function defaultFx() {
  return { usd: null, date: null, override: null, bufferPct: DEFAULT_FX_BUFFER };
}

export async function fetchUsdRates() {
  const res = await fetch(FX_URL);
  if (!res.ok) throw new Error(`rate service replied ${res.status}`);
  const data = await res.json();
  if (!data?.rates) throw new Error("unexpected response from rate service");
  return { usd: { ...data.rates, USD: 1 }, date: data.date };
}

/** Plain rate for 1 USD in `currency` (your override if set), or null. */
export function usdRate(fx, currency) {
  if (currency === "USD") return 1;
  const r = fx?.override ?? fx?.usd?.[currency];
  return r > 0 ? r : null;
}

/**
 * Rate used to turn a cost in `from` into `to`, including the buffer.
 * null when there's no rate for that pair.
 */
export function conversionRate(fx, from, to) {
  if (from === to) return 1;
  const toRate = usdRate(fx, to);
  const fromRate = from === "USD" ? 1 : fx?.usd?.[from];
  if (!(toRate > 0) || !(fromRate > 0)) return null;
  const buffer = 1 + (Number(fx?.bufferPct) || 0) / 100;
  return (toRate / fromRate) * buffer;
}

/**
 * Plain rate (no buffer) to turn an amount in `from` into `to`, or null.
 * Used for selling prices when a proposal changes currency: `from` honours
 * your own rate (it was set for that currency), `to` uses the ECB rate.
 */
export function plainRate(fx, from, to) {
  if (from === to) return 1;
  const fromRate = usdRate(fx, from);
  const toRate = to === "USD" ? 1 : fx?.usd?.[to];
  if (!(toRate > 0) || !(fromRate > 0)) return null;
  return toRate / fromRate;
}

export function convertAmount(fx, amount, from, to) {
  const rate = conversionRate(fx, from, to);
  return rate === null ? null : Math.round(amount * rate * 100) / 100;
}

/** "$10.46" for USD, "500.00 INR" otherwise. */
export function fmtSource(amount, currency) {
  const n = Number(amount).toFixed(2);
  return currency === "USD" ? `$${n}` : `${n} ${currency}`;
}
