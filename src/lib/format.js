/* Formatting and date helpers shared across views. */

export function fmtMoney(n, symbol) {
  const num = typeof n === "number" ? n : parseFloat(n);
  const v = Number.isFinite(num) ? num : 0;
  return `${symbol}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPct(n) {
  return `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
}

export function fmtDateTime(ms) {
  return new Date(ms).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

// "3 min ago", "2 h ago", or a date for anything older than a day.
export function fmtAgo(iso, now) {
  if (!iso) return "";
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return fmtDate(iso);
}

export function parseDurationDays(str) {
  if (!str) return null;
  const m = String(str).match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

export function addDaysISO(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function diffDaysISO(startStr, endStr) {
  const s = new Date(`${startStr}T00:00:00`);
  const e = new Date(`${endStr}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return Math.round((e - s) / 86400000);
}
