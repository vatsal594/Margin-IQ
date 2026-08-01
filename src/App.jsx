import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Moon,
  Sun,
  Plus,
  Trash2,
  Copy,
  CopyPlus,
  FileSpreadsheet,
  FileText,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Star,
  X,
  Search,
  Command,
  Undo2,
  Redo2,
  AlertTriangle,
  CheckCircle2,
  Save,
  FilePlus2,
  Clock,
  Mail,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Upload,
  User,
  Building2,
  ChevronRight,
  Trash,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";

function LogoMark({ size = 36, className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="marginiq-logo-bg"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#marginiq-logo-bg)" />
      <path
        d="M7 22 L11.5 10 L16 17 L21 8 L25 22"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="8" r="2.4" fill="#34d399" />
    </svg>
  );
}

function GithubGlyph({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56l-.01-2.2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.08.78 2.17l-.01 3.22c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinGlyph({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function InstagramGlyph({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 6.18a2.43 2.43 0 1 1 0-4.86 2.43 2.43 0 0 1 0 4.86Zm4.8-6.34a.88.88 0 1 1-1.75 0 .88.88 0 0 1 1.75 0ZM21 7.6c-.06-1.24-.34-2.34-1.24-3.24-.9-.9-2-1.18-3.24-1.24C15.24 3.06 8.76 3.06 7.48 3.12 6.24 3.18 5.14 3.46 4.24 4.36c-.9.9-1.18 2-1.24 3.24C2.94 8.76 2.94 15.24 3 16.52c.06 1.24.34 2.34 1.24 3.24.9.9 2 1.18 3.24 1.24 1.28.06 7.76.06 9.04 0 1.24-.06 2.34-.34 3.24-1.24.9-.9 1.18-2 1.24-3.24.06-1.28.06-7.76 0-9.04v.36Zm-2.25 10.88c-.27.68-.79 1.2-1.47 1.47-1.02.4-3.44.31-4.28.31s-3.27.09-4.28-.31a2.58 2.58 0 0 1-1.47-1.47c-.4-1.02-.31-3.44-.31-4.28s-.09-3.27.31-4.28c.27-.68.79-1.2 1.47-1.47 1.02-.4 3.44-.31 4.28-.31s3.27-.09 4.28.31c.68.27 1.2.79 1.47 1.47.4 1.02.31 3.44.31 4.28s.09 3.27-.31 4.28Z" />
    </svg>
  );
}

function WhatsappGlyph({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.02 2C6.5 2 2.03 6.48 2.03 12c0 1.77.46 3.45 1.27 4.92L2 22l5.2-1.36A9.94 9.94 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.06c-1.6 0-3.13-.43-4.46-1.24l-.32-.19-3.09.81.83-3-.21-.32A8.03 8.03 0 0 1 3.98 12c0-4.43 3.6-8.02 8.04-8.02 4.44 0 8.03 3.6 8.03 8.02 0 4.43-3.6 8.06-8.03 8.06Zm4.4-6.02c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Storage adapter                                                         */
/* `window.storage` (get/set/delete/list) only exists inside Claude's      */
/* artifact sandbox. Running as a standalone app, we back the same shape   */
/* with localStorage so Save Draft / History / Autosave actually persist.  */
/* ---------------------------------------------------------------------- */
const LS_PREFIX = "pricing-app:";
const storage = {
  async get(key) {
    try {
      const v = window.localStorage.getItem(LS_PREFIX + key);
      return v === null ? null : { key, value: v };
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      window.localStorage.setItem(LS_PREFIX + key, value);
      return { key, value };
    } catch {
      return null;
    }
  },
  async delete(key) {
    try {
      window.localStorage.removeItem(LS_PREFIX + key);
      return { key, deleted: true };
    } catch {
      return null;
    }
  },
};

/* ---------------------------------------------------------------------- */
/* Constants                                                               */
/* ---------------------------------------------------------------------- */

const TLD_SUGGESTIONS = [
  ".com",
  ".net",
  ".org",
  ".io",
  ".co",
  ".co.uk",
  ".co.in",
  ".com.au",
  ".in",
  ".us",
  ".info",
  ".biz",
  ".xyz",
  ".online",
  ".store",
  ".tech",
  ".ai",
  ".dev",
  ".app",
  ".shop",
  ".cloud",
  ".me",
  ".uk",
  ".ca",
  ".de",
  ".fr",
  ".es",
  ".nl",
];

const OPERATIONS = ["Registration", "Renewal", "Transfer", "Restore"];

// The two brands proposals can be issued under. Only these two are valid -
// whichever is selected on a proposal is what appears on its client-facing
// PDF/Excel (header, footer, filenames).
const BRANDS = ["ResellerClub", "LogicBoxes"];

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "AED", symbol: "AED " },
  { code: "SAR", symbol: "SAR " },
  { code: "QAR", symbol: "QAR " },
  { code: "KWD", symbol: "KWD " },
  { code: "BHD", symbol: "BHD " },
  { code: "OMR", symbol: "OMR " },
  { code: "JPY", symbol: "¥" },
  { code: "CNY", symbol: "¥" },
  { code: "HKD", symbol: "HK$" },
  { code: "SGD", symbol: "S$" },
  { code: "NZD", symbol: "NZ$" },
  { code: "CHF", symbol: "CHF " },
  { code: "SEK", symbol: "kr" },
  { code: "NOK", symbol: "kr" },
  { code: "DKK", symbol: "kr" },
  { code: "PLN", symbol: "zł" },
  { code: "CZK", symbol: "Kč" },
  { code: "HUF", symbol: "Ft" },
  { code: "RON", symbol: "lei" },
  { code: "TRY", symbol: "₺" },
  { code: "ZAR", symbol: "R" },
  { code: "NGN", symbol: "₦" },
  { code: "KES", symbol: "KSh" },
  { code: "EGP", symbol: "EGP " },
  { code: "BRL", symbol: "R$" },
  { code: "MXN", symbol: "MX$" },
  { code: "ARS", symbol: "AR$" },
  { code: "CLP", symbol: "CLP$" },
  { code: "COP", symbol: "COP$" },
  { code: "PHP", symbol: "₱" },
  { code: "IDR", symbol: "Rp" },
  { code: "MYR", symbol: "RM" },
  { code: "THB", symbol: "฿" },
  { code: "VND", symbol: "₫" },
  { code: "PKR", symbol: "₨" },
  { code: "BDT", symbol: "৳" },
  { code: "LKR", symbol: "Rs " },
  { code: "KRW", symbol: "₩" },
  { code: "TWD", symbol: "NT$" },
  { code: "ILS", symbol: "₪" },
];

const DEFAULT_THRESHOLDS = { low: 15, excellent: 35 };

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyRow(tld = "") {
  return {
    id: uid("row"),
    tld,
    operation: "Registration",
    cost: "",
    price: "",
    starred: false,
  };
}

function emptyProposal() {
  return {
    resellerName: "",
    currency: "USD",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    offerDuration: "30 days",
    notes: "",
    preparedBy: "",
    company: BRANDS[0],
  };
}

function calcRow(row, thresholds) {
  const cost = parseFloat(row.cost) || 0;
  const price = parseFloat(row.price) || 0;
  const margin = price - cost;
  const marginPct = price > 0 ? (margin / price) * 100 : cost > 0 ? -100 : 0;
  let status = "excellent";
  if (price > 0 && margin < 0) status = "loss";
  else if (marginPct < thresholds.low) status = "low";
  else if (marginPct < thresholds.excellent) status = "good";
  return { margin, marginPct, status };
}

function parseDurationDays(str) {
  if (!str) return null;
  const m = String(str).match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function addDaysISO(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDaysISO(startStr, endStr) {
  const s = new Date(`${startStr}T00:00:00`);
  const e = new Date(`${endStr}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return Math.round((e - s) / 86400000);
}

function fmtMoney(n, symbol) {
  const num = typeof n === "number" ? n : parseFloat(n);
  const v = Number.isFinite(num) ? num : 0;
  return `${symbol}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
  "from-fuchsia-400 to-purple-600",
];

function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarGradient(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function fmtDate(d) {
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

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ---------------------------------------------------------------------- */

function HealthRing({ pct, status, size = 30 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = 11;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const color =
    status === "loss"
      ? "#ef4444"
      : status === "low"
        ? "#f59e0b"
        : status === "good"
          ? "#38bdf8"
          : "#10b981";
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" className="shrink-0">
      <circle
        cx="15"
        cy="15"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="3.5"
      />
      <circle
        cx="15"
        cy="15"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 15 15)"
        style={{
          transition: "stroke-dashoffset 400ms ease, stroke 400ms ease",
        }}
      />
    </svg>
  );
}

function Toast({ toasts, onDismiss, isDark }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,90vw)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur text-sm flex items-start gap-2 animate-[toastIn_.25s_ease]
          ${
            t.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-500"
              : t.type === "warn"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
          }`}
        >
          {t.type === "error" ? (
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          )}
          <span
            className={`flex-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}
          >
            {t.msg}
          </span>
          <button
            onClick={() => onDismiss(t.id)}
            className="opacity-50 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Modal({ open, onClose, children, width = "max-w-md", isDark }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-[fadeIn_.15s_ease]"
      onClick={onClose}
    >
      <div
        className={`w-full ${width} rounded-2xl border shadow-2xl overflow-hidden animate-[modalIn_.18s_ease] ${
          isDark
            ? "border-slate-800 bg-slate-900 text-slate-100"
            : "border-slate-200 bg-white text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main App                                                                */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState("editor"); // editor | history | settings
  const [proposal, setProposal] = useState(emptyProposal());
  const [rows, setRows] = useState([emptyRow(".com"), emptyRow(".net")]);
  const [draftId, setDraftId] = useState(() => uid("proposal"));
  const [proposals, setProposals] = useState([]);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const [toasts, setToasts] = useState([]);
  const [dupModal, setDupModal] = useState(null); // {rowId, value, existingId}
  const [confirmModal, setConfirmModal] = useState(null); // {title, body, onConfirm}
  const [importReport, setImportReport] = useState(null); // {imported, skipped: [], warnings: []}
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [autosaveBanner, setAutosaveBanner] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [simRowId, setSimRowId] = useState(null);
  const [autocompleteRow, setAutocompleteRow] = useState(null);
  const fileInputRef = useRef(null);
  const autosaveTimer = useRef(null);
  const skipHistoryPush = useRef(false);

  const currency =
    CURRENCIES.find((c) => c.code === proposal.currency) || CURRENCIES[0];

  /* ------------------------- storage bootstrap ------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("proposals", false);
        if (res && res.value) setProposals(JSON.parse(res.value));
      } catch {
        /* no saved proposals yet */
      }
      try {
        const auto = await storage.get("autosave", false);
        if (auto && auto.value) {
          const parsed = JSON.parse(auto.value);
          if (
            parsed &&
            (parsed.proposal?.resellerName ||
              (parsed.rows || []).some((r) => r.tld))
          ) {
            setAutosaveBanner(parsed);
          }
        }
      } catch {
        /* nothing to restore */
      }
      try {
        // Remembers whoever last typed their name into "Prepared by" on
        // this browser - purely local, never a hardcoded/shipped default,
        // so a fresh install or a different person's browser starts blank.
        const lastName = await storage.get("lastPreparedBy", false);
        if (lastName && lastName.value) {
          setProposal((p) =>
            p.preparedBy ? p : { ...p, preparedBy: lastName.value },
          );
        }
      } catch {
        /* no remembered name yet */
      }
    })();
  }, []);

  const pushToast = useCallback((msg, type = "success") => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  /* ------------------------------ undo/redo ----------------------------- */
  const commitRows = useCallback((updater) => {
    setRows((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!skipHistoryPush.current) {
        setPast((p) => [...p.slice(-29), prev]);
        setFuture([]);
      }
      skipHistoryPush.current = false;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prevState = p[p.length - 1];
      setFuture((f) => [rows, ...f]);
      skipHistoryPush.current = true;
      setRows(prevState);
      return p.slice(0, -1);
    });
  }, [rows]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const nextState = f[0];
      setPast((p) => [...p, rows]);
      skipHistoryPush.current = true;
      setRows(nextState);
      return f.slice(1);
    });
  }, [rows]);

  /* -------------------------------- autosave ----------------------------- */
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      try {
        await storage.set(
          "autosave",
          JSON.stringify({ proposal, rows, ts: Date.now() }),
          false,
        );
      } catch {
        /* best effort */
      }
      if (proposal.preparedBy?.trim()) {
        try {
          await storage.set("lastPreparedBy", proposal.preparedBy, false);
        } catch {
          /* best effort */
        }
      }
    }, 1500);
    return () => clearTimeout(autosaveTimer.current);
  }, [proposal, rows]);

  const restoreAutosave = () => {
    setProposal(autosaveBanner.proposal);
    setRows(autosaveBanner.rows);
    setAutosaveBanner(false);
    pushToast("Restored your last unsaved session");
  };

  /* -------------------------------- row ops ------------------------------ */
  const addRow = (tld = "") => {
    commitRows((r) => [...r, emptyRow(tld)]);
  };

  const findDuplicate = (tld, excludeId) =>
    rows.find(
      (r) =>
        r.id !== excludeId &&
        r.tld.trim().toLowerCase() === tld.trim().toLowerCase() &&
        r.tld.trim() !== "",
    );

  const updateRow = (id, field, value) => {
    commitRows((r) =>
      r.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleTldBlur = (id, value) => {
    if (!value.trim()) return;
    const dup = findDuplicate(value, id);
    if (dup) setDupModal({ rowId: id, value, existingId: dup.id });
  };

  const deleteRow = (id) => {
    commitRows((r) => r.filter((row) => row.id !== id));
    pushToast("Row removed - Ctrl+Z to undo");
  };

  const duplicateRow = (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    commitRows((r) => {
      const idx = r.findIndex((x) => x.id === id);
      const copy = { ...row, id: uid("row") };
      const next = [...r];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const moveRow = (id, dir) => {
    commitRows((r) => {
      const idx = r.findIndex((x) => x.id === id);
      const swapWith = idx + dir;
      if (swapWith < 0 || swapWith >= r.length) return r;
      const next = [...r];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };

  const toggleStar = (id) => {
    commitRows((r) =>
      r.map((row) => (row.id === id ? { ...row, starred: !row.starred } : row)),
    );
  };

  const copyRow = async (row) => {
    const text = `${row.tld}\t${row.operation}\t${fmtMoney(parseFloat(row.price) || 0, currency.symbol)}`;
    try {
      await navigator.clipboard.writeText(text);
      pushToast(`Copied ${row.tld} (${row.operation})`);
    } catch {
      pushToast(
        "Couldn't copy - your browser blocked clipboard access",
        "error",
      );
    }
  };

  const favoriteTlds = useMemo(
    () => rows.filter((r) => r.starred && r.tld).map((r) => r.tld),
    [rows],
  );

  /* ------------------------------- summary -------------------------------- */
  const computed = useMemo(
    () => rows.map((r) => ({ ...r, ...calcRow(r, thresholds) })),
    [rows, thresholds],
  );

  const summary = useMemo(() => {
    const withPrice = computed.filter((r) => r.tld.trim() !== "");
    const count = withPrice.length;
    const totalMargin = withPrice.reduce((s, r) => s + r.margin, 0);
    const totalRevenue = withPrice.reduce(
      (s, r) => s + (parseFloat(r.price) || 0),
      0,
    );
    const margins = withPrice.map((r) => r.margin);
    const marginPcts = withPrice.map((r) => r.marginPct);
    const avgMargin = count ? totalMargin / count : 0;
    const avgMarginPct = count
      ? marginPcts.reduce((a, b) => a + b, 0) / count
      : 0;
    const lowest = count ? Math.min(...margins) : 0;
    const highest = count ? Math.max(...margins) : 0;
    const negativeCount = withPrice.filter((r) => r.status === "loss").length;
    return {
      count,
      totalMargin,
      totalRevenue,
      avgMargin,
      avgMarginPct,
      lowest,
      highest,
      negativeCount,
    };
  }, [computed]);

  /* --------------------------------- pivot --------------------------------- */
  function pivotByTld() {
    const map = new Map();
    computed.forEach((r) => {
      if (!r.tld.trim()) return;
      if (!map.has(r.tld))
        map.set(r.tld, {
          tld: r.tld,
          Registration: "",
          Renewal: "",
          Transfer: "",
          Restore: "",
        });
      map.get(r.tld)[r.operation] = r.price;
    });
    return Array.from(map.values());
  }

  /* --------------------------------- actions -------------------------------- */
  const newProposal = () => {
    setConfirmModal({
      title: "Start a new proposal?",
      body: "Unsaved changes to the current proposal will be lost unless you've saved it as a draft.",
      confirmLabel: "Start new",
      onConfirm: () => {
        setProposal((p) => ({ ...emptyProposal(), preparedBy: p.preparedBy }));
        setRows([emptyRow(".com")]);
        setDraftId(uid("proposal"));
        setPast([]);
        setFuture([]);
        setConfirmModal(null);
        setView("editor");
        pushToast("New proposal started");
      },
    });
  };

  const saveDraft = async () => {
    if (!proposal.resellerName.trim()) {
      pushToast("Add a reseller name before saving", "warn");
      return;
    }
    const existing = proposals.find((p) => p.id === draftId);
    const entry = {
      id: draftId,
      resellerName: proposal.resellerName,
      company: proposal.company,
      currency: proposal.currency,
      createdDate: existing?.createdDate || new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      status: "Draft",
      data: { proposal, rows },
    };
    const next = [entry, ...proposals.filter((p) => p.id !== draftId)];
    setProposals(next);
    try {
      await storage.set("proposals", JSON.stringify(next), false);
      pushToast("Draft saved");
    } catch {
      pushToast("Couldn't save - storage is unavailable right now", "error");
    }
  };

  const loadDraft = (entry) => {
    setProposal(entry.data.proposal);
    setRows(entry.data.rows);
    setDraftId(entry.id);
    setPast([]);
    setFuture([]);
    setView("editor");
  };

  const cloneDraft = (entry) => {
    const cloned = {
      ...entry.data.proposal,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
    };
    setProposal(cloned);
    setRows(entry.data.rows.map((r) => ({ ...r, id: uid("row") })));
    setDraftId(uid("proposal"));
    setPast([]);
    setFuture([]);
    setView("editor");
    pushToast("Cloned - dates reset, ready to adjust");
  };

  const deleteDraft = (id) => {
    setConfirmModal({
      title: "Delete this proposal?",
      body: "This permanently removes it from your saved history.",
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        const next = proposals.filter((p) => p.id !== id);
        setProposals(next);
        try {
          await storage.set("proposals", JSON.stringify(next), false);
        } catch {}
        setConfirmModal(null);
        pushToast("Proposal deleted");
      },
    });
  };

  const copyTable = async () => {
    const pivot = pivotByTld();
    if (!pivot.length) {
      pushToast("Add at least one TLD first", "warn");
      return;
    }
    const header = ["TLD", "Registration", "Renewal", "Transfer", "Restore"];
    const lines = [header.join("\t")];
    pivot.forEach((p) => {
      lines.push(
        [
          p.tld,
          ...OPERATIONS.map((op) =>
            p[op] !== "" ? fmtMoney(p[op], currency.symbol) : "",
          ),
        ].join("\t"),
      );
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      pushToast("Table copied - paste directly into Excel");
    } catch {
      pushToast("Clipboard access was blocked by the browser", "error");
    }
  };

  const exportExcel = () => {
    const pivot = pivotByTld();
    const info = [
      [`${proposal.company} Pricing Proposal`],
      ["Reseller", proposal.resellerName || "-"],
      ["Currency", proposal.currency],
      ["Valid From", fmtDate(proposal.startDate)],
      ["Valid Until", fmtDate(proposal.endDate)],
      ["Offer Duration", proposal.offerDuration],
      ["Generated On", fmtDate(new Date().toISOString())],
      ["Prepared By", proposal.preparedBy],
      [],
      ["TLD", "Registration", "Renewal", "Transfer", "Restore"],
    ];
    pivot.forEach((p) =>
      info.push([
        p.tld,
        ...OPERATIONS.map((op) => (p[op] !== "" ? Number(p[op]) : "")),
      ]),
    );
    info.push([]);
    info.push(["Notes", proposal.notes || ""]);
    const ws = XLSX.utils.aoa_to_sheet(info);
    ws["!cols"] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pricing Proposal");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(proposal.resellerName || "proposal").replace(/\s+/g, "_")}_pricing.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast("Excel file downloaded - client-ready, internal costs excluded");
  };

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ proposal, rows: computed }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(proposal.resellerName || "proposal").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast("JSON exported");
  };

  const exportPdf = () => {
    // Most browsers use the document title as the suggested filename in the
    // "Save as PDF" print dialog, so set it to something client-ready for
    // the duration of the print, then restore it afterwards.
    const previousTitle = document.title;
    const safeName = (proposal.resellerName || "Proposal").replace(/\s+/g, "_");
    document.title = `${proposal.company}_${safeName}_Pricing`;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };
    window.addEventListener("afterprint", restoreTitle);
    window.print();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        let imported = 0;
        const newRows = [];
        const skipped = [];
        const warnings = [];
        data.forEach((r, i) => {
          const rowNum = i + 2; // +1 for header row, +1 for 1-indexing
          const keys = Object.keys(r).reduce(
            (acc, k) => ({ ...acc, [k.toLowerCase().trim()]: r[k] }),
            {},
          );
          const tld = String(keys.tld || "").trim();
          if (!tld) {
            skipped.push({ row: rowNum, reason: "Missing TLD" });
            return;
          }
          const rawOp = String(keys.operation || "").trim();
          const opValid = OPERATIONS.includes(rawOp);
          if (rawOp && !opValid) {
            warnings.push({
              row: rowNum,
              tld,
              reason: `Unknown operation "${rawOp}" - defaulted to Registration`,
            });
          }
          const cost = keys.cost || "";
          const price =
            keys.sellingprice || keys["selling price"] || keys.price || "";
          if (!cost && !price) {
            warnings.push({
              row: rowNum,
              tld,
              reason: "No cost or selling price - added as $0",
            });
          }
          newRows.push({
            id: uid("row"),
            tld,
            operation: opValid ? rawOp : "Registration",
            cost,
            price,
            starred: false,
          });
          imported++;
        });
        if (imported > 0) {
          commitRows((prev) => [...prev, ...newRows]);
        }
        if (skipped.length > 0 || warnings.length > 0) {
          setImportReport({ imported, skipped, warnings });
        } else if (imported > 0) {
          pushToast(
            `Imported ${imported} row${imported === 1 ? "" : "s"} from spreadsheet`,
          );
        } else {
          pushToast(
            "No matching rows found - expected columns TLD, Operation, Cost, SellingPrice",
            "warn",
          );
        }
      } catch {
        pushToast(
          "Couldn't read that file - try exporting it as .xlsx or .csv",
          "error",
        );
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  /* -------------------------------- shortcuts ------------------------------- */
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft();
      } else if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newProposal();
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (
        mod &&
        (e.key.toLowerCase() === "y" ||
          (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* --------------------------------- theme classes --------------------------------- */
  const T = {
    bg: isDark ? "bg-slate-950" : "bg-slate-50",
    surface: isDark ? "bg-slate-900" : "bg-white",
    surfaceAlt: isDark ? "bg-slate-900/60" : "bg-slate-100/70",
    border: isDark ? "border-slate-800" : "border-slate-200",
    text: isDark ? "text-slate-100" : "text-slate-900",
    muted: isDark ? "text-slate-400" : "text-slate-500",
    input: isDark
      ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none transition-colors"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-colors",
    hover: isDark
      ? "hover:bg-slate-800/70 transition-colors duration-150"
      : "hover:bg-slate-100 transition-colors duration-150",
    rowAlt: isDark ? "even:bg-slate-900/40" : "even:bg-slate-50/70",
  };

  const healthLabel = {
    excellent: "Excellent",
    good: "Healthy",
    low: "Low margin",
    loss: "Loss",
  };
  const healthClasses = (status) =>
    ({
      excellent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25",
      good: "text-sky-500 bg-sky-500/10 border-sky-500/25",
      low: "text-amber-500 bg-amber-500/10 border-amber-500/25",
      loss: "text-red-500 bg-red-500/10 border-red-500/25",
    })[status];

  const paletteCommands = [
    { label: "New proposal", icon: FilePlus2, action: newProposal },
    { label: "Save draft", icon: Save, action: saveDraft },
    { label: "Export to Excel", icon: FileSpreadsheet, action: exportExcel },
    { label: "Export to PDF", icon: FileText, action: exportPdf },
    { label: "Copy table", icon: Copy, action: copyTable },
    {
      label: "Toggle theme",
      icon: isDark ? Sun : Moon,
      action: () => setIsDark((d) => !d),
    },
    {
      label: "Go to history",
      icon: HistoryIcon,
      action: () => setView("history"),
    },
    {
      label: "Go to settings",
      icon: SettingsIcon,
      action: () => setView("settings"),
    },
    { label: "Add TLD row", icon: Plus, action: () => addRow() },
  ].filter((c) => c.label.toLowerCase().includes(paletteQuery.toLowerCase()));

  const filteredHistory = proposals.filter((p) => {
    const matchesName = p.resellerName
      .toLowerCase()
      .includes(historyQuery.toLowerCase());
    const created = p.createdDate ? p.createdDate.slice(0, 10) : "";
    const afterFrom = !historyFrom || created >= historyFrom;
    const beforeTo = !historyTo || created <= historyTo;
    return matchesName && afterFrom && beforeTo;
  });

  const recentResellers = Array.from(
    new Set(proposals.map((p) => p.resellerName)),
  ).slice(0, 6);

  const simRow = computed.find((r) => r.id === simRowId) || computed[0];
  const sliderMax = useMemo(
    () => Math.max(200, (parseFloat(simRow?.cost) || 0) * 4),
    [simRow?.id, simRow?.cost],
  );

  return (
    <div
      className={`${T.bg} ${T.text} min-h-screen w-full font-sans transition-colors duration-300`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-mono-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
        @keyframes toastIn { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:translateY(0);} }
        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
        @keyframes modalIn { from { opacity:0; transform: scale(0.97) translateY(4px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .animate-fadeIn { animation: fadeIn .2s ease; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? "#334155" : "#cbd5e1"}; border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${isDark ? "invert(1)" : "none"}; opacity: 0.6; cursor:pointer; }
        .print-only { display: none; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          /* min-h-screen (on the app root) and #root's min-height: 100svh
             (index.css) both force a full-viewport height even when every
             on-screen element is hidden for print. Left unset, that empty
             space pushes short proposals onto a needless blank 2nd page. */
          html, body, #root, .min-h-screen {
            min-height: 0 !important;
            height: auto !important;
          }
          @page { size: A4; margin: 16mm 14mm 20mm; }
          .print-page-footer {
            /* Previously position: fixed with a negative bottom offset to
               sit in the page margin - Chrome's print engine treats a fixed
               element positioned past the content box as needing its own
               page, which produced a blank trailing page even for short
               proposals. Keeping it in normal flow avoids that entirely. */
            margin-top: 10mm;
            font-size: 9px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
          }
          .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      {/* ------------------------------ TOP NAV ------------------------------ */}
      <header
        className={`no-print sticky top-0 z-40 ${T.surface} border-b ${T.border} backdrop-blur shadow-sm`}
      >
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <LogoMark size={36} className="rounded-lg shrink-0" />
            <div className="min-w-0">
              <div className="font-display font-semibold text-[15px] leading-tight truncate">
                Margin IQ - Pricing Intelligence
              </div>
              <div className={`text-[11px] ${T.muted} hidden sm:block`}>
                Calculate • Export • Share
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { key: "editor", label: "Proposal", icon: FilePlus2 },
              { key: "history", label: "History", icon: HistoryIcon },
              { key: "settings", label: "Settings", icon: SettingsIcon },
            ].map((n) => (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  view === n.key
                    ? "bg-indigo-600 text-white"
                    : `${T.muted} ${T.hover}`
                }`}
              >
                <n.icon size={15} /> {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className={`hidden sm:flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border ${T.border} ${T.muted} ${T.hover}`}
              title="Command palette (Ctrl+K)"
            >
              <Command size={13} /> <span>Ctrl K</span>
            </button>
            <button
              onClick={() => setIsDark((d) => !d)}
              className={`w-9 h-9 rounded-lg border ${T.border} flex items-center justify-center ${T.hover}`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div
              className={`hidden sm:flex items-center gap-2 pl-2 border-l ${T.border}`}
            >
              <div
                title={proposal.preparedBy || "Prepared by"}
                className={`w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-transparent hover:ring-offset-2 hover:ring-indigo-500/40 transition-all cursor-default ${isDark ? "ring-offset-slate-900" : "ring-offset-white"}`}
              >
                {proposal.preparedBy?.trim() ? (
                  initialsOf(proposal.preparedBy)
                ) : (
                  <User size={16} />
                )}
              </div>
            </div>
          </div>
        </div>
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2">
          {[
            { key: "editor", label: "Proposal", icon: FilePlus2 },
            { key: "history", label: "History", icon: HistoryIcon },
            { key: "settings", label: "Settings", icon: SettingsIcon },
          ].map((n) => (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                view === n.key
                  ? "bg-indigo-600 text-white"
                  : `${T.muted} ${T.hover}`
              }`}
            >
              <n.icon size={13} /> {n.label}
            </button>
          ))}
        </nav>
      </header>

      {autosaveBanner && (
        <div className="no-print bg-indigo-600/10 border-b border-indigo-500/30 text-sm px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-indigo-500">
            <Clock size={14} /> We found unsaved work from your last session.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={restoreAutosave}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium"
            >
              Restore
            </button>
            <button
              onClick={() => setAutosaveBanner(false)}
              className={`px-3 py-1 rounded-md text-xs font-medium ${T.muted} ${T.hover}`}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------ BODY ------------------------------ */}
      <main className="no-print max-w-[1500px] mx-auto px-4 sm:px-6 py-6">
        {view === "editor" && (
          <EditorView
            T={T}
            isDark={isDark}
            proposal={proposal}
            setProposal={setProposal}
            rows={computed}
            thresholds={thresholds}
            addRow={addRow}
            updateRow={updateRow}
            handleTldBlur={handleTldBlur}
            deleteRow={deleteRow}
            duplicateRow={duplicateRow}
            moveRow={moveRow}
            toggleStar={toggleStar}
            copyRow={copyRow}
            healthClasses={healthClasses}
            healthLabel={healthLabel}
            currency={currency}
            summary={summary}
            saveDraft={saveDraft}
            newProposal={newProposal}
            copyTable={copyTable}
            exportExcel={exportExcel}
            exportPdf={exportPdf}
            exportJson={exportJson}
            fileInputRef={fileInputRef}
            handleImport={handleImport}
            undo={undo}
            redo={redo}
            canUndo={past.length > 0}
            canRedo={future.length > 0}
            simRowId={simRowId}
            setSimRowId={setSimRowId}
            simRow={simRow}
            sliderMax={sliderMax}
            autocompleteRow={autocompleteRow}
            setAutocompleteRow={setAutocompleteRow}
            favoriteTlds={favoriteTlds}
            recentResellers={recentResellers}
            onPickReseller={(name) =>
              setProposal((p) => ({ ...p, resellerName: name }))
            }
          />
        )}
        {view === "history" && (
          <HistoryView
            T={T}
            proposals={filteredHistory}
            totalCount={proposals.length}
            historyQuery={historyQuery}
            setHistoryQuery={setHistoryQuery}
            historyFrom={historyFrom}
            setHistoryFrom={setHistoryFrom}
            historyTo={historyTo}
            setHistoryTo={setHistoryTo}
            loadDraft={loadDraft}
            cloneDraft={cloneDraft}
            deleteDraft={deleteDraft}
          />
        )}
        {view === "settings" && (
          <SettingsView
            T={T}
            proposal={proposal}
            setProposal={setProposal}
            thresholds={thresholds}
            setThresholds={setThresholds}
            isDark={isDark}
            setIsDark={setIsDark}
          />
        )}
      </main>

      {/* --------------------------- floating quick actions --------------------------- */}
      {view === "editor" && (
        <div className="no-print fixed bottom-18 right-5 z-30 flex flex-col gap-2">
          <button
            onClick={() => addRow()}
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white shadow-lg flex items-center justify-center"
            title="Add TLD"
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      {/* <footer className="no-print border-t border-slate-800/10 mt-10">
        <div className="max-w-[1500px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className={`text-sm font-medium ${T.muted}`}>
            Made with ❤️ by Vatsal Savani
          </div>
          <div className="flex items-center gap-4">
            {[
              {
                Icon: LinkedinGlyph,
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/vatsalsavanicodes/",
              },
              {
                Icon: Mail,
                label: "Email",
                href: "mailto:vatsalsavanicodes@gmail.com",
              },
              {
                Icon: WhatsappGlyph,
                label: "WhatsApp",
                href: "https://wa.me/918329351893",
              },
              {
                Icon: InstagramGlyph,
                label: "Instagram",
                href: "https://www.instagram.com/vatssal.savani_",
              },
              {
                Icon: GithubGlyph,
                label: "GitHub",
                href: "https://github.com/vatsal594",
              },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                title={label}
                aria-label={label}
                className={`${T.muted} hover:text-indigo-500 transition-colors`}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </footer> */}

      <footer className={`no-print border-t ${T.border} ${T.surface} mt-10`}>
        <div className="max-w-[1500px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <div className="flex flex-col">
              <div className={`text-sm font-semibold ${T.text}`}>
                MarginIQ
              </div>
              <div className={`text-xs ${T.muted}`}>
                Made with ❤️ by Vatsal Savani
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              {
                Icon: LinkedinGlyph,
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/vatsalsavanicodes/",
              },
              {
                Icon: Mail,
                label: "Email",
                href: "mailto:vatsalsavanicodes@gmail.com",
              },
              {
                Icon: WhatsappGlyph,
                label: "WhatsApp",
                href: "https://wa.me/918329351893",
              },
              {
                Icon: InstagramGlyph,
                label: "Instagram",
                href: "https://www.instagram.com/vatssal.savani_",
              },
              {
                Icon: GithubGlyph,
                label: "GitHub",
                href: "https://github.com/vatsal594",
              },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                title={label}
                aria-label={label}
                className={`w-9 h-9 rounded-lg border ${T.border} ${T.muted} ${T.hover} hover:text-indigo-500 flex items-center justify-center transition-colors`}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ------------------------------- PRINT VIEW ------------------------------- */}
      <div className="print-only p-10 text-slate-900 font-sans">
        <div className="print-avoid-break">
          <div className="h-2 -mx-10 -mt-10 mb-6 bg-indigo-600" />
          <div className="flex items-start justify-between pb-4 mb-6 border-b-2 border-slate-900">
            <div>
              <div className="font-display font-bold text-2xl">
                {proposal.company}
              </div>
              <div className="text-sm text-slate-500">
                Domain Reseller Pricing Proposal
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono-num">
                Ref: {draftId.replace("proposal_", "").toUpperCase()}
              </div>
            </div>
            <div className="text-right text-sm">
              <div>Prepared by {proposal.preparedBy}</div>
              <div className="text-slate-500">
                Generated {fmtDate(new Date().toISOString())}
              </div>
            </div>
          </div>
          <div
            className={`grid grid-cols-4 gap-4 mb-6 text-sm rounded-lg border border-slate-200 p-4`}
          >
            <div>
              <div className="text-slate-500">Prepared for</div>
              <div className="font-semibold">
                {proposal.resellerName || "-"}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Currency</div>
              <div className="font-semibold">{proposal.currency}</div>
            </div>
            <div>
              <div className="text-slate-500">Valid From</div>
              <div className="font-semibold">{fmtDate(proposal.startDate)}</div>
            </div>
            <div>
              <div className="text-slate-500">Valid Until</div>
              <div className="font-semibold">{fmtDate(proposal.endDate)}</div>
            </div>
          </div>
        </div>
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="text-left py-2">TLD</th>
              <th className="text-right py-2">Registration</th>
              <th className="text-right py-2">Renewal</th>
              <th className="text-right py-2">Transfer</th>
              <th className="text-right py-2">Restore</th>
            </tr>
          </thead>
          <tbody>
            {pivotByTld().map((p) => (
              <tr
                key={p.tld}
                className="border-b border-slate-200 print-avoid-break"
              >
                <td className="py-2 font-medium">{p.tld}</td>
                {OPERATIONS.map((op) => (
                  <td key={op} className="text-right py-2 font-mono-num">
                    {p[op] !== "" ? fmtMoney(p[op], currency.symbol) : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="print-avoid-break flex justify-end mb-6">
          <div className="w-64 text-sm border-t-2 border-slate-900 pt-2">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Total price</span>
              <span className="font-mono-num font-semibold">
                {fmtMoney(summary.totalRevenue, currency.symbol)}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">TLDs quoted</span>
              <span className="font-mono-num font-semibold">
                {summary.count}
              </span>
            </div>
          </div>
        </div>
        {/*
          Client-facing PDF intentionally omits margin / margin % - this
          section only shows what the client is being charged (price), never
          our cost or markup. Margin figures stay in-app only (dashboard,
          editor table, Excel is already cost-free too).
        */}
        {proposal.notes && (
          <div className="text-sm print-avoid-break">
            <div className="text-slate-500 mb-1">Notes</div>
            <div>{proposal.notes}</div>
          </div>
        )}
        <div className="print-page-footer print-avoid-break">
          <span>
            {proposal.company} - Prepared for {proposal.resellerName || "-"}
          </span>
          <span>Confidential - not for redistribution</span>
        </div>
      </div>

      <Toast
        toasts={toasts}
        isDark={isDark}
        onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />

      {/* -------------------------------- duplicate modal -------------------------------- */}
      <Modal
        open={!!dupModal}
        onClose={() => setDupModal(null)}
        isDark={isDark}
      >
        {dupModal && (
          <div className="p-6">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertTriangle size={18} />
              <span className="font-semibold">Possible duplicate</span>
            </div>
            <p className={`text-sm ${T.muted} mb-5`}>
              <span className={`font-mono-num font-medium ${T.text}`}>
                {dupModal.value}
              </span>{" "}
              already exists in this proposal. Would you like to update the
              existing row instead?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  commitRows((r) =>
                    r.filter((row) => row.id !== dupModal.rowId),
                  );
                  setDupModal(null);
                  pushToast("Kept the existing row");
                }}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white text-sm font-medium"
              >
                Update existing row
              </button>
              <button
                onClick={() => setDupModal(null)}
                className={`w-full py-2 rounded-lg border ${T.border} text-sm font-medium ${T.hover}`}
              >
                Create duplicate anyway
              </button>
              <button
                onClick={() => {
                  updateRow(dupModal.rowId, "tld", "");
                  setDupModal(null);
                }}
                className={`w-full py-2 rounded-lg text-sm font-medium ${T.muted} ${T.hover}`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* -------------------------------- import report -------------------------------- */}
      <Modal
        open={!!importReport}
        onClose={() => setImportReport(null)}
        isDark={isDark}
        width="max-w-lg"
      >
        {importReport && (
          <div className="p-5">
            <div className="flex items-center gap-2 font-semibold mb-1">
              {importReport.skipped.length > 0 ? (
                <AlertTriangle size={16} className="text-amber-500" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
              Import results
            </div>
            <div className={`text-sm mb-4 ${T.muted}`}>
              Imported {importReport.imported} row
              {importReport.imported === 1 ? "" : "s"}
              {importReport.skipped.length > 0 &&
                `, skipped ${importReport.skipped.length}`}
              {importReport.warnings.length > 0 &&
                `, ${importReport.warnings.length} with warnings`}
              .
            </div>
            {(importReport.skipped.length > 0 ||
              importReport.warnings.length > 0) && (
              <div
                className={`max-h-64 overflow-y-auto rounded-lg border ${T.border} divide-y ${T.border} text-sm mb-4`}
              >
                {importReport.skipped.map((s, i) => (
                  <div key={`s${i}`} className="px-3 py-2 flex gap-2">
                    <span className="text-red-500 font-mono-num shrink-0">
                      Row {s.row}
                    </span>
                    <span className={T.muted}>Skipped - {s.reason}</span>
                  </div>
                ))}
                {importReport.warnings.map((w, i) => (
                  <div key={`w${i}`} className="px-3 py-2 flex gap-2">
                    <span className="text-amber-500 font-mono-num shrink-0">
                      Row {w.row}
                    </span>
                    <span className={T.muted}>
                      {w.tld ? `${w.tld} - ` : ""}
                      {w.reason}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setImportReport(null)}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white text-sm font-medium"
            >
              Got it
            </button>
          </div>
        )}
      </Modal>
      <Modal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        isDark={isDark}
      >
        {confirmModal && (
          <div className="p-6">
            <div className="font-semibold mb-1">{confirmModal.title}</div>
            <p className={`text-sm ${T.muted} mb-5`}>{confirmModal.body}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${T.muted} ${T.hover}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white active:scale-[0.97] transition-all duration-150 ${confirmModal.danger ? "bg-red-600 hover:bg-red-500" : "bg-indigo-600 hover:bg-indigo-500"}`}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* -------------------------------- command palette -------------------------------- */}
      <Modal
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        width="max-w-lg"
        isDark={isDark}
      >
        <div
          className={`flex items-center gap-2 px-4 py-3 border-b ${T.border}`}
        >
          <Search size={15} className={T.muted} />
          <input
            autoFocus
            value={paletteQuery}
            onChange={(e) => setPaletteQuery(e.target.value)}
            placeholder="Type a command…"
            className={`flex-1 bg-transparent outline-none text-sm ${T.text}`}
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {paletteCommands.length === 0 && (
            <div className={`text-sm ${T.muted} px-3 py-6 text-center`}>
              No matching commands
            </div>
          )}
          {paletteCommands.map((c) => (
            <button
              key={c.label}
              onClick={() => {
                c.action();
                setPaletteOpen(false);
                setPaletteQuery("");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${T.hover}`}
            >
              <c.icon size={15} className="text-indigo-500" /> {c.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Editor view                                                             */
/* ---------------------------------------------------------------------- */

function EditorView(props) {
  const {
    T,
    proposal,
    setProposal,
    rows,
    thresholds,
    addRow,
    updateRow,
    handleTldBlur,
    deleteRow,
    duplicateRow,
    moveRow,
    toggleStar,
    copyRow,
    healthClasses,
    healthLabel,
    currency,
    summary,
    saveDraft,
    newProposal,
    copyTable,
    exportExcel,
    exportPdf,
    exportJson,
    fileInputRef,
    handleImport,
    undo,
    redo,
    canUndo,
    canRedo,
    simRowId,
    setSimRowId,
    simRow,
    sliderMax,
    autocompleteRow,
    setAutocompleteRow,
    favoriteTlds,
    recentResellers,
    onPickReseller,
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        {/* proposal info card */}
        <div
          className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <Building2 size={16} className="text-indigo-500" /> Proposal
              details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md border ${T.border} disabled:opacity-30 ${T.hover}`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md border ${T.border} disabled:opacity-30 ${T.hover}`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={14} />
              </button>
            </div>
          </div>

          {recentResellers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {recentResellers.map((name) => (
                <button
                  key={name}
                  onClick={() => onPickReseller(name)}
                  className={`text-[11px] px-2 py-1 rounded-full border ${T.border} ${T.muted} ${T.hover}`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Reseller name" T={T}>
              <input
                className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
                value={proposal.resellerName}
                onChange={(e) =>
                  setProposal((p) => ({ ...p, resellerName: e.target.value }))
                }
                placeholder="Acme Web Hosting"
              />
            </Field>
            <Field label="Brand" T={T}>
              <select
                className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
                value={proposal.company}
                onChange={(e) =>
                  setProposal((p) => ({ ...p, company: e.target.value }))
                }
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Currency" T={T}>
              <select
                className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
                value={proposal.currency}
                onChange={(e) =>
                  setProposal((p) => ({ ...p, currency: e.target.value }))
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Offer duration" T={T}>
              <input
                className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
                value={proposal.offerDuration}
                onChange={(e) => {
                  const val = e.target.value;
                  setProposal((p) => {
                    const days = parseDurationDays(val);
                    const next = { ...p, offerDuration: val };
                    if (days !== null && p.startDate) {
                      next.endDate = addDaysISO(p.startDate, days);
                    }
                    return next;
                  });
                }}
                placeholder="30 days"
              />
            </Field>
            <Field label="Start date" T={T}>
              <input
                type="date"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
                value={proposal.startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setProposal((p) => {
                    const next = { ...p, startDate: val };
                    if (p.endDate) {
                      const days = diffDaysISO(val, p.endDate);
                      if (days !== null && days >= 0) {
                        next.offerDuration = `${days} day${days === 1 ? "" : "s"}`;
                      }
                    } else {
                      const days = parseDurationDays(p.offerDuration);
                      if (days !== null && val)
                        next.endDate = addDaysISO(val, days);
                    }
                    return next;
                  });
                }}
              />
            </Field>
            <Field label="End date" T={T}>
              <input
                type="date"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
                value={proposal.endDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setProposal((p) => {
                    const next = { ...p, endDate: val };
                    if (p.startDate && val) {
                      const days = diffDaysISO(p.startDate, val);
                      if (days !== null && days >= 0) {
                        next.offerDuration = `${days} day${days === 1 ? "" : "s"}`;
                      }
                    }
                    return next;
                  });
                }}
              />
            </Field>
            <Field label="Prepared by" T={T}>
              <div
                className={`w-full rounded-lg border flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 transition-colors ${T.input}`}
              >
                <User size={13} className={`ml-3 shrink-0 ${T.muted}`} />
                <input
                  className="w-full bg-transparent outline-none py-2 pr-3 text-sm"
                  value={proposal.preparedBy}
                  onChange={(e) =>
                    setProposal((p) => ({ ...p, preparedBy: e.target.value }))
                  }
                  placeholder="Your name"
                />
              </div>
            </Field>
            <Field label="Notes" T={T} full>
              <textarea
                rows={2}
                className={`w-full rounded-lg border px-3 py-2 text-sm resize-none ${T.input}`}
                value={proposal.notes}
                onChange={(e) =>
                  setProposal((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Any terms, conditions or special mentions for this offer…"
              />
            </Field>
          </div>
        </div>

        {/* pricing table card */}
        <div
          className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="font-display font-semibold text-sm">
              TLD pricing
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${T.border} ${T.hover}`}
              >
                <Upload size={13} /> Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImport}
              />
              <button
                onClick={copyTable}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${T.border} ${T.hover}`}
              >
                <Copy size={13} /> Copy table
              </button>
              <button
                onClick={() => addRow()}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white font-medium"
              >
                <Plus size={13} /> Add TLD
              </button>
            </div>
          </div>

          {favoriteTlds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span
                className={`text-[11px] ${T.muted} flex items-center gap-1`}
              >
                <Star size={11} className="fill-amber-400 text-amber-400" />{" "}
                Quick add:
              </span>
              {favoriteTlds.map((tld) => (
                <button
                  key={tld}
                  onClick={() => addRow(tld)}
                  className={`text-[11px] px-2 py-1 rounded-full border ${T.border} ${T.hover}`}
                >
                  {tld}
                </button>
              ))}
            </div>
          )}

          {rows.length === 0 ? (
            <div className={`text-center py-14 ${T.muted}`}>
              <Sparkles size={22} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">
                No TLDs yet - add your first one to start pricing.
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto -mx-5 px-5 sm:shadow-none shadow-[inset_-14px_0_10px_-10px_rgba(0,0,0,0.12)]">
                <table className="w-full text-sm min-w-[820px]">
                  <thead>
                    <tr
                      className={`text-left text-xs uppercase tracking-wide ${T.muted} border-b ${T.border}`}
                    >
                      <th className="py-2 pr-2 font-medium w-8"></th>
                      <th className="py-2 pr-2 font-medium">TLD</th>
                      <th className="py-2 pr-2 font-medium">Operation</th>
                      <th className="py-2 pr-2 font-medium text-right">Cost</th>
                      <th className="py-2 pr-2 font-medium text-right">
                        Selling price
                      </th>
                      <th className="py-2 pr-2 font-medium text-right">
                        Margin
                      </th>
                      <th className="py-2 pr-2 font-medium text-right">
                        Margin %
                      </th>
                      <th className="py-2 pr-2 font-medium">Status</th>
                      <th className="py-2 pl-2 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`border-b ${T.border} ${T.rowAlt} ${T.hover} align-middle`}
                      >
                        <td className="py-1.5 pr-2">
                          <button
                            onClick={() => toggleStar(row.id)}
                            title="Mark as favorite"
                          >
                            <Star
                              size={14}
                              className={
                                row.starred
                                  ? "fill-amber-400 text-amber-400"
                                  : `${T.muted}`
                              }
                            />
                          </button>
                        </td>
                        <td className="py-1.5 pr-2 relative">
                          <input
                            className={`w-28 rounded-lg border px-2 py-1.5 text-sm font-mono-num ${T.input}`}
                            value={row.tld}
                            onChange={(e) =>
                              updateRow(row.id, "tld", e.target.value)
                            }
                            onFocus={() => setAutocompleteRow(row.id)}
                            onBlur={(e) => {
                              handleTldBlur(row.id, e.target.value);
                              setTimeout(() => setAutocompleteRow(null), 150);
                            }}
                            placeholder=".com"
                          />
                          {autocompleteRow === row.id && row.tld && (
                            <div
                              className={`absolute z-20 mt-1 w-40 max-h-40 overflow-y-auto rounded-lg border ${T.border} ${T.surface} shadow-lg`}
                            >
                              {TLD_SUGGESTIONS.filter(
                                (s) =>
                                  s.startsWith(row.tld.toLowerCase()) &&
                                  s !== row.tld.toLowerCase(),
                              )
                                .slice(0, 6)
                                .map((s) => (
                                  <button
                                    key={s}
                                    onMouseDown={() =>
                                      updateRow(row.id, "tld", s)
                                    }
                                    className={`w-full text-left px-3 py-1.5 text-xs font-mono-num ${T.hover}`}
                                  >
                                    {s}
                                  </button>
                                ))}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 pr-2">
                          <select
                            className={`rounded-lg border px-2 py-1.5 text-sm ${T.input}`}
                            value={row.operation}
                            onChange={(e) =>
                              updateRow(row.id, "operation", e.target.value)
                            }
                          >
                            {OPERATIONS.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 pr-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-invalid={parseFloat(row.cost) < 0}
                            title={
                              parseFloat(row.cost) < 0
                                ? "Cost can't be negative"
                                : undefined
                            }
                            className={`w-24 rounded-lg border px-2 py-1.5 text-sm text-right font-mono-num ${T.input} ${
                              parseFloat(row.cost) < 0
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/25"
                                : ""
                            }`}
                            value={row.cost}
                            onChange={(e) =>
                              updateRow(row.id, "cost", e.target.value)
                            }
                            onBlur={() => {
                              if (parseFloat(row.cost) < 0) {
                                pushToast("Cost can't be negative", "warn");
                              }
                            }}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-1.5 pr-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-invalid={parseFloat(row.price) < 0}
                            title={
                              parseFloat(row.price) < 0
                                ? "Price can't be negative"
                                : undefined
                            }
                            className={`w-24 rounded-lg border px-2 py-1.5 text-sm text-right font-mono-num ${T.input} ${
                              parseFloat(row.price) < 0
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/25"
                                : ""
                            }`}
                            value={row.price}
                            onChange={(e) =>
                              updateRow(row.id, "price", e.target.value)
                            }
                            onBlur={() => {
                              if (parseFloat(row.price) < 0) {
                                pushToast(
                                  "Selling price can't be negative",
                                  "warn",
                                );
                              }
                            }}
                            placeholder="0.00"
                          />
                        </td>
                        <td
                          className={`py-1.5 pr-2 text-right font-mono-num ${row.margin < 0 ? "text-red-500" : ""}`}
                        >
                          {fmtMoney(row.margin, currency.symbol)}
                        </td>
                        <td className="py-1.5 pr-2 text-right font-mono-num">
                          {row.marginPct.toFixed(1)}%
                        </td>
                        <td className="py-1.5 pr-2">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border ${healthClasses(row.status)}`}
                          >
                            <HealthRing
                              pct={Math.max(0, row.marginPct)}
                              status={row.status}
                              size={14}
                            />
                            {healthLabel[row.status]}
                            {row.status === "loss" && (
                              <AlertTriangle size={11} />
                            )}
                          </span>
                        </td>
                        <td className="py-1.5 pl-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => moveRow(row.id, -1)}
                              disabled={idx === 0}
                              className={`p-1 rounded ${T.hover} disabled:opacity-20`}
                              title="Move up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              onClick={() => moveRow(row.id, 1)}
                              disabled={idx === rows.length - 1}
                              className={`p-1 rounded ${T.hover} disabled:opacity-20`}
                              title="Move down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              onClick={() => copyRow(row)}
                              className={`p-1 rounded ${T.hover}`}
                              title="Copy row"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => duplicateRow(row.id)}
                              className={`p-1 rounded ${T.hover}`}
                              title="Duplicate row"
                            >
                              <CopyPlus size={13} />
                            </button>
                            <button
                              onClick={() => deleteRow(row.id)}
                              className={`p-1 rounded ${T.hover} text-red-500`}
                              title="Remove row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                className={`sm:hidden text-center text-[11px] ${T.muted} mt-1.5`}
              >
                Swipe to see more →
              </div>
            </div>
          )}
        </div>

        {/* margin simulator */}
        {simRow && (
          <div
            className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5`}
          >
            <div className="flex items-center gap-2 font-display font-semibold text-sm mb-4">
              <Sparkles size={15} className="text-indigo-500" /> Margin
              simulator
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <select
                className={`rounded-lg border px-3 py-2 text-sm ${T.input} sm:w-56`}
                value={simRowId || rows[0]?.id || ""}
                onChange={(e) => setSimRowId(e.target.value)}
              >
                {rows
                  .filter((r) => r.tld)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.tld} - {r.operation}
                    </option>
                  ))}
              </select>
              <input
                type="range"
                min="0"
                max={sliderMax}
                step="0.5"
                value={simRow.price || 0}
                onChange={(e) => updateRow(simRow.id, "price", e.target.value)}
                className="flex-1 accent-indigo-600"
              />
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className={T.muted}>Price </span>
                  <span className="font-mono-num font-medium">
                    {fmtMoney(simRow.price, currency.symbol)}
                  </span>
                </div>
                <div>
                  <span className={T.muted}>Margin </span>
                  <span
                    className={`font-mono-num font-medium ${simRow.margin < 0 ? "text-red-500" : ""}`}
                  >
                    {fmtMoney(simRow.margin, currency.symbol)} (
                    {simRow.marginPct.toFixed(1)}%)
                  </span>
                </div>
                <span
                  className={`text-[11px] px-2 py-1 rounded-full border ${healthClasses(simRow.status)}`}
                >
                  {healthLabel[simRow.status]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* export row */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveDraft}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white font-medium"
          >
            <Save size={15} /> Save draft
          </button>
          <button
            onClick={exportExcel}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border ${T.border} ${T.hover}`}
          >
            <FileSpreadsheet size={15} /> Export Excel
          </button>
          <button
            onClick={exportPdf}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border ${T.border} ${T.hover}`}
          >
            <FileText size={15} /> Export PDF
          </button>
          <button
            onClick={newProposal}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border ${T.border} ${T.hover} ml-auto`}
          >
            <RotateCcw size={15} /> New proposal
          </button>
        </div>
      </div>

      {/* summary sidebar */}
      <div
        className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5 lg:sticky lg:top-20 flex flex-col gap-4`}
      >
        <div className="font-display font-semibold text-sm">Summary</div>
        <SummaryStat T={T} label="Total TLDs" value={summary.count} />
        <SummaryStat
          T={T}
          label="Total revenue"
          value={fmtMoney(summary.totalRevenue, currency.symbol)}
          mono
        />
        <SummaryStat
          T={T}
          label="Total estimated profit"
          value={fmtMoney(summary.totalMargin, currency.symbol)}
          mono
          highlight={summary.totalMargin < 0 ? "loss" : undefined}
        />
        <SummaryStat
          T={T}
          label="Average margin"
          value={fmtMoney(summary.avgMargin, currency.symbol)}
          mono
        />
        <SummaryStat
          T={T}
          label="Average margin %"
          value={`${summary.avgMarginPct.toFixed(1)}%`}
          mono
        />
        <div className="grid grid-cols-2 gap-3">
          <SummaryStat
            T={T}
            label="Lowest margin"
            value={fmtMoney(summary.lowest, currency.symbol)}
            mono
            small
          />
          <SummaryStat
            T={T}
            label="Highest margin"
            value={fmtMoney(summary.highest, currency.symbol)}
            mono
            small
          />
        </div>
        {summary.negativeCount > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs px-3 py-2.5 flex items-center gap-2">
            <AlertTriangle size={14} /> {summary.negativeCount} row
            {summary.negativeCount > 1 ? "s" : ""} priced below cost
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, T, full }) {
  return (
    <div className={full ? "sm:col-span-2 md:col-span-3" : ""}>
      <label className={`block text-xs font-medium mb-1 ${T.muted}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryStat({ T, label, value, mono, highlight, small }) {
  return (
    <div>
      <div className={`text-[11px] ${T.muted} mb-0.5`}>{label}</div>
      <div
        className={`${small ? "text-sm" : "text-lg"} font-semibold ${mono ? "font-mono-num" : "font-display"} ${highlight === "loss" ? "text-red-500" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* History view                                                            */
/* ---------------------------------------------------------------------- */

function HistoryView({
  T,
  proposals,
  totalCount,
  historyQuery,
  setHistoryQuery,
  historyFrom,
  setHistoryFrom,
  historyTo,
  setHistoryTo,
  loadDraft,
  cloneDraft,
  deleteDraft,
}) {
  const filtersActive = historyQuery || historyFrom || historyTo;
  const clearFilters = () => {
    setHistoryQuery("");
    setHistoryFrom("");
    setHistoryTo("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-display font-semibold text-lg">
          Proposal history
          {totalCount > 0 && (
            <span className={`ml-2 text-xs font-normal ${T.muted}`}>
              {filtersActive
                ? `${proposals.length} of ${totalCount}`
                : `${totalCount} total`}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-lg border ${T.border} px-3 py-2 w-full sm:w-56`}
          >
            <Search size={14} className={T.muted} />
            <input
              value={historyQuery}
              onChange={(e) => setHistoryQuery(e.target.value)}
              placeholder="Search by reseller…"
              className={`flex-1 bg-transparent outline-none text-sm ${T.text}`}
            />
          </div>
          <input
            type="date"
            value={historyFrom}
            onChange={(e) => setHistoryFrom(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm ${T.input}`}
            title="From date"
          />
          <span className={`text-xs ${T.muted}`}>to</span>
          <input
            type="date"
            value={historyTo}
            onChange={(e) => setHistoryTo(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm ${T.input}`}
            title="To date"
          />
          {filtersActive && (
            <button
              onClick={clearFilters}
              className={`text-xs px-2 py-2 rounded-lg ${T.hover} ${T.muted}`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {totalCount === 0 ? (
        <div
          className={`${T.surface} border ${T.border} rounded-2xl shadow-sm text-center py-16 ${T.muted}`}
        >
          <HistoryIcon size={22} className="mx-auto mb-2 opacity-50" />
          <div className="text-sm">
            No saved proposals yet - save a draft to see it here.
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <div
          className={`${T.surface} border ${T.border} rounded-2xl shadow-sm text-center py-16 ${T.muted}`}
        >
          <Search size={22} className="mx-auto mb-2 opacity-50" />
          <div className="text-sm">No proposals match these filters.</div>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-indigo-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          className={`${T.surface} border ${T.border} rounded-2xl shadow-sm overflow-hidden`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className={`text-left text-xs uppercase tracking-wide ${T.muted} border-b ${T.border}`}
              >
                <th className="py-3 px-4 font-medium">Reseller</th>
                <th className="py-3 px-4 font-medium">Brand</th>
                <th className="py-3 px-4 font-medium">Last saved</th>
                <th className="py-3 px-4 font-medium">Currency</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b ${T.border} last:border-0 ${T.hover}`}
                >
                  <td className="py-3 px-4 font-medium">{p.resellerName}</td>
                  <td className={`py-3 px-4 ${T.muted}`}>{p.company || "-"}</td>
                  <td className={`py-3 px-4 ${T.muted}`}>
                    {fmtDate(p.updatedDate || p.createdDate)}
                  </td>
                  <td className="py-3 px-4 font-mono-num">{p.currency}</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] px-2 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-500">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => loadDraft(p)}
                        className={`p-1.5 rounded-md ${T.hover}`}
                        title="Open"
                      >
                        <ChevronRight size={15} />
                      </button>
                      <button
                        onClick={() => cloneDraft(p)}
                        className={`p-1.5 rounded-md ${T.hover}`}
                        title="Clone"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => deleteDraft(p.id)}
                        className={`p-1.5 rounded-md ${T.hover} text-red-500`}
                        title="Delete"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Settings view                                                           */
/* ---------------------------------------------------------------------- */

function SettingsView({
  T,
  proposal,
  setProposal,
  thresholds,
  setThresholds,
  isDark,
  setIsDark,
}) {
  return (
    <div className="max-w-xl flex flex-col gap-5">
      <div className="font-display font-semibold text-lg">Settings</div>

      <div
        className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5 flex flex-col gap-4`}
      >
        <div className="font-medium text-sm">Defaults</div>
        <Field label="Prepared by" T={T}>
          <input
            className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
            value={proposal.preparedBy}
            onChange={(e) =>
              setProposal((p) => ({ ...p, preparedBy: e.target.value }))
            }
          />
        </Field>
        <Field label="Brand" T={T}>
          <select
            className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
            value={proposal.company}
            onChange={(e) =>
              setProposal((p) => ({ ...p, company: e.target.value }))
            }
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <p className={`text-xs mt-1 ${T.muted}`}>
            This is also editable from the proposal editor. Whichever brand is
            selected here is what appears on this proposal's PDF and Excel
            export.
          </p>
        </Field>
      </div>

      <div
        className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5 flex flex-col gap-4`}
      >
        <div className="font-medium text-sm">Margin health thresholds</div>
        <p className={`text-xs ${T.muted}`}>
          Rows below the low threshold are flagged amber; below zero they're
          flagged red.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Low margin below (%)" T={T}>
            <input
              type="number"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono-num ${T.input}`}
              value={thresholds.low}
              onChange={(e) =>
                setThresholds((t) => ({
                  ...t,
                  low: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </Field>
          <Field label="Excellent margin at (%)" T={T}>
            <input
              type="number"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono-num ${T.input}`}
              value={thresholds.excellent}
              onChange={(e) =>
                setThresholds((t) => ({
                  ...t,
                  excellent: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </Field>
        </div>
      </div>

      <div
        className={`${T.surface} border ${T.border} rounded-2xl shadow-sm p-5 flex items-center justify-between`}
      >
        <div>
          <div className="font-medium text-sm">Appearance</div>
          <div className={`text-xs ${T.muted}`}>
            Switch between light and dark mode
          </div>
        </div>
        <button
          onClick={() => setIsDark((d) => !d)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${T.border} ${T.hover} text-sm`}
        >
          {isDark ? <Moon size={14} /> : <Sun size={14} />}{" "}
          {isDark ? "Dark" : "Light"}
        </button>
      </div>
    </div>
  );
}
