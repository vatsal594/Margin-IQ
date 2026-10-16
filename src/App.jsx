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
  AlertTriangle,
  CheckCircle2,
  Save,
  FilePlus2,
  Clock,
  Table2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  parseCostSheet,
  sheetTldSuggestions,
} from "./lib/costSheet.js";
import {
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
  sheetCostIn,
  calcRow,
  newTldRows,
  ensureGroups,
  groupRows,
  priceForMargin,
  parseMarginInput,
  parsePrice,
} from "./lib/pricing.js";
import { fmtMoney, fmtDate, fmtDateTime } from "./lib/format.js";
import { defaultFx, fetchUsdRates, plainRate, usdRate } from "./lib/fx.js";
import {
  BUSINESS_UNITS,
  DEFAULT_UNIT,
  currencyInfo,
  migrateCompany,
  unitByName,
} from "./lib/businessUnits.js";
import EditorView from "./components/EditorView.jsx";
import AppShell from "./components/AppShell.jsx";
import HistoryView from "./components/HistoryView.jsx";
import SettingsView from "./components/SettingsView.jsx";
import PrintView from "./components/PrintView.jsx";
import GuideView from "./components/GuideView.jsx";
import { makeTheme } from "./lib/theme.js";

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


const HISTORY_LIMIT = 50; // undo steps kept
const COALESCE_MS = 1000; // edits to one field closer than this = one undo step

function emptyProposal() {
  return {
    resellerName: "",
    currency: DEFAULT_UNIT.currency,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    offerDuration: "30 days",
    notes: "",
    preparedBy: "",
    company: DEFAULT_UNIT.name,
    fx: defaultFx(),
  };
}

// Older saved proposals may predate forex (`fx`) or business units
// ("ResellerClub" / "LogicBoxes" instead of a unit name).
const normalizeProposal = (p) => ({
  ...p,
  fx: p.fx || defaultFx(),
  company: migrateCompany(p.company, p.currency),
});

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
            className={`flex-1 ${isDark ? "text-zinc-200" : "text-zinc-700"}`}
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
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-[fadeIn_.15s_ease]"
      onClick={onClose}
    >
      <div
        className={`w-full ${width} rounded-2xl border shadow-2xl overflow-hidden animate-[modalIn_.18s_ease] ${
          isDark
            ? "border-zinc-800 bg-zinc-900 text-zinc-100"
            : "border-zinc-200 bg-white text-zinc-900"
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
  const [view, setView] = useState("editor"); // editor | history | settings | guide
  // Section of the guide to open at, e.g. "cost-sheet" from a setup link.
  const [guideSection, setGuideSection] = useState(null);
  const openGuide = (section = null) => {
    setGuideSection(section);
    setView("guide");
  };
  const navigate = (next) => {
    if (next === "guide") setGuideSection(null);
    setView(next);
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = loadSettings().sidebarCollapsed;
    if (typeof saved === "boolean") return saved;
    return window.innerWidth < 1600;
  });
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
    ...newTldRows(".com", costSheet, proposal.currency, proposal.fx),
    ...newTldRows(".net", costSheet, proposal.currency, proposal.fx),
  ]);
  const [draftId, setDraftId] = useState(() => uid("proposal"));
  // Bumped whenever a different proposal is loaded, so the editor resets its
  // own view state (e.g. whether the details card starts open).
  const [loadToken, setLoadToken] = useState(0);
  const [fxStatus, setFxStatus] = useState({ loading: false, error: null });
  const [proposals, setProposals] = useState([]);
  const [thresholds, setThresholds] = useState(() => ({
    ...DEFAULT_THRESHOLDS,
    ...loadSettings().thresholds,
  }));

  const history = useUndoHistory();

  const [toasts, setToasts] = useState([]);
  const [dupModal, setDupModal] = useState(null); // {groupId, existingId, value}
  const [confirmModal, setConfirmModal] = useState(null); // {title, body, onConfirm}
  const [unitSwitch, setUnitSwitch] = useState(null); // {unit, loading, error, rates}
  const [importReport, setImportReport] = useState(null); // {imported, skipped: [], warnings: []}
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [autosaveBanner, setAutosaveBanner] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const fileInputRef = useRef(null);
  const autosaveTimer = useRef(null);

  const currency = currencyInfo(proposal.currency);

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
    storage.set(
      "settings",
      JSON.stringify({ isDark, thresholds, sheetUrl, sidebarCollapsed }),
    );
  }, [isDark, thresholds, sheetUrl, sidebarCollapsed]);

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
    const restored = normalizeProposal(autosaveBanner.proposal);
    setProposal(restored);
    setRows(ensureGroups(autosaveBanner.rows, costSheet, restored.currency, restored.fx));
    resetHistory();
    setLoadToken((n) => n + 1);
    setAutosaveBanner(false);
    pushToast("Restored your last unsaved session");
  };

  /* ------------------------------- TLD rows ------------------------------- */
  // Each TLD is a group of four rows (one per operation) sharing `group`.
  const addTld = (tld = "") => {
    commitRows((r) => [...r, ...newTldRows(tld, costSheet, proposal.currency, proposal.fx)]);
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
            ? applySheetCost({ ...row, tld }, costSheet, proposal.currency, proposal.fx)
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
            ? applySheetCost(next, costSheet, proposal.currency, proposal.fx)
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
          ? applySheetCost({ ...row, cost: "" }, costSheet, proposal.currency, proposal.fx)
          : row,
      ),
    );
  };

  const fillFromSheet = () => {
    commitRows((r) =>
      r.map((row) => applySheetCost(row, costSheet, proposal.currency, proposal.fx)),
    );
    pushToast("Filled empty costs from the cost sheet");
  };

  // The business unit decides the quote currency. Switching units re-converts
  // every cost that came from the sheet into the new currency; an own rate
  // was "1 USD in the old currency", so it's dropped. When the currency
  // changes and prices are set, ask whether to convert them too - otherwise
  // $12.99 would silently become 12.99 in the new currency.
  const changeBusinessUnit = (name) => {
    const unit = unitByName(name);
    if (!unit) return;
    const pricesSet = rows.some((r) => parsePrice(r.price) !== null);
    if (unit.currency === proposal.currency || !pricesSet) {
      switchBusinessUnit(unit, { convertPrices: false });
      return;
    }
    const needsRates = plainRate(proposal.fx, proposal.currency, unit.currency) === null;
    setUnitSwitch({ unit, loading: needsRates, error: null, rates: null });
    if (needsRates) {
      fetchUsdRates().then(
        (rates) =>
          setUnitSwitch((s) => (s?.unit === unit ? { ...s, loading: false, rates } : s)),
        (err) =>
          setUnitSwitch((s) =>
            s?.unit === unit
              ? { ...s, loading: false, error: err?.message || "network error" }
              : s,
          ),
      );
    }
  };

  // Unit, currency, costs and (optionally) converted prices as one undo step.
  // `rates` are freshly fetched ECB rates, when the proposal had none.
  const switchBusinessUnit = (unit, { convertPrices, rates = null }) => {
    recordHistory("unit");
    const oldFx = { ...(proposal.fx || defaultFx()), ...(rates || {}) };
    const fx = { ...oldFx, override: null };
    const rate = convertPrices ? plainRate(oldFx, proposal.currency, unit.currency) : null;
    setProposal((p) => ({ ...p, company: unit.name, currency: unit.currency, fx }));
    setRows((r) =>
      r.map((row) => {
        const price = rate === null ? null : parsePrice(row.price);
        const next =
          price === null ? row : { ...row, price: String(Math.round(price * rate * 100) / 100) };
        return applySheetCost(next, costSheet, unit.currency, fx);
      }),
    );
    setUnitSwitch(null);
  };

  /* --------------------------------- forex -------------------------------- */
  // Changing the rate or buffer re-converts every cost that came from the
  // sheet; prices stay as typed, so margins update to match.
  const applyFx = (patch, { record = true } = {}) => {
    const live = liveRef.current;
    const fx = { ...(live.fx || defaultFx()), ...patch };
    if (record) recordHistory("fx");
    setProposal((p) => ({ ...p, fx }));
    setRows((r) =>
      r.map((row) => applySheetCost(row, live.costSheet, live.currency, fx)),
    );
  };

  const refreshRates = async ({ manual = true } = {}) => {
    setFxStatus({ loading: true, error: null });
    try {
      const { usd, date } = await fetchUsdRates();
      // A manual update means "use today's reference rate", so it also
      // clears any rate typed in by hand.
      applyFx(manual ? { usd, date, override: null } : { usd, date }, { record: manual });
      setFxStatus({ loading: false, error: null });
      if (manual) pushToast(`Exchange rates updated (${fmtDate(date)})`);
    } catch (err) {
      setFxStatus({ loading: false, error: err?.message || "network error" });
    }
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
      r.map((row) =>
        applySheetCost(row, sheet, liveRef.current.currency, liveRef.current.fx),
      ),
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
  const refreshRatesRef = useRef(null);
  useEffect(() => {
    liveRef.current = {
      currency: proposal.currency,
      fx: proposal.fx,
      costSheet,
      fileModified: costSheet?.fileModified ?? null,
    };
    refreshRef.current = refreshLinkedSheet;
    refreshRatesRef.current = refreshRates;
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
        const c = sheetCostIn(r, costSheet, proposal.currency, proposal.fx);
        return {
          ...r,
          ...calcRow(r, thresholds),
          sheet: c && { ...c, matches: c.value !== null },
        };
      }),
    [rows, thresholds, costSheet, proposal.currency, proposal.fx],
  );

  const groups = useMemo(() => groupRows(computed), [computed]);

  // Rates are needed when quoting in another currency, or when some sheet
  // costs are in a currency other than the proposal's.
  const needsFx = useMemo(
    () =>
      proposal.currency !== "USD" ||
      computed.some((r) => r.sheet && r.sheet.currency !== proposal.currency),
    [computed, proposal.currency],
  );
  const fxTriedRef = useRef(null);
  useEffect(() => {
    if (!needsFx || proposal.fx?.usd) return;
    // One automatic try per proposal; after that, "Update rate" retries.
    if (fxTriedRef.current === draftId) return;
    fxTriedRef.current = draftId;
    refreshRatesRef.current?.({ manual: false });
  }, [needsFx, proposal.fx?.usd, draftId]);

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
      lowestPct: withPrice.length ? Math.min(...withPrice.map((r) => r.marginPct)) : 0,
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
        setRows(newTldRows(".com", costSheet, proposal.currency, proposal.fx));
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
    const loaded = normalizeProposal(entry.data.proposal);
    setProposal(loaded);
    setRows(ensureGroups(entry.data.rows, costSheet, loaded.currency, loaded.fx));
    setDraftId(entry.id);
    resetHistory();
    setLoadToken((n) => n + 1);
    setView("editor");
  };

  const cloneDraft = (entry) => {
    const source = normalizeProposal(entry.data.proposal);
    // A clone is a new quote: fresh dates, and today's rates (keeping the
    // buffer) instead of the original proposal's.
    const cloned = {
      ...source,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      fx: { ...defaultFx(), bufferPct: source.fx.bufferPct },
    };
    setProposal(cloned);
    const groupIds = {};
    setRows(
      ensureGroups(entry.data.rows, costSheet, cloned.currency, cloned.fx).map((r) => {
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
    printWithTitle(`${proposal.company.replace(/\s+/g, "_")}_${safeName}_Pricing`);
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
              proposal.fx,
            ),
          );
          imported++;
        });
        if (imported > 0) {
          commitRows((prev) => [
            ...prev,
            ...ensureGroups(newRows, costSheet, proposal.currency, proposal.fx),
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
  const T = makeTheme(isDark);

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
    { label: "How to use Margin IQ (guide)", icon: BookOpen, action: () => openGuide() },
    { label: "Set up the cost sheet (guide)", icon: Table2, action: () => openGuide("cost-sheet") },
  ].filter((c) => c.label.toLowerCase().includes(paletteQuery.toLowerCase()));

  const filteredHistory = proposals.filter((p) => {
    const matchesName = p.resellerName
      .toLowerCase()
      .includes(historyQuery.toLowerCase());
    const created = p.createdDate ? p.createdDate.slice(0, 10) : "";
    const afterFrom = !historyFrom || created >= historyFrom;
    const beforeTo = !historyTo || created <= historyTo;
    const matchesUnit = !unitFilter || migrateCompany(p.company, p.currency) === unitFilter;
    return matchesName && afterFrom && beforeTo && matchesUnit;
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
  const sheetStatus = linkNeedsPermission && linkedFile
    ? { tone: "warn", label: "Waiting for access", detail: "Click Allow on the notice" }
    : costSheet
      ? {
          tone: "ok",
          label: `${costSheet.count} TLDs${linkedFile ? " · linked" : ""}`,
          detail: costSheet.fileModified
            ? `Updated ${fmtDateTime(costSheet.fileModified)}`
            : `Loaded ${fmtDate(costSheet.loadedAt)}`,
        }
      : { tone: "off", label: "Not set up", detail: "Fill costs automatically" };

  const onNoticeAction = (id) => {
    if (id === "permission") refreshLinkedSheet({ prompt: true, force: true });
    else if (id === "autosave") restoreAutosave();
    else if (id === "sheet") openGuide("cost-sheet");
  };
  const onNoticeDismiss = (id) => {
    if (id === "autosave") setAutosaveBanner(false);
  };

  return (
    <div
      className={`${T.bg} ${T.text} min-h-screen w-full transition-colors duration-300 ${view === "editor" ? "pb-16 md:pb-0" : ""}`}
    >
      <style>{`
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${T.scrollThumb}; border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${isDark ? "invert(1)" : "none"}; opacity: 0.6; cursor: pointer; }
        :root { color-scheme: ${isDark ? "dark" : "light"}; }
      `}</style>

      <AppShell
        T={T}
        view={view}
        setView={navigate}
        setIsDark={setIsDark}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onNew={newProposal}
        onPalette={() => setPaletteOpen(true)}
        preparedBy={proposal.preparedBy}
        historyCount={proposals.length}
        sheet={sheetStatus}
      >
        {view === "editor" && (
          <EditorView
            T={T}
            loadToken={loadToken}
            notices={notices}
            onNoticeAction={onNoticeAction}
            onNoticeDismiss={onNoticeDismiss}
            proposal={proposal}
            setProposal={editProposal}
            units={BUSINESS_UNITS}
            onBusinessUnitChange={changeBusinessUnit}
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
            showFx={needsFx}
            fx={proposal.fx}
            fxStatus={fxStatus}
            onFxOverride={(override) => applyFx({ override })}
            onFxBuffer={(bufferPct) => applyFx({ bufferPct })}
            onFxRefresh={() => refreshRates({ manual: true })}
            usdRate={usdRate(proposal.fx, proposal.currency)}
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
            unitFilter={unitFilter}
            setUnitFilter={setUnitFilter}
            thresholds={thresholds}
            onNew={newProposal}
            loadDraft={loadDraft}
            cloneDraft={cloneDraft}
            deleteDraft={deleteDraft}
          />
        )}
        {view === "guide" && (
          <GuideView T={T} setView={setView} onNew={newProposal} section={guideSection} />
        )}
        {view === "settings" && (
          <SettingsView
            T={T}
            proposal={proposal}
            setProposal={editProposal}
            onBusinessUnitChange={changeBusinessUnit}
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
            onOpenSetupGuide={() => openGuide("cost-sheet")}
            sheetUrl={sheetUrl}
            setSheetUrl={setSheetUrl}
          />
        )}
      </AppShell>

      <PrintView
        proposal={proposal}
        draftId={draftId}
        rows={pivotByTld()}
        currency={currency}
        tldCount={summary.count}
      />

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
      <Modal
        open={!!unitSwitch}
        onClose={() => setUnitSwitch(null)}
        isDark={isDark}
      >
        {unitSwitch &&
          (() => {
            const { unit, loading, error, rates } = unitSwitch;
            const from = proposal.currency;
            const to = unit.currency;
            const rate = plainRate({ ...proposal.fx, ...(rates || {}) }, from, to);
            const sample = rows.find((r) => parsePrice(r.price) !== null);
            const samplePrice = sample ? parsePrice(sample.price) : null;
            return (
              <div className="p-6">
                <div className="font-semibold mb-1">Convert prices to {to}?</div>
                <p className={`text-sm ${T.muted} mb-3`}>
                  {unit.name} quotes in {to}. Costs from the cost sheet are re-converted
                  automatically. Your selling prices are in {from} - convert them at
                  today&apos;s rate, or keep the numbers as they are (they&apos;ll then be
                  read as {to}).
                </p>
                <p className={`text-sm ${T.muted} mb-5`}>
                  {loading
                    ? `Fetching the ${from} -> ${to} rate...`
                    : rate === null
                      ? `No ${from} -> ${to} rate available${error ? ` (${error})` : ""}, so prices can't be converted.`
                      : `1 ${from} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${to} (no forex buffer)` +
                        (samplePrice !== null
                          ? `, e.g. ${fmtMoney(samplePrice, currencyInfo(from).symbol)} -> ${fmtMoney(Math.round(samplePrice * rate * 100) / 100, currencyInfo(to).symbol)}.`
                          : ".")}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => setUnitSwitch(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${T.muted} ${T.hover}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => switchBusinessUnit(unit, { convertPrices: false, rates })}
                    className={`px-4 py-2 rounded-lg border ${T.border} text-sm font-medium ${T.hover}`}
                  >
                    Keep the numbers
                  </button>
                  <button
                    onClick={() => switchBusinessUnit(unit, { convertPrices: true, rates })}
                    disabled={rate === null}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Convert prices to {to}
                  </button>
                </div>
              </div>
            );
          })()}
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
