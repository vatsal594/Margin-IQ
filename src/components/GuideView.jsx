import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  HelpCircle,
  Keyboard,
  MoreHorizontal,
  Percent,
  Save,
  Shield,
  Sparkles,
  Star,
  Table2,
} from "lucide-react";
import { useEffect } from "react";
import CostSheetSetup from "./CostSheetSetup.jsx";
import { BUSINESS_UNITS } from "../lib/businessUnits.js";
import { HEALTH } from "../lib/pricing.js";
import { APP_HOST, APP_URL } from "../lib/links.js";

/* ---------------------------------------------------------------------- */
/* How to use Margin IQ                                                    */
/* ---------------------------------------------------------------------- */

const SECTIONS = [
  { id: "quick-start", label: "Quick start", icon: Sparkles },
  { id: "cost-sheet", label: "Cost sheet", icon: Table2 },
  { id: "pricing", label: "Pricing TLDs", icon: Percent },
  { id: "forex", label: "Business units & forex", icon: ArrowLeftRight },
  { id: "margin", label: "Margin health", icon: Gauge },
  { id: "proposals", label: "Saving & proposals", icon: Save },
  { id: "export", label: "Sending the quote", icon: Download },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "data", label: "Your data", icon: Shield },
  { id: "faq", label: "Troubleshooting", icon: HelpCircle },
];

/* ---------- small building blocks ---------- */

function Kbd({ T, children }) {
  return (
    <kbd
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-sans font-medium ${
        T.isDark ? "border-zinc-700 bg-zinc-800 text-zinc-200" : "border-zinc-300 bg-white text-zinc-700"
      } shadow-[0_1px_0_rgba(0,0,0,0.08)]`}
    >
      {children}
    </kbd>
  );
}

function Ui({ T, children }) {
  // A UI label as it appears in the app, e.g. a button name.
  return (
    <span className={`${T.chip} px-1.5 py-0.5 text-[12px] font-medium whitespace-nowrap`}>{children}</span>
  );
}

function Section({ T, id, icon: Icon, title, intro, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Icon size={16} />
        </span>
        <h2 className="font-display font-bold text-xl">{title}</h2>
      </div>
      {intro && <p className={`text-sm ${T.muted} mb-4 max-w-3xl`}>{intro}</p>}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Card({ T, children, className = "" }) {
  return <div className={`${T.card} p-5 text-sm leading-relaxed ${className}`}>{children}</div>;
}

function Tip({ T, children }) {
  return (
    <div
      className={`rounded-xl border border-indigo-500/20 ${
        T.isDark ? "bg-indigo-500/[0.07]" : "bg-indigo-50/70"
      } px-4 py-3 text-sm flex gap-2.5`}
    >
      <Sparkles size={15} className="text-indigo-500 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function Steps({ T, steps }) {
  return (
    <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {steps.map(([title, body], i) => (
        <li key={title} className={`${T.card} p-4 flex gap-3`}>
          <span className="w-7 h-7 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-sm">{title}</div>
            <div className={`text-sm ${T.muted} mt-0.5`}>{body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function List({ T, items }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
          <span className={T.text}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- a mini preview of one pricing cell ---------- */

function CellPreview({ T }) {
  return (
    <div className={`rounded-xl ${T.surfaceAlt} p-4 flex flex-wrap items-start gap-6`}>
      <div className="w-44 flex flex-col gap-1">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${T.faint}`}>Registration</span>
        <div className={`rounded-lg border px-2.5 py-2 text-sm font-medium text-right font-mono-num ${T.input}`}>12.99</div>
        <div className={`flex items-center justify-end gap-1 text-[11px] ${T.faint}`}>
          cost <span className="font-mono-num">10.46</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        <span className={`self-end text-[11px] px-2 py-0.5 rounded-full border font-mono-num ${HEALTH.good.pill}`}>
          19.5% · $2.53
        </span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] flex-1 min-w-[240px]">
        <dt className="font-semibold">Top box</dt>
        <dd className={T.muted}>Your selling price (what the client pays).</dd>
        <dt className="font-semibold">cost</dt>
        <dd className={T.muted}>Registry fee + ICANN fee. Click it to type your own.</dd>
        <dt className="font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> dot
        </dt>
        <dd className={T.muted}>The cost came from the cost sheet.</dd>
        <dt className="font-semibold">Pill</dt>
        <dd className={T.muted}>Margin % and profit for this price, coloured by health.</dd>
      </dl>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

export default function GuideView({ T, setView, onNew, section }) {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Opened from a "how do I set this up?" link: jump to that section.
  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }, [section]);

  return (
    <div className="flex gap-8">
      {/* contents */}
      <nav className="hidden xl:block w-56 shrink-0" aria-label="Guide contents">
        <div className="sticky top-6 flex flex-col gap-0.5">
          <div className={`text-[11px] font-semibold uppercase tracking-wider ${T.faint} px-3 mb-2`}>On this page</div>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left ${T.muted} ${T.hover}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1 min-w-0 max-w-5xl flex flex-col gap-10 pb-10">
        {/* hero */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-lg shadow-indigo-600/20">
          <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute right-24 -bottom-20 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
              <BookOpen size={14} /> Guide
            </div>
            <h1 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl leading-tight">
              How to use Margin IQ
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/85">
              Build a TLD pricing quote for a reseller in a few minutes: costs fill in from the
              registry cost sheet, you set the prices, Margin IQ shows your margin, and you send a
              client-ready PDF that never shows your costs.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={onNew}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-indigo-700 px-4 py-2 text-sm font-semibold hover:bg-indigo-50 transition"
              >
                Start a proposal <ArrowRight size={15} />
              </button>
              <button
                onClick={() => go("cost-sheet")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-semibold transition"
              >
                <Table2 size={15} /> Set up the cost sheet
              </button>
            </div>
          </div>
        </div>

        {/* mobile contents */}
        <div className="xl:hidden flex flex-wrap gap-1.5">
          {SECTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => go(id)} className={`${T.btn} text-xs px-2.5 py-1`}>
              {label}
            </button>
          ))}
        </div>

        <Section T={T} id="quick-start" icon={Sparkles} title="Quick start" intro="The whole flow, from a blank proposal to a quote you can send.">
          <Steps
            T={T}
            steps={[
              ["Link the cost sheet (once)", <>Follow <button onClick={() => go("cost-sheet")} className="text-indigo-500 font-medium hover:underline">the 5-minute setup</button> below so costs fill in by themselves.</>],
              ["Start a proposal", <>Click <Ui T={T}>New proposal</Ui>, then fill in the reseller name and pick the <b>business unit</b> - it sets the currency.</>],
              ["Add TLDs", <>Type a TLD such as <code>.com</code>. Its Registration, Renewal, Transfer and Restore costs fill in from the sheet.</>],
              ["Set your prices", <>Type a price, or a margin like <code>20%</code>, in each cell - or use <Ui T={T}>Set margin</Ui> to price everything at once.</>],
              ["Check the margin", <>The strip above the grid shows estimated profit, overall margin and how many prices are healthy.</>],
              ["Save and send", <>Press <Ui T={T}>Save</Ui>, then <Ui T={T}>Export</Ui> → <b>PDF quote</b> or <b>Excel sheet</b> for the client.</>],
            ]}
          />
        </Section>

        <Section
          T={T}
          id="cost-sheet"
          icon={Table2}
          title="Connect the registry cost sheet"
          intro="The product team keeps registry costs in the Orderbox TLD Registry Pricing Data workbook on the Domain PMs SharePoint site. Follow these steps once and Margin IQ fills in costs - and keeps them up to date - for you."
        >
          <CostSheetSetup T={T} openSettings={() => setView("settings")} />
        </Section>

        <Section
          T={T}
          id="pricing"
          icon={Percent}
          title="Pricing TLDs"
          intro="Each TLD is one line with its four operations side by side - the same layout the client sees on the quote."
        >
          <CellPreview T={T} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card T={T}>
              <div className="font-semibold mb-2">Ways to set a price</div>
              <List
                T={T}
                items={[
                  <>Type the price, e.g. <code>12.99</code>.</>,
                  <>Type a target margin, e.g. <code>20%</code> - the price is worked out from the cost when you leave the box.</>,
                  <><Ui T={T}>Set margin</Ui> prices every empty cell (or all cells) at one margin.</>,
                  <>Leave an operation empty to leave it off the quote.</>,
                ]}
              />
            </Card>
            <Card T={T}>
              <div className="font-semibold mb-2">Handy extras</div>
              <List
                T={T}
                items={[
                  <><Kbd T={T}>Enter</Kbd> jumps to the next price, like a spreadsheet.</>,
                  <><Ui T={T}><MoreHorizontal size={12} /></Ui> on a line: move up/down, copy prices, remove.</>,
                  <><Star size={13} className="inline -mt-0.5 fill-amber-400 text-amber-400" /> Star a TLD to get a <b>Quick add</b> button for it.</>,
                  <><Ui T={T}>Fill costs</Ui> fills any empty costs from the sheet; <i>"Sheet cost … - use"</i> offers the sheet cost where you typed your own.</>,
                  <>Typing a TLD that's already listed offers to merge the two lines.</>,
                  <><Ui T={T}>Import</Ui> reads an Excel/CSV with columns TLD, Operation, Cost, SellingPrice.</>,
                ]}
              />
            </Card>
          </div>
        </Section>

        <Section
          T={T}
          id="forex"
          icon={ArrowLeftRight}
          title="Business units & forex"
          intro="The business unit decides the quote currency and the name on the client's PDF. Costs in another currency (most of the sheet is USD) are converted for you."
        >
          <Card T={T} className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className={`${T.surfaceAlt} text-[11px] uppercase tracking-wider ${T.faint}`}>
                <tr>
                  <th className="text-left font-semibold px-5 py-2.5">Business unit</th>
                  <th className="text-left font-semibold px-5 py-2.5">Quote currency</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${T.divider}`}>
                {BUSINESS_UNITS.map((u) => (
                  <tr key={u.name}>
                    <td className="px-5 py-2 flex items-center gap-2">
                      <Building2 size={13} className={T.muted} /> {u.name}
                    </td>
                    <td className="px-5 py-2 font-mono-num">{u.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card T={T}>
              <div className="font-semibold mb-2">How costs are converted</div>
              <div className={`rounded-lg ${T.surfaceAlt} px-3 py-2 font-mono-num text-[13px] mb-3`}>
                cost = sheet cost × rate × (1 + buffer)
              </div>
              <List
                T={T}
                items={[
                  <>The rate is today's <b>European Central Bank</b> reference rate, fetched automatically.</>,
                  <>The <b>forex buffer</b> (default 2%) protects your margin if the currency moves before the reseller pays.</>,
                  <>Each converted cost shows its source underneath, e.g. <code>= $10.46 @ 96.96</code>.</>,
                  <>Global units quote in USD, so USD costs are used as-is - no conversion, no buffer.</>,
                  <>Costs the sheet already lists in the unit's currency (e.g. <code>.in</code> in INR) are used as-is.</>,
                ]}
              />
            </Card>
            <Card T={T}>
              <div className="font-semibold mb-2">The Forex bar</div>
              <List
                T={T}
                items={[
                  <>Appears above the grid when quoting in a non-USD currency.</>,
                  <>Type your own rate (e.g. finance's) to override the reference rate; <i>"use the reference rate"</i> switches back.</>,
                  <>Change the buffer per proposal - consider more for volatile currencies like TRY or BRL.</>,
                  <>The rate is <b>saved with the proposal</b>, so an old quote doesn't change. <Ui T={T}>Update rate</Ui> fetches today's.</>,
                  <>Switching business unit after you've set prices asks whether to <b>convert your prices</b> to the new currency or keep the numbers.</>,
                ]}
              />
            </Card>
          </div>
        </Section>

        <Section
          T={T}
          id="margin"
          icon={Gauge}
          title="Margin health"
          intro="Every price gets a colour so weak or loss-making prices stand out. Margin is profit ÷ price."
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["loss", "Below cost - you'd lose money."],
              ["low", "Under your Low threshold (15% by default)."],
              ["good", "Between Low and Excellent."],
              ["excellent", "At or above Excellent (35% by default)."],
            ].map(([key, text]) => (
              <Card T={T} key={key} className="p-4">
                <span className={`inline-flex text-[11px] px-2 py-0.5 rounded-full border font-medium ${HEALTH[key].pill}`}>
                  {HEALTH[key].label}
                </span>
                <div className={`mt-2 text-[13px] ${T.muted}`}>{text}</div>
              </Card>
            ))}
          </div>
          <Tip T={T}>
            Change the thresholds in <Ui T={T}>Settings</Ui> → Margin health. The strip above the grid shows
            estimated profit, overall margin (total profit ÷ total of prices), the lowest margin and how many
            prices fall in each band.
          </Tip>
        </Section>

        <Section T={T} id="proposals" icon={Save} title="Saving & proposals">
          <Card T={T}>
            <List
              T={T}
              items={[
                <><Ui T={T}>Save</Ui> (or <Kbd T={T}>Ctrl</Kbd> <Kbd T={T}>S</Kbd>) stores the proposal. The header shows <i>Saved …</i> or <i>Unsaved changes</i>.</>,
                <>Margin IQ also autosaves your work in progress - if you close the tab, you'll be offered <Ui T={T}>Restore</Ui> next time.</>,
                <><b>Proposals</b> in the sidebar lists every saved quote with its profit, margin and TLD count. Search by reseller or filter by business unit and date.</>,
                <>Click a card to open it, the copy icon to <b>duplicate</b> it as a new quote (with fresh dates and today's rates), or the bin to delete it.</>,
                <>Quotes past their end date are marked <b>Expired</b>.</>,
                <>Undo / redo with <Kbd T={T}>Ctrl</Kbd> <Kbd T={T}>Z</Kbd> and <Kbd T={T}>Ctrl</Kbd> <Kbd T={T}>Y</Kbd>.</>,
              ]}
            />
          </Card>
        </Section>

        <Section
          T={T}
          id="export"
          icon={FileText}
          title="Sending the quote"
          intro="Everything the client receives shows prices only - never your cost, margin, forex rate or USD reference."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ["PDF quote", "Export → PDF quote opens the print dialog - choose Save as PDF. Branded with the business unit, quote number, validity and notes."],
              ["Excel sheet", "Export → Excel sheet downloads a .xlsx with the same prices, ready to email."],
              ["Copy table", "Export → Copy table puts the price table on the clipboard to paste into Excel or an email."],
            ].map(([title, text]) => (
              <Card T={T} key={title} className="p-4">
                <div className="font-semibold">{title}</div>
                <div className={`mt-1 text-[13px] ${T.muted}`}>{text}</div>
              </Card>
            ))}
          </div>
          <Tip T={T}>
            Add terms or special conditions in <b>Notes (shown on the quote)</b> under Edit details - they print
            at the bottom of the PDF.
          </Tip>
        </Section>

        <Section T={T} id="shortcuts" icon={Keyboard} title="Keyboard shortcuts">
          <Card T={T} className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className={`divide-y ${T.divider}`}>
                {[
                  [["Ctrl", "K"], "Quick actions (search any command)"],
                  [["Ctrl", "S"], "Save the proposal"],
                  [["Ctrl", "Z"], "Undo"],
                  [["Ctrl", "Y"], "Redo"],
                  [["Enter"], "Next price cell (in the grid)"],
                  [["Esc"], "Close a menu or dialog"],
                ].map(([keys, what]) => (
                  <tr key={what}>
                    <td className="px-5 py-2.5 w-40">
                      <span className="flex items-center gap-1">
                        {keys.map((k) => (
                          <Kbd T={T} key={k}>{k}</Kbd>
                        ))}
                      </span>
                    </td>
                    <td className={`px-5 py-2.5 ${T.muted}`}>{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Section>

        <Section T={T} id="data" icon={Shield} title="Where your data lives">
          <Card T={T}>
            <List
              T={T}
              items={[
                <>Proposals, settings and the cost sheet are stored <b>only in this browser</b> on this computer - nothing is sent to a server.</>,
                <>The cost sheet is never uploaded or put into exports. The only thing Margin IQ fetches from the internet is the daily exchange-rate table.</>,
                <>Always open Margin IQ at{" "}<a href={APP_URL} className="text-indigo-500 font-medium hover:underline">{APP_HOST}</a>{" "}and bookmark it. Your proposals and cost-sheet link are kept per browser, so using a different browser, PC or web address starts you with an empty Margin IQ.</>,
                <>Clearing your browser's site data (cookies and site data) removes your saved proposals and the cost-sheet link.</>,
              ]}
            />
          </Card>
        </Section>

        <Section T={T} id="faq" icon={HelpCircle} title="Troubleshooting">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["A cost didn't fill in", "Check the TLD is spelled as in the sheet (it shows \"Not in cost sheet\" if not). If it shows \"Sheet: … INR\" in amber, there's no exchange rate yet - click Update rate in the Forex bar."],
              ["The yellow \"Allow\" notice keeps coming back", "The browser forgot file permission. Click Allow, then choose \"Allow on every visit\" in the browser's prompt."],
              ["Costs look out of date", "Open Settings → Registry cost sheet and click Check now. If the file was moved or renamed, link it again."],
              ["My saved proposals disappeared", `You're probably in a different browser or on a different PC - proposals are kept in the browser you saved them in. Open ${APP_HOST} in that browser. If you cleared your browser's site data, they're gone.`],
              ["Margins look wildly wrong after changing unit", "Prices were kept as plain numbers in the new currency. Undo (Ctrl+Z), switch again and choose Convert prices."],
              ["The PDF has an extra blank page", "In the print dialog, set margins to Default and turn off headers and footers."],
            ].map(([q, a]) => (
              <Card T={T} key={q} className="p-4">
                <div className="font-semibold">{q}</div>
                <div className={`mt-1 text-[13px] ${T.muted}`}>{a}</div>
              </Card>
            ))}
          </div>
        </Section>

        <div className={`${T.card} p-6 flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <div className="font-display font-bold text-lg">Ready to build a quote?</div>
            <div className={`text-sm ${T.muted}`}>Open Quick actions any time with Ctrl K.</div>
          </div>
          <button onClick={onNew} className={`${T.btnPrimary} text-sm px-4 py-2`}>
            Start a proposal <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
