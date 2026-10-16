import {
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
  Copy,
  FileSpreadsheet,
  FileText,
  History as HistoryIcon,
  Settings as SettingsIcon,
  X,
  Search,
  Command,
  AlertTriangle,
  CheckCircle2,
  Save,
  FilePlus2,
  Clock,
  Mail,
  Upload,
  User,
  ChevronRight,
  Trash,
  Table2,
  ExternalLink,
  Link2,
  RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  parseCostSheet,
  lookupTld,
  sheetCost,
  sheetTldSuggestions,
} from "./lib/costSheet.js";
import {
  fileLinkSupported,
  getLinkedHandle,
  saveLinkedHandle,
  clearLinkedHandle,
  pickSheetFile,
  readLinkedFile,
} from "./lib/sheetLink.js";
import {
  OPERATIONS,
  DEFAULT_THRESHOLDS,
  uid,
  applySheetCost,
  calcRow,
  newTldRows,
  ensureGroups,
  groupRows,
  priceForMargin,
  parseMarginInput,
} from "./lib/pricing.js";
import { fmtMoney, fmtDate, fmtDateTime } from "./lib/format.js";
import EditorView from "./components/EditorView.jsx";
import Field from "./components/Field.jsx";

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

// Synchronous read for values that must be known on first render (theme,
// thresholds, cost sheet), so the UI doesn't flash defaults.
function loadStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
const loadSettings = () => loadStored("settings", {});

const STALE_SHEET_DAYS = 30;

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

const HISTORY_LIMIT = 50; // undo steps kept
const COALESCE_MS = 1000; // edits to one field closer than this = one undo step

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

// Most browsers use the document title as the suggested filename in the
// "Save as PDF" print dialog, so set it for the duration of the print.
function printWithTitle(title) {
  const previousTitle = document.title;
  document.title = title;
  const restoreTitle = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };
  window.addEventListener("afterprint", restoreTitle);
  window.print();
}

function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ---------------------------------------------------------------------- */

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
/* Undo history                                                            */
/* Snapshots are {proposal, rows}. Edits sharing a key within COALESCE_MS  */
/* (typing in one field, dragging the simulator) collapse into one step.   */
/* ---------------------------------------------------------------------- */

function useUndoHistory() {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const lastEditRef = useRef({ key: null, at: 0 });

  const record = useCallback((snapshot, key) => {
    const now = Date.now();
    const last = lastEditRef.current;
    const sameBurst = key && last.key === key && now - last.at < COALESCE_MS;
    if (!sameBurst) {
      setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), snapshot]);
      setFuture([]);
    }
    lastEditRef.current = { key, at: now };
  }, []);

  const reset = useCallback(() => {
    setPast([]);
    setFuture([]);
    lastEditRef.current = { key: null, at: 0 };
  }, []);

  // Each returns the snapshot to restore (or null), given the current one.
  const undo = useCallback(
    (current) => {
      if (past.length === 0) return null;
      setPast(past.slice(0, -1));
      setFuture([current, ...future]);
      lastEditRef.current = { key: null, at: 0 };
      return past[past.length - 1];
    },
    [past, future],
  );

  const redo = useCallback(
    (current) => {
      if (future.length === 0) return null;
      setFuture(future.slice(1));
      setPast([...past, current]);
      lastEditRef.current = { key: null, at: 0 };
      return future[0];
    },
    [past, future],
  );

  return { past, future, record, reset, undo, redo };
}

/* ---------------------------------------------------------------------- */
/* Main App                                                                */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = loadSettings().isDark;
    if (typeof saved === "boolean") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [view, setView] = useState("editor"); // editor | history | settings
  const [proposal, setProposal] = useState(emptyProposal());
  const [costSheet, setCostSheet] = useState(() =>
    loadStored("costSheet", null),
  );
  const [sheetUrl, setSheetUrl] = useState(() => loadSettings().sheetUrl || "");
  const [linkedFile, setLinkedFile] = useState(null); // { name } when a file is linked
  const [linkNeedsPermission, setLinkNeedsPermission] = useState(false);
  const linkedHandleRef = useRef(null);
  const checkInFlightRef = useRef(false);
  const [rows, setRows] = useState(() => [
    ...newTldRows(".com", costSheet, proposal.currency),
    ...newTldRows(".net", costSheet, proposal.currency),
  ]);
  const [draftId, setDraftId] = useState(() => uid("proposal"));
  // Bumped whenever a different proposal is loaded, so the editor resets its
  // own view state (e.g. whether the details card starts open).
  const [loadToken, setLoadToken] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [thresholds, setThresholds] = useState(() => ({
    ...DEFAULT_THRESHOLDS,
    ...loadSettings().thresholds,
  }));

  const history = useUndoHistory();

  const [toasts, setToasts] = useState([]);
  const [dupModal, setDupModal] = useState(null); // {groupId, existingId, value}
  const [confirmModal, setConfirmModal] = useState(null); // {title, body, onConfirm}
  const [importReport, setImportReport] = useState(null); // {imported, skipped: [], warnings: []}
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [autosaveBanner, setAutosaveBanner] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const fileInputRef = useRef(null);
  const autosaveTimer = useRef(null);

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
  // History covers the whole proposal (details + rows). Rapid edits to the
  // same field (typing, dragging the simulator slider) collapse into a single
  // undo step instead of one step per keystroke.
  const recordHistory = (key) => history.record({ proposal, rows }, key);
  const resetHistory = history.reset;

  const commitRows = (updater, key = null) => {
    recordHistory(key);
    setRows(updater);
  };

  const editProposal = (updater) => {
    recordHistory("proposal");
    setProposal(updater);
  };

  const restoreSnapshot = (snap) => {
    if (!snap) return;
    setProposal(snap.proposal);
    setRows(snap.rows);
  };
  const undo = () => restoreSnapshot(history.undo({ proposal, rows }));
  const redo = () => restoreSnapshot(history.redo({ proposal, rows }));

  /* ------------------------------ settings ------------------------------ */
  useEffect(() => {
    storage.set("settings", JSON.stringify({ isDark, thresholds, sheetUrl }));
  }, [isDark, thresholds, sheetUrl]);

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
    setRows(
      ensureGroups(autosaveBanner.rows, costSheet, autosaveBanner.proposal.currency),
    );
    resetHistory();
    setLoadToken((n) => n + 1);
    setAutosaveBanner(false);
    pushToast("Restored your last unsaved session");
  };

  /* ------------------------------- TLD rows ------------------------------- */
  // Each TLD is a group of four rows (one per operation) sharing `group`.
  const addTld = (tld = "") => {
    commitRows((r) => [...r, ...newTldRows(tld, costSheet, proposal.currency)]);
    // Focus the new TLD's input once it renders.
    setTimeout(() => {
      const inputs = document.querySelectorAll('input[aria-label="TLD"]');
      inputs[inputs.length - 1]?.focus();
    }, 0);
  };

  const changeGroupTld = (groupId, tld) => {
    commitRows(
      (r) =>
        r.map((row) =>
          row.group === groupId
            ? applySheetCost({ ...row, tld }, costSheet, proposal.currency)
            : row,
        ),
      `tld:${groupId}`,
    );
  };

  // Another TLD line with the same name would make exports keep only one
  // set of prices - offer to merge the two lines.
  const checkGroupDuplicate = (groupId) => {
    const g = rows.find((r) => r.group === groupId);
    const key = g?.tld.trim().toLowerCase();
    if (!key) return;
    const other = rows.find(
      (r) => r.group !== groupId && r.tld.trim().toLowerCase() === key,
    );
    if (other)
      setDupModal({ groupId, existingId: other.group, value: g.tld.trim() });
  };

  // Copies the duplicate line's entered costs/prices into the existing line
  // (per operation), then removes the duplicate - nothing typed is lost.
  const mergeGroups = (groupId, existingId) => {
    commitRows((r) => {
      const incoming = {};
      r.filter((x) => x.group === groupId).forEach((x) => {
        incoming[x.operation] = x;
      });
      return r
        .filter((x) => x.group !== groupId)
        .map((x) => {
          const src = x.group === existingId && incoming[x.operation];
          if (!src) return x;
          return {
            ...x,
            cost: src.cost !== "" ? src.cost : x.cost,
            costSource: src.cost !== "" ? src.costSource : x.costSource,
            price: src.price !== "" ? src.price : x.price,
          };
        });
    });
  };

  const deleteGroup = (groupId) => {
    commitRows((r) => r.filter((row) => row.group !== groupId));
    pushToast("TLD removed - Ctrl+Z to undo");
  };

  const moveGroup = (groupId, dir) => {
    commitRows((r) => {
      const groups = groupRows(r);
      const i = groups.findIndex((g) => g.id === groupId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= groups.length) return r;
      [groups[i], groups[j]] = [groups[j], groups[i]];
      return groups.flatMap((g) => g.rows);
    });
  };

  const toggleGroupStar = (groupId) => {
    const starred = rows.some((r) => r.group === groupId && r.starred);
    commitRows((r) =>
      r.map((row) => (row.group === groupId ? { ...row, starred: !starred } : row)),
    );
  };

  const copyGroup = async (groupId) => {
    const groupRowsList = rows.filter((r) => r.group === groupId);
    const tld = groupRowsList[0]?.tld || "";
    const text = [
      ["TLD", ...OPERATIONS].join("\t"),
      [
        tld,
        ...OPERATIONS.map((op) => {
          const r = groupRowsList.find((x) => x.operation === op);
          return r && r.price !== "" ? fmtMoney(r.price, currency.symbol) : "";
        }),
      ].join("\t"),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      pushToast(`Copied ${tld} prices`);
    } catch {
      pushToast("Couldn't copy - your browser blocked clipboard access", "error");
    }
  };

  // "20%" typed in a price cell becomes the price for a 20% margin.
  const commitPrice = (rowId, value) => {
    const pct = parseMarginInput(value);
    if (pct === null) return;
    const row = rows.find((r) => r.id === rowId);
    const price = row ? priceForMargin(row.cost, pct) : null;
    if (price === null) {
      pushToast(
        pct >= 100
          ? "Margin must be below 100%"
          : "Add a cost first - a % price is worked out from the cost",
        "warn",
      );
      updateRow(rowId, "price", "");
      return;
    }
    updateRow(rowId, "price", String(price));
  };

  const applyBulkMargin = (pct, mode) => {
    let changed = 0;
    const next = rows.map((row) => {
      if (mode === "empty" && String(row.price).trim() !== "") return row;
      if (!row.tld.trim()) return row;
      const price = priceForMargin(row.cost, pct);
      if (price === null) return row;
      changed++;
      return { ...row, price: String(price) };
    });
    if (changed === 0) {
      pushToast("Nothing to price - cells need a cost first", "warn");
      return;
    }
    commitRows(next);
    pushToast(`Priced ${changed} cell${changed === 1 ? "" : "s"} at ${pct}% margin`);
  };

  const updateRow = (id, field, value) => {
    commitRows(
      (r) =>
        r.map((row) => {
          if (row.id !== id) return row;
          if (field === "cost") return { ...row, cost: value, costSource: null };
          const next = { ...row, [field]: value };
          return field === "tld" || field === "operation"
            ? applySheetCost(next, costSheet, proposal.currency)
            : next;
        }),
      `row:${id}:${field}`,
    );
  };

  /* ------------------------------ cost sheet ------------------------------ */
  const takeSheetCost = (id) => {
    commitRows((r) =>
      r.map((row) =>
        row.id === id
          ? applySheetCost({ ...row, cost: "" }, costSheet, proposal.currency)
          : row,
      ),
    );
  };

  const fillFromSheet = () => {
    commitRows((r) =>
      r.map((row) => applySheetCost(row, costSheet, proposal.currency)),
    );
    pushToast("Filled empty costs from the cost sheet");
  };

  const changeCurrency = (code) => {
    recordHistory("currency");
    setProposal((p) => ({ ...p, currency: code }));
    setRows((r) => r.map((row) => applySheetCost(row, costSheet, code)));
  };

  const readSheetFile = async (file) => {
    const sheet = parseCostSheet(await file.arrayBuffer(), XLSX, file.name);
    sheet.fileModified = file.lastModified;
    return sheet;
  };

  // Rows whose cost came from the sheet (or is empty) pick up new costs;
  // costs the user typed stay as they are.
  const installSheet = (sheet) => {
    setCostSheet(sheet);
    storage.set("costSheet", JSON.stringify(sheet));
    setRows((r) =>
      r.map((row) => applySheetCost(row, sheet, liveRef.current.currency)),
    );
  };

  const loadCostSheet = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const sheet = await readSheetFile(file);
      installSheet(sheet);
      pushToast(`Loaded costs for ${sheet.count} TLDs from ${sheet.sheetName}`);
    } catch (err) {
      pushToast(err.message || "Couldn't read that cost sheet", "error");
    }
  };

  // Re-reads the linked file and reloads costs if it changed since the copy
  // we have. `prompt` may ask the browser for permission (needs a click);
  // `force` reloads and reports even when nothing changed.
  const refreshLinkedSheet = async ({ prompt = false, force = false } = {}) => {
    const handle = linkedHandleRef.current;
    if (!handle) return;
    // Closing the browser's permission prompt refocuses the window, which
    // fires an automatic check. Without this guard that check could finish
    // before access is granted and bring the "Allow" banner straight back.
    if (checkInFlightRef.current && !prompt) return;
    checkInFlightRef.current = true;
    try {
      const res = await readLinkedFile(handle, { prompt });
      if (res.needsPermission) {
        setLinkNeedsPermission(true);
        if (res.denied) {
          pushToast(
            "Margin IQ wasn't given access to the file. Click Allow again and choose \"Allow on every visit\".",
            "warn",
          );
        }
        return;
      }
      setLinkNeedsPermission(false);
      const { file } = res;
      const changed = file.lastModified !== liveRef.current.fileModified;
      if (!changed && !force) return;
      const sheet = await readSheetFile(file);
      installSheet(sheet);
      pushToast(
        changed
          ? `Cost sheet updated - ${file.name} modified ${fmtDateTime(file.lastModified)}`
          : `Cost sheet is up to date (${sheet.count} TLDs)`,
      );
    } catch (err) {
      pushToast(
        err?.name === "NotFoundError"
          ? `Can't find ${handle.name} any more - link the cost sheet again in Settings`
          : `Couldn't read ${handle.name}: ${err?.message || "unknown error"}`,
        "error",
      );
    } finally {
      checkInFlightRef.current = false;
    }
  };

  const linkSheetFile = async () => {
    try {
      const handle = await pickSheetFile();
      if (!handle) return;
      await saveLinkedHandle(handle);
      linkedHandleRef.current = handle;
      setLinkedFile({ name: handle.name });
      await refreshLinkedSheet({ prompt: true, force: true });
    } catch (err) {
      pushToast(`Couldn't link that file: ${err?.message || err}`, "error");
    }
  };

  const unlinkSheetFile = async () => {
    linkedHandleRef.current = null;
    setLinkedFile(null);
    setLinkNeedsPermission(false);
    try {
      await clearLinkedHandle();
    } catch {
      /* nothing stored */
    }
  };

  const clearCostSheet = async () => {
    await unlinkSheetFile();
    setCostSheet(null);
    storage.delete("costSheet");
    pushToast("Cost sheet removed from this browser");
  };

  // Latest values for the async file checks below, which outlive renders.
  const liveRef = useRef({});
  const refreshRef = useRef(null);
  useEffect(() => {
    liveRef.current = {
      currency: proposal.currency,
      fileModified: costSheet?.fileModified ?? null,
    };
    refreshRef.current = refreshLinkedSheet;
  });

  // On open, and whenever the user comes back to the tab, check the linked
  // file - OneDrive keeps it in sync with SharePoint in the background.
  useEffect(() => {
    let cancelled = false;
    getLinkedHandle().then((handle) => {
      if (cancelled || !handle) return;
      linkedHandleRef.current = handle;
      setLinkedFile({ name: handle.name });
      refreshRef.current?.();
    });
    const onFocus = () => refreshRef.current?.();
    const onVisible = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const tldSuggestions = useMemo(
    () =>
      Array.from(
        new Set([...TLD_SUGGESTIONS, ...sheetTldSuggestions(costSheet)]),
      ),
    [costSheet],
  );

  const favoriteTlds = useMemo(
    () =>
      Array.from(
        new Set(rows.filter((r) => r.starred && r.tld.trim()).map((r) => r.tld.trim())),
      ),
    [rows],
  );

  /* ------------------------------- summary -------------------------------- */
  const computed = useMemo(
    () =>
      rows.map((r) => {
        const c = sheetCost(lookupTld(costSheet, r.tld), r.operation);
        return {
          ...r,
          ...calcRow(r, thresholds),
          sheet: c && { ...c, matches: c.currency === proposal.currency },
        };
      }),
    [rows, thresholds, costSheet, proposal.currency],
  );

  const groups = useMemo(() => groupRows(computed), [computed]);

  const summary = useMemo(() => {
    const withTld = computed.filter((r) => r.tld.trim() !== "");
    const withPrice = withTld.filter((r) => r.status !== "empty");
    const totalMargin = withPrice.reduce((s, r) => s + r.margin, 0);
    const totalRevenue = withPrice.reduce(
      (s, r) => s + (parseFloat(r.price) || 0),
      0,
    );
    const counts = { loss: 0, low: 0, good: 0, excellent: 0 };
    withPrice.forEach((r) => {
      counts[r.status]++;
    });
    const tlds = new Set(withTld.map((r) => r.tld.trim().toLowerCase()));
    const pricedTlds = new Set(withPrice.map((r) => r.tld.trim().toLowerCase()));
    // Exports pivot to one price per TLD + operation, so a repeated pair
    // means one of the prices silently wouldn't make it into the PDF/Excel.
    const seen = new Set();
    const duplicates = new Set();
    withPrice.forEach((r) => {
      const key = `${r.tld.trim().toLowerCase()} (${r.operation})`;
      if (seen.has(key)) duplicates.add(key);
      seen.add(key);
    });
    return {
      duplicates: Array.from(duplicates),
      count: pricedTlds.size,
      tldCount: tlds.size,
      pricedCount: withPrice.length,
      cellCount: withTld.length,
      counts,
      totalMargin,
      totalRevenue,
      blendedPct: totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0,
      negativeCount: counts.loss,
    };
  }, [computed]);

  /* ------------------------------ save state ------------------------------ */
  const savedEntry = proposals.find((p) => p.id === draftId);
  const saveState = useMemo(
    () => ({
      savedAt: savedEntry?.updatedDate || null,
      dirty:
        !savedEntry ||
        JSON.stringify(savedEntry.data) !== JSON.stringify({ proposal, rows }),
    }),
    [savedEntry, proposal, rows],
  );

  /* --------------------------------- pivot --------------------------------- */
  function pivotByTld() {
    const map = new Map();
    computed.forEach((r) => {
      const tld = r.tld.trim();
      if (!tld) return;
      const key = tld.toLowerCase();
      if (!map.has(key))
        map.set(key, {
          tld,
          Registration: "",
          Renewal: "",
          Transfer: "",
          Restore: "",
        });
      if (String(r.price).trim() !== "") map.get(key)[r.operation] = r.price;
    });
    return Array.from(map.values()).filter((p) =>
      OPERATIONS.some((op) => p[op] !== ""),
    );
  }

  /* --------------------------------- actions -------------------------------- */
  const newProposal = () => {
    setConfirmModal({
      title: "Start a new proposal?",
      body: "Unsaved changes to the current proposal will be lost unless you've saved it as a draft.",
      confirmLabel: "Start new",
      onConfirm: () => {
        setProposal((p) => ({ ...emptyProposal(), preparedBy: p.preparedBy }));
        setRows(newTldRows(".com", costSheet, proposal.currency));
        setDraftId(uid("proposal"));
        resetHistory();
        setLoadToken((n) => n + 1);
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
    setRows(ensureGroups(entry.data.rows, costSheet, entry.data.proposal.currency));
    setDraftId(entry.id);
    resetHistory();
    setLoadToken((n) => n + 1);
    setView("editor");
  };

  const cloneDraft = (entry) => {
    const cloned = {
      ...entry.data.proposal,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
    };
    setProposal(cloned);
    const groupIds = {};
    setRows(
      ensureGroups(entry.data.rows, costSheet, cloned.currency).map((r) => {
        groupIds[r.group] ||= uid("tld");
        return { ...r, id: uid("row"), group: groupIds[r.group] };
      }),
    );
    setDraftId(uid("proposal"));
    resetHistory();
    setLoadToken((n) => n + 1);
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
        } catch {
          pushToast("Couldn't update saved history", "error");
        }
        setConfirmModal(null);
        pushToast("Proposal deleted");
      },
    });
  };

  const warnDuplicates = () => {
    if (summary.duplicates.length) {
      pushToast(
        `${summary.duplicates.join(", ")} listed more than once - only the last price is exported`,
        "warn",
      );
    }
  };

  const copyTable = async () => {
    warnDuplicates();
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
    warnDuplicates();
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
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    pushToast("Excel file downloaded - client-ready, internal costs excluded");
  };

  const exportPdf = () => {
    warnDuplicates();
    const safeName = (proposal.resellerName || "Proposal").replace(/\s+/g, "_");
    printWithTitle(`${proposal.company}_${safeName}_Pricing`);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
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
          newRows.push(
            applySheetCost(
              {
                id: uid("row"),
                group: null,
                tld,
                operation: opValid ? rawOp : "Registration",
                cost: String(cost),
                costSource: null,
                price,
                starred: false,
              },
              costSheet,
              proposal.currency,
            ),
          );
          imported++;
        });
        if (imported > 0) {
          commitRows((prev) => [
            ...prev,
            ...ensureGroups(newRows, costSheet, proposal.currency),
          ]);
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
    reader.readAsArrayBuffer(file);
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
      } else if (paletteOpen) {
        // Let undo/redo keys behave natively inside the palette search box.
        if (e.key === "Escape") setPaletteOpen(false);
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
    { label: "Add TLD", icon: Plus, action: () => addTld() },
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

  // Shown above the editor - one place instead of stacked banners.
  const notices = [];
  if (linkNeedsPermission && linkedFile) {
    notices.push({
      id: "permission",
      tone: "warn",
      icon: RefreshCw,
      text: `Allow Margin IQ to re-read ${linkedFile.name} to pick up the latest registry costs.`,
      actionLabel: "Allow",
    });
  }
  if (autosaveBanner) {
    notices.push({
      id: "autosave",
      tone: "info",
      icon: Clock,
      text: "We found unsaved work from your last session.",
      actionLabel: "Restore",
      dismissible: true,
    });
  }
  if (!costSheet && !linkedFile) {
    notices.push({
      id: "sheet",
      tone: "info",
      icon: Table2,
      text: "Load the registry cost sheet to fill in costs automatically when you add a TLD.",
      actionLabel: "Set up",
    });
  }
  const onNoticeAction = (id) => {
    if (id === "permission") refreshLinkedSheet({ prompt: true, force: true });
    else if (id === "autosave") restoreAutosave();
    else if (id === "sheet") setView("settings");
  };
  const onNoticeDismiss = (id) => {
    if (id === "autosave") setAutosaveBanner(false);
  };

  return (
    <div
      className={`${T.bg} ${T.text} min-h-screen w-full font-sans transition-colors duration-300 ${view === "editor" ? "pb-16 lg:pb-0" : ""}`}
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

      {/* ------------------------------ BODY ------------------------------ */}
      <main className="no-print max-w-[1500px] mx-auto px-4 sm:px-6 py-6">
        {view === "editor" && (
          <EditorView
            T={T}
            loadToken={loadToken}
            notices={notices}
            onNoticeAction={onNoticeAction}
            onNoticeDismiss={onNoticeDismiss}
            proposal={proposal}
            setProposal={editProposal}
            brands={BRANDS}
            currencies={CURRENCIES}
            onCurrencyChange={changeCurrency}
            recentResellers={recentResellers}
            onPickReseller={(name) =>
              editProposal((p) => ({ ...p, resellerName: name }))
            }
            saveState={saveState}
            onSave={saveDraft}
            onNew={newProposal}
            onExportPdf={exportPdf}
            onExportExcel={exportExcel}
            onCopyTable={copyTable}
            undo={undo}
            redo={redo}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            groups={groups}
            summary={summary}
            currency={currency}
            thresholds={thresholds}
            costSheet={costSheet}
            tldSuggestions={tldSuggestions}
            favoriteTlds={favoriteTlds}
            fileInputRef={fileInputRef}
            onImport={handleImport}
            onFillFromSheet={fillFromSheet}
            onBulkMargin={applyBulkMargin}
            onAddTld={addTld}
            onTldChange={changeGroupTld}
            onTldBlur={checkGroupDuplicate}
            onCellChange={updateRow}
            onPriceCommit={commitPrice}
            onUseSheetCost={takeSheetCost}
            onToggleStar={toggleGroupStar}
            onMove={moveGroup}
            onCopyGroup={copyGroup}
            onDeleteGroup={deleteGroup}
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
            setProposal={editProposal}
            thresholds={thresholds}
            setThresholds={setThresholds}
            isDark={isDark}
            setIsDark={setIsDark}
            costSheet={costSheet}
            onLoadCostSheet={loadCostSheet}
            onClearCostSheet={clearCostSheet}
            linkedFile={linkedFile}
            onLinkSheet={linkSheetFile}
            onUnlinkSheet={unlinkSheetFile}
            onCheckSheet={() => refreshLinkedSheet({ prompt: true, force: true })}
            sheetUrl={sheetUrl}
            setSheetUrl={setSheetUrl}
          />
        )}
      </main>

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
              is already in this proposal. Merge the two lines? Any cost or
              price you entered here will be copied into the existing line.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  mergeGroups(dupModal.groupId, dupModal.existingId);
                  setDupModal(null);
                  pushToast(`Merged into the existing ${dupModal.value} line`);
                }}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white text-sm font-medium"
              >
                Merge into existing line
              </button>
              <button
                onClick={() => setDupModal(null)}
                className={`w-full py-2 rounded-lg border ${T.border} text-sm font-medium ${T.hover}`}
              >
                Keep both
              </button>
              <button
                onClick={() => {
                  changeGroupTld(dupModal.groupId, "");
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
  costSheet,
  onLoadCostSheet,
  onClearCostSheet,
  linkedFile,
  onLinkSheet,
  onUnlinkSheet,
  onCheckSheet,
  sheetUrl,
  setSheetUrl,
}) {
  const sheetInputRef = useRef(null);
  const sheetAgeDays = costSheet
    ? Math.floor((new Date() - new Date(costSheet.loadedAt)) / 86400000)
    : null;
  const currencySummary = costSheet
    ? Object.entries(costSheet.currencies)
        .filter(([, n]) => n > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([code, n]) => `${n} ${code}`)
        .join(", ")
    : "";
  const validSheetUrl = /^https:\/\//i.test(sheetUrl.trim());

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
        <div>
          <div className="font-medium text-sm">Registry cost sheet</div>
          <p className={`text-xs mt-1 ${T.muted}`}>
            Load the product team's TLD registry pricing workbook (.xlsx).
            Picking a TLD then fills its cost as registry fee + ICANN fee. The
            sheet stays in this browser only - it's never uploaded or included
            in exports.
          </p>
        </div>

        {fileLinkSupported && !linkedFile && (
          <div
            className={`rounded-lg border border-indigo-500/25 bg-indigo-500/5 p-3 text-xs ${T.muted} flex flex-col gap-1`}
          >
            <div className={`font-medium ${T.text}`}>
              Keep costs up to date automatically
            </div>
            <ol className="list-decimal ml-4 flex flex-col gap-0.5">
              <li>
                In SharePoint, open the folder with the workbook and choose{" "}
                <b>Add shortcut to My files</b>, so OneDrive syncs it to this
                PC.
              </li>
              <li>
                Click <b>Link sheet file</b> below and pick the workbook from
                your OneDrive folder.
              </li>
            </ol>
            <div>
              Margin IQ then re-reads it every time you open the app or come
              back to this tab, and reloads costs whenever the product team
              changes it.
            </div>
          </div>
        )}

        {costSheet ? (
          <div
            className={`rounded-lg border ${T.border} p-3 text-sm flex flex-col gap-1`}
          >
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span className="truncate">
                {costSheet.sourceName || "Cost sheet"}
              </span>
            </div>
            <div className={`text-xs ${T.muted}`}>
              {costSheet.count} TLDs from "{costSheet.sheetName}" - loaded{" "}
              {fmtDate(costSheet.loadedAt)}
              {costSheet.fileModified
                ? ` - file modified ${fmtDateTime(costSheet.fileModified)}`
                : ""}
            </div>
            {linkedFile && (
              <div className="text-xs text-emerald-500 flex items-center gap-1">
                <Link2 size={12} className="shrink-0" /> Linked to{" "}
                {linkedFile.name} - checks for updates automatically
              </div>
            )}
            <div className={`text-xs ${T.muted}`}>
              Currencies: {currencySummary}
            </div>
            {costSheet.conflicts.length > 0 && (
              <div className="text-xs text-amber-500">
                Listed more than once in the sheet:{" "}
                {costSheet.conflicts.map((t) => `.${t}`).join(", ")} - check
                these costs with the product team.
              </div>
            )}
            {!linkedFile && sheetAgeDays >= STALE_SHEET_DAYS && (
              <div className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle size={12} /> Loaded {sheetAgeDays} days ago -
                reload the latest version to pick up registry price changes.
              </div>
            )}
          </div>
        ) : (
          <div
            className={`rounded-lg border border-dashed ${T.border} p-3 text-xs ${T.muted}`}
          >
            No cost sheet loaded yet.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {fileLinkSupported && !linkedFile && (
            <button
              onClick={onLinkSheet}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white font-medium"
            >
              <Link2 size={14} /> Link sheet file
            </button>
          )}
          {linkedFile && (
            <>
              <button
                onClick={onCheckSheet}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white font-medium"
              >
                <RefreshCw size={14} /> Check now
              </button>
              <button
                onClick={onUnlinkSheet}
                className={`text-sm px-3 py-2 rounded-lg border ${T.border} ${T.hover}`}
              >
                Unlink
              </button>
            </>
          )}
          <button
            onClick={() => sheetInputRef.current?.click()}
            className={
              fileLinkSupported
                ? `flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border ${T.border} ${T.hover}`
                : "flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 text-white font-medium"
            }
            title="Load a copy once - it won't update by itself"
          >
            <Upload size={14} />{" "}
            {fileLinkSupported
              ? "Load a copy once"
              : costSheet
                ? "Reload sheet"
                : "Load cost sheet"}
          </button>
          <input
            ref={sheetInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onLoadCostSheet}
          />
          {validSheetUrl && (
            <a
              href={sheetUrl.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border ${T.border} ${T.hover}`}
            >
              <ExternalLink size={14} /> Open in SharePoint
            </a>
          )}
          {costSheet && (
            <button
              onClick={onClearCostSheet}
              className={`text-sm px-3 py-2 rounded-lg ${T.muted} ${T.hover}`}
            >
              Remove
            </button>
          )}
        </div>

        {!fileLinkSupported && (
          <p className="text-xs text-amber-500">
            Automatic updates need Microsoft Edge or Google Chrome. In this
            browser, reload the sheet whenever the product team changes it.
          </p>
        )}

        <Field label="Sheet link (optional)" T={T}>
          <input
            className={`w-full rounded-lg border px-3 py-2 text-sm ${T.input}`}
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Paste the SharePoint link to the workbook"
          />
          <p className={`text-xs mt-1 ${T.muted}`}>
            Saved in this browser so you can jump to the latest version,
            download it (File, then Save a copy, then Download) and reload it
            here.
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
