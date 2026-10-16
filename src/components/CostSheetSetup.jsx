import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  Cloud,
  ExternalLink,
  FileSpreadsheet,
  Folder,
  Link2,
  Lock,
  Table2,
  X,
} from "lucide-react";
import {
  APP_HOST,
  COST_SHEET_FILE_NAME,
  DOMAIN_PMS_FOLDER_URL,
  SYNCED_FOLDER_NAME,
} from "../lib/links.js";

/*
  Click-by-click setup for linking the registry cost sheet, written for
  someone who has never used SharePoint shortcuts. Each step has a small
  drawing of what they'll see, so it can be followed without help.
*/

/* ---------- pieces ---------- */

function Step({ T, n, title, time, children, last }) {
  return (
    <li className="relative pl-12 pb-8">
      {!last && (
        <span
          className={`absolute left-[15px] top-9 bottom-0 w-px ${T.isDark ? "bg-zinc-800" : "bg-zinc-200"}`}
          aria-hidden="true"
        />
      )}
      <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold flex items-center justify-center shadow-md shadow-indigo-600/25">
        {n}
      </span>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="font-display font-bold text-base">{title}</h3>
        {time && <span className={`text-[11px] ${T.faint}`}>{time}</span>}
      </div>
      <div className="mt-2 flex flex-col gap-3 text-sm leading-relaxed">{children}</div>
    </li>
  );
}

// A light "screenshot" frame for the drawings, always light like SharePoint.
function Mock({ title, children }) {
  return (
    <div className="rounded-xl border border-zinc-300 bg-white text-zinc-800 overflow-hidden shadow-sm max-w-2xl">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 border-b border-zinc-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-[11px] text-zinc-500 truncate">{title}</span>
      </div>
      <div className="p-3 text-[13px]">{children}</div>
    </div>
  );
}

// Pulsing ring around the thing to click.
function Hot({ children, className = "" }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="absolute -inset-1 rounded-lg ring-2 ring-indigo-500 animate-pulse" aria-hidden="true" />
      <span className="relative">{children}</span>
    </span>
  );
}

function Callout({ tone = "info", children }) {
  const styles = {
    info: "border-indigo-500/25 bg-indigo-500/[0.07]",
    warn: "border-amber-500/30 bg-amber-500/10",
    ok: "border-emerald-500/30 bg-emerald-500/10",
  };
  const Icon = tone === "warn" ? AlertTriangle : tone === "ok" ? CircleCheck : Check;
  const color = tone === "warn" ? "text-amber-500" : tone === "ok" ? "text-emerald-500" : "text-indigo-500";
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 flex gap-2.5 ${styles[tone]}`}>
      <Icon size={16} className={`${color} shrink-0 mt-0.5`} />
      <div>{children}</div>
    </div>
  );
}

function SpButton({ children, hot }) {
  const inner = (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-[12px] font-medium text-zinc-700">
      {children}
    </span>
  );
  return hot ? <Hot>{inner}</Hot> : inner;
}

/* ---------- drawings ---------- */

function SharePointToolbarMock() {
  return (
    <Mock title="APAC Domains PM - Documents - SharePoint">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-md bg-fuchsia-600 text-white text-[11px] font-bold flex items-center justify-center">DP</span>
        <span className="font-semibold text-[15px]">APAC Domains PM</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-zinc-200">
        <span className="font-semibold text-[14px] mr-2 flex items-center gap-1">
          Documents <ChevronDown size={13} />
        </span>
        <span className="relative">
          <SpButton hot>
            <ExternalLink size={12} /> Add shortcut to OneDrive <ChevronDown size={12} />
          </SpButton>
          {/* dropdown */}
          <span className="absolute left-0 top-full mt-2 z-10 w-44 rounded-lg border border-zinc-200 bg-white shadow-lg py-1 text-[12px]">
            <span className="flex items-center gap-2 px-3 py-1.5 text-zinc-500">
              <Folder size={13} /> Shortcuts
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold">
              <Folder size={13} /> My files
              <span className="ml-auto text-[10px] font-bold">← this</span>
            </span>
          </span>
        </span>
        <SpButton>Edit in grid view</SpButton>
        <SpButton>Pin to Quick access</SpButton>
      </div>
      <div className="pt-16 flex flex-col">
        {[
          ["Orderbox TLD Registry Pricing Data.xlsx", "Ankit Menon"],
          ["TLD Price Revisions - 2023 and 2024.xlsx", "Lynette Baya"],
        ].map(([name, who]) => (
          <div key={name} className="flex items-center gap-2 py-1.5 border-b border-zinc-100 last:border-0">
            <span className="w-4 h-4 rounded-full border border-zinc-300" aria-hidden="true" />
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="flex-1 truncate">{name}</span>
            <span className="text-[11px] text-zinc-500">{who}</span>
          </div>
        ))}
      </div>
    </Mock>
  );
}

function WrongWayMock() {
  return (
    <Mock title="Don't do this">
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-zinc-100">
        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
          <Check size={11} />
        </span>
        <FileSpreadsheet size={15} className="text-emerald-600" />
        <span className="flex-1 truncate">{COST_SHEET_FILE_NAME}</span>
        <CircleX size={16} className="text-red-500" />
      </div>
      <p className="mt-2 text-[12px] text-zinc-600">
        With the <b>file ticked</b>, "Add shortcut" only adds a link to that one file - it
        won't sync to your PC and Margin IQ can't read it.
      </p>
    </Mock>
  );
}

function ExplorerMock() {
  return (
    <Mock title="File Explorer">
      <div className="flex flex-wrap items-center gap-1 text-[12px] text-zinc-600 pb-2 border-b border-zinc-200">
        <Cloud size={13} className="text-sky-600" />
        OneDrive - Newfold Digital, Inc
        <ChevronRight size={12} />
        <span className="font-semibold text-zinc-800">{SYNCED_FOLDER_NAME}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-[12px] pt-2">
        <span className="text-zinc-400 text-[11px]">Name</span>
        <span className="text-zinc-400 text-[11px]">Type</span>
        <span className="text-zinc-400 text-[11px] text-right">Size</span>
        <span className="flex items-center gap-1.5 font-medium py-1 bg-emerald-50 -mx-1 px-1 rounded">
          <FileSpreadsheet size={14} className="text-emerald-600" /> {COST_SHEET_FILE_NAME}
        </span>
        <span className="py-1 bg-emerald-50">Excel</span>
        <span className="py-1 text-right bg-emerald-50 -mx-1 px-1 rounded font-semibold">~145 KB</span>
        <span className="flex items-center gap-1.5 py-1 text-zinc-500">
          <FileSpreadsheet size={14} className="text-emerald-600" /> TLD Price Revisions - 2023 and 2024.xlsx
        </span>
        <span className="py-1 text-zinc-500">Excel</span>
        <span className="py-1 text-right text-zinc-500">...</span>
      </div>
    </Mock>
  );
}

function PermissionMock() {
  return (
    <Mock title="Your browser">
      <div className="rounded-lg border border-zinc-200 shadow-md p-3 max-w-xs">
        <div className="text-[12px] text-zinc-500">{APP_HOST} wants to</div>
        <div className="flex items-center gap-1.5 font-semibold mt-0.5">
          <Lock size={13} /> View files
        </div>
        <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
          <Hot className="w-full">
            <span className="block w-full text-center rounded-full bg-indigo-600 text-white font-semibold py-1.5 px-3">
              Allow on every visit
            </span>
          </Hot>
          <span className="block text-center rounded-full border border-zinc-300 py-1.5">Allow this time</span>
          <span className="block text-center rounded-full border border-zinc-300 py-1.5 text-zinc-500">Don't allow</span>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-zinc-600">
        Wording differs a little between Chrome and Edge. If you only see <b>View files</b> /
        <b> Allow</b>, click that.
      </p>
    </Mock>
  );
}

function DoneMock({ T }) {
  return (
    <div className={`rounded-xl border ${T.border} ${T.surface} p-3 max-w-xs`}>
      <div className="flex items-center gap-2 text-xs font-medium">
        <Table2 size={13} className="text-indigo-500" /> Cost sheet
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
      </div>
      <div className="mt-1 text-xs">597 TLDs · linked</div>
      <div className={`text-[11px] ${T.muted}`}>Updated 09 Oct, 05:54 PM</div>
    </div>
  );
}

/* ---------- the walkthrough ---------- */

export default function CostSheetSetup({ T, openSettings }) {
  const btnPrimary = `${T.btnPrimary} text-sm px-4 py-2 self-start`;
  return (
    <div className="flex flex-col gap-4">
      <div className={`${T.card} p-5 flex flex-wrap items-center gap-4`}>
        <div className="flex-1 min-w-[220px]">
          <div className="font-semibold">You'll do this once - about 5 minutes.</div>
          <div className={`text-sm ${T.muted}`}>
            Afterwards, every time the product team updates a registry price, Margin IQ picks it up
            by itself. Use <b>Microsoft Edge</b> or <b>Google Chrome</b>, and make sure <b>OneDrive</b>
            is running on your PC (cloud icon in the taskbar).
          </div>
        </div>
        <a href={DOMAIN_PMS_FOLDER_URL} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
          <ExternalLink size={15} /> Open Domain PMs folder
        </a>
      </div>

      <ol className={`${T.card} p-5 sm:p-6`}>
        <Step T={T} n={1} title="Open the Domain PMs folder" time="30 sec">
          <p>
            Click the button below. It opens the <b>Documents</b> folder of the <b>APAC Domains PM</b> SharePoint
            site. Sign in with your Newfold account if asked.
          </p>
          <a href={DOMAIN_PMS_FOLDER_URL} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
            <ExternalLink size={15} /> Open Domain PMs folder
          </a>
          <p className={T.muted}>
            You should see the file <b>{COST_SHEET_FILE_NAME}</b> in the list.
          </p>
        </Step>

        <Step T={T} n={2} title="Add the folder to your OneDrive" time="30 sec">
          <p>
            <b>Don't tick any file.</b> In the toolbar at the top, click{" "}
            <b>Add shortcut to OneDrive</b>, then choose <b>My files</b>.
          </p>
          <SharePointToolbarMock />
          <Callout tone="warn">
            If you ticked the file first, untick it (or click the ✕ at the right of the toolbar) so the button adds
            the <b>whole folder</b>.
          </Callout>
          <WrongWayMock />
          <p className={T.muted}>
            Don't see the button? It may be in the <b>••• (More)</b> menu at the end of the toolbar. If there's only a <b>Sync</b> button,
            click that instead - it does the same job.
          </p>
        </Step>

        <Step T={T} n={3} title="Check it's on your PC" time="1-2 min">
          <p>
            Wait a minute or two, then open <b>File Explorer</b> and click <b>OneDrive - Newfold Digital, Inc</b>{" "}
            in the left panel. A new folder <b>{SYNCED_FOLDER_NAME}</b> appears, with the workbook inside.
          </p>
          <ExplorerMock />
          <Callout tone="warn">
            Pick the file that's an <b>Excel</b> file of about <b>145 KB</b>. If you see one ending in{" "}
            <b>.url</b> or of 1 KB, that's only a link (from ticking the file in step 2) - delete it and redo step
            2. Ignore any "Copy" files you made yourself; they don't update.
          </Callout>
        </Step>

        <Step T={T} n={4} title="Link it in Margin IQ" time="30 sec">
          <p>
            Open <b>Settings → Registry cost sheet</b>, click <b>Link sheet file</b>, go to{" "}
            <b>OneDrive - Newfold Digital, Inc → {SYNCED_FOLDER_NAME}</b> and choose{" "}
            <b>{COST_SHEET_FILE_NAME}</b>.
          </p>
          <button onClick={openSettings} className={btnPrimary}>
            <Link2 size={15} /> Open Settings → Cost sheet <ArrowRight size={15} />
          </button>
        </Step>

        <Step T={T} n={5} title="Allow access" time="5 sec">
          <p>
            Your browser asks whether Margin IQ may view the file. Choose <b>Allow on every visit</b> so it doesn't
            ask again.
          </p>
          <PermissionMock />
        </Step>

        <Step T={T} n={6} title="Done - check it worked" last>
          <p>
            The <b>Cost sheet</b> card in the sidebar turns <b className="text-emerald-500">green</b> and shows the
            number of TLDs. Add <b>.com</b> to a proposal - its costs fill in by themselves.
          </p>
          <DoneMock T={T} />
          <Callout tone="ok">
            From now on Margin IQ re-reads the file whenever you open it or come back to the tab. If a yellow{" "}
            <b>Allow</b> notice appears one day, just click it.
          </Callout>
        </Step>
      </ol>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          ["\"You need permission\" when opening the folder", "Your account doesn't have access to the Domain PMs site yet. Ask the Domain PM team to add you, then start again at step 1."],
          ["Nothing appears in File Explorer", "Check OneDrive is running and signed in with your Newfold account (cloud icon in the taskbar). Syncing can take a few minutes the first time."],
          ["\"Link sheet file\" is missing in Settings", "You're on Firefox or Safari. Use Edge or Chrome - or click \"Load a copy once\" and reload the sheet whenever prices change."],
          ["Costs don't fill in after linking", "Make sure you picked the ~145 KB Excel file, not a .url link or your own copy. In Settings, Unlink and link the right file."],
        ].map(([q, a]) => (
          <div key={q} className={`${T.card} p-4`}>
            <div className="font-semibold text-sm flex items-start gap-2">
              <X size={14} className="text-red-500 mt-0.5 shrink-0" /> {q}
            </div>
            <div className={`mt-1 text-[13px] ${T.muted}`}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
