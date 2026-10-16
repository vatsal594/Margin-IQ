import { useRef } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Link2,
  Moon,
  RefreshCw,
  Sun,
  Upload,
} from "lucide-react";
import Field from "./Field.jsx";
import { LogoMark, SocialLinks } from "./Brand.jsx";
import { BUSINESS_UNITS } from "../lib/businessUnits.js";
import { fileLinkSupported } from "../lib/sheetLink.js";
import { fmtDate, fmtDateTime } from "../lib/format.js";
import { DOMAIN_PMS_FOLDER_URL } from "../lib/links.js";

const STALE_SHEET_DAYS = 30;

function Section({ T, title, description, children }) {
  return (
    <section className={`grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-8 py-6 border-t ${T.border} first:border-t-0 first:pt-0`}>
      <div>
        <h2 className="font-display font-bold text-base">{title}</h2>
        <p className={`mt-1 text-sm ${T.muted}`}>{description}</p>
      </div>
      <div className={`${T.card} p-5 flex flex-col gap-4 min-w-0`}>{children}</div>
    </section>
  );
}

export default function SettingsView({
  T,
  proposal,
  setProposal,
  onBusinessUnitChange,
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
  onOpenSetupGuide,
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
        .join(" · ")
    : "";
  const validSheetUrl = /^https:\/\//i.test(sheetUrl.trim());
  const input = `w-full rounded-lg border px-3 py-2 text-sm ${T.input}`;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <div className={`text-[11px] font-semibold uppercase tracking-wider ${T.faint}`}>Workspace</div>
        <h1 className="font-display font-bold text-2xl">Settings</h1>
        <p className={`text-sm ${T.muted}`}>Saved in this browser only.</p>
      </div>

      {/* ------------------------------ cost sheet ------------------------------ */}
      <Section
        T={T}
        title="Registry cost sheet"
        description="The product team's TLD pricing workbook. Adding a TLD fills its cost as registry fee + ICANN fee. It never leaves this browser or appears in exports."
      >
        {costSheet ? (
          <div className={`rounded-xl ${T.surfaceAlt} p-4 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-semibold truncate">{costSheet.sourceName || "Cost sheet"}</div>
              <div className={`text-xs ${T.muted}`}>
                {costSheet.count} TLDs from "{costSheet.sheetName}" · loaded {fmtDate(costSheet.loadedAt)}
                {costSheet.fileModified ? ` · file modified ${fmtDateTime(costSheet.fileModified)}` : ""}
              </div>
              <div className={`text-xs ${T.muted}`}>{currencySummary}</div>
              {linkedFile && (
                <div className="mt-1 text-xs text-emerald-500 flex items-center gap-1">
                  <Link2 size={12} /> Linked - checks for updates automatically
                </div>
              )}
              {costSheet.conflicts.length > 0 && (
                <div className="mt-1 text-xs text-amber-500">
                  Listed more than once: {costSheet.conflicts.map((t) => `.${t}`).join(", ")} - check
                  these with the product team.
                </div>
              )}
              {!linkedFile && sheetAgeDays >= STALE_SHEET_DAYS && (
                <div className="mt-1 text-xs text-amber-500 flex items-center gap-1">
                  <AlertTriangle size={12} /> Loaded {sheetAgeDays} days ago - reload the latest version.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`rounded-xl border border-dashed ${T.border} p-4 text-sm ${T.muted}`}>
            No cost sheet yet - costs have to be typed in by hand.
          </div>
        )}

        {!linkedFile && (
          <div className={`rounded-xl border border-indigo-500/20 ${T.isDark ? "bg-indigo-500/[0.07]" : "bg-indigo-50/70"} p-3 flex flex-wrap items-center gap-3 text-sm`}>
            <BookOpen size={16} className="text-indigo-500 shrink-0" />
            <span className="flex-1 min-w-[180px]">
              First time? The guide walks you through it click by click (about 5 minutes).
            </span>
            <button onClick={onOpenSetupGuide} className={`${T.btn} text-xs px-3 py-1.5`}>
              Step-by-step setup
            </button>
            <a
              href={DOMAIN_PMS_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${T.btn} text-xs px-3 py-1.5`}
            >
              <ExternalLink size={13} /> Open Domain PMs folder
            </a>
          </div>
        )}

        {fileLinkSupported && !linkedFile && (
          <ol className={`text-xs ${T.muted} list-decimal ml-4 flex flex-col gap-1`}>
            <li>
              In SharePoint, open the folder with the workbook and choose <b>Add shortcut to My files</b>{" "}
              so OneDrive syncs it to this PC.
            </li>
            <li>
              Click <b>Link sheet file</b> and pick it from your OneDrive folder. Margin IQ then re-reads it
              whenever you open the app.
            </li>
          </ol>
        )}

        <div className="flex flex-wrap gap-2">
          {fileLinkSupported && !linkedFile && (
            <button onClick={onLinkSheet} className={`${T.btnPrimary} text-sm px-3.5 py-2`}>
              <Link2 size={14} /> Link sheet file
            </button>
          )}
          {linkedFile && (
            <>
              <button onClick={onCheckSheet} className={`${T.btnPrimary} text-sm px-3.5 py-2`}>
                <RefreshCw size={14} /> Check now
              </button>
              <button onClick={onUnlinkSheet} className={`${T.btn} text-sm px-3.5 py-2`}>
                Unlink
              </button>
            </>
          )}
          <button
            onClick={() => sheetInputRef.current?.click()}
            className={`${fileLinkSupported ? T.btn : T.btnPrimary} text-sm px-3.5 py-2`}
            title="Load a copy once - it won't update by itself"
          >
            <Upload size={14} />
            {fileLinkSupported ? "Load a copy once" : costSheet ? "Reload sheet" : "Load cost sheet"}
          </button>
          <input
            ref={sheetInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onLoadCostSheet}
          />
          <a
            href={validSheetUrl ? sheetUrl.trim() : DOMAIN_PMS_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${T.btn} text-sm px-3.5 py-2`}
          >
            <ExternalLink size={14} /> Open in SharePoint
          </a>
          {costSheet && (
            <button onClick={onClearCostSheet} className={`text-sm px-3 py-2 rounded-lg ${T.muted} ${T.hover}`}>
              Remove
            </button>
          )}
        </div>
        {!fileLinkSupported && (
          <p className="text-xs text-amber-500">
            Automatic updates need Microsoft Edge or Google Chrome.
          </p>
        )}

        <Field label="SharePoint link (optional)" T={T}>
          <input
            className={input}
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Paste the link to the workbook for quick access"
          />
        </Field>
      </Section>

      {/* ------------------------------- defaults ------------------------------- */}
      <Section
        T={T}
        title="Proposal defaults"
        description="Your name goes on every quote. The business unit sets the quote currency and the name on the PDF."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prepared by" T={T}>
            <input
              className={input}
              value={proposal.preparedBy}
              placeholder="Your name"
              onChange={(e) => setProposal((p) => ({ ...p, preparedBy: e.target.value }))}
            />
          </Field>
          <Field label="Business unit" T={T}>
            <select
              className={input}
              value={proposal.company}
              onChange={(e) => onBusinessUnitChange(e.target.value)}
            >
              {BUSINESS_UNITS.map((u) => (
                <option key={u.name} value={u.name}>
                  {u.name} ({u.currency})
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* ------------------------------ thresholds ------------------------------ */}
      <Section
        T={T}
        title="Margin health"
        description="Where a price turns from Low to Healthy and from Healthy to Excellent. Anything below cost is always a Loss."
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Low below (%)" T={T}>
            <input
              type="number"
              className={`${input} font-mono-num`}
              value={thresholds.low}
              onChange={(e) => setThresholds((t) => ({ ...t, low: parseFloat(e.target.value) || 0 }))}
            />
          </Field>
          <Field label="Excellent from (%)" T={T}>
            <input
              type="number"
              className={`${input} font-mono-num`}
              value={thresholds.excellent}
              onChange={(e) => setThresholds((t) => ({ ...t, excellent: parseFloat(e.target.value) || 0 }))}
            />
          </Field>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden" aria-hidden="true">
          <div className="bg-amber-500" style={{ width: `${Math.min(100, Math.max(0, thresholds.low))}%` }} />
          <div
            className="bg-sky-500"
            style={{ width: `${Math.min(100, Math.max(0, thresholds.excellent - thresholds.low))}%` }}
          />
          <div className="bg-emerald-500 flex-1" />
        </div>
      </Section>

      {/* ------------------------------ appearance ------------------------------ */}
      <Section T={T} title="Appearance" description="Light or dark - remembered in this browser.">
        <div className="grid grid-cols-2 gap-3">
          {[
            [false, "Light", Sun],
            [true, "Dark", Moon],
          ].map(([dark, label, Icon]) => (
            <button
              key={label}
              onClick={() => setIsDark(dark)}
              aria-pressed={isDark === dark}
              className={`rounded-xl border p-3 text-left transition ${
                isDark === dark ? "border-indigo-500 ring-4 ring-indigo-500/15" : `${T.border} ${T.hover}`
              }`}
            >
              <div
                className={`h-14 rounded-lg mb-2 border ${
                  dark ? "bg-zinc-900 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                } p-2 flex flex-col gap-1`}
              >
                <div className={`h-2 w-1/2 rounded ${dark ? "bg-zinc-700" : "bg-zinc-300"}`} />
                <div className="h-2 w-1/3 rounded bg-indigo-500" />
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Icon size={14} /> {label}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* -------------------------------- about -------------------------------- */}
      <Section T={T} title="About" description="Margin IQ - TLD pricing proposals with live margins.">
        <div className="flex flex-wrap items-center gap-4">
          <LogoMark size={40} className="rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold">Margin IQ</div>
            <div className={`text-sm ${T.muted}`}>Made by Vatsal Savani</div>
          </div>
          <SocialLinks T={T} />
        </div>
      </Section>
    </div>
  );
}
