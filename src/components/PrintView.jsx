import { OPERATIONS } from "../lib/pricing.js";
import { fmtDate, fmtMoney } from "../lib/format.js";

/*
  Client-facing quote, rendered only when printing / saving as PDF.
  It shows prices only - never cost, margin or the USD reference.
*/
export default function PrintView({ proposal, draftId, rows, currency, tldCount }) {
  const ref = draftId.replace("proposal_", "").toUpperCase();
  const meta = [
    ["Prepared for", proposal.resellerName || "-"],
    ["Currency", `${proposal.currency} (${currency.symbol.trim()})`],
    ["Valid from", fmtDate(proposal.startDate)],
    ["Valid until", fmtDate(proposal.endDate)],
  ];

  return (
    <div className="print-only text-zinc-900 text-[12px]">
      <div className="print-accent h-1.5 rounded-full mb-7" />

      <div className="print-avoid-break flex items-start justify-between gap-6 mb-6">
        <div>
          <div className="font-display font-extrabold text-[26px] leading-none">{proposal.company}</div>
          <div className="mt-1.5 text-[13px] text-zinc-500">Domain pricing proposal</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-400 font-semibold">Quote</div>
          <div className="font-semibold font-mono-num">#{ref}</div>
          <div className="text-zinc-500">{fmtDate(new Date().toISOString())}</div>
        </div>
      </div>

      <div className="print-avoid-break print-panel grid grid-cols-4 gap-4 rounded-xl px-5 py-4 mb-7">
        {meta.map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-semibold">{label}</div>
            <div className="mt-0.5 font-semibold text-[13px]">{value}</div>
          </div>
        ))}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="print-thead">
            <th className="text-left py-2.5 px-3 rounded-l-lg font-semibold">TLD</th>
            {OPERATIONS.map((op, i) => (
              <th
                key={op}
                className={`text-right py-2.5 px-3 font-semibold ${i === OPERATIONS.length - 1 ? "rounded-r-lg" : ""}`}
              >
                {op}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={p.tld} className={`print-avoid-break ${i % 2 ? "print-zebra" : ""}`}>
              <td className="py-2.5 px-3 font-semibold">{p.tld}</td>
              {OPERATIONS.map((op) => (
                <td key={op} className="py-2.5 px-3 text-right font-mono-num">
                  {p[op] !== "" ? fmtMoney(p[op], currency.symbol) : <span className="text-zinc-300">-</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-avoid-break mt-3 flex justify-between text-[11px] text-zinc-500">
        <span>
          {tldCount} TLD{tldCount === 1 ? "" : "s"} quoted · prices per year in {proposal.currency}
        </span>
        {proposal.preparedBy && <span>Prepared by {proposal.preparedBy}</span>}
      </div>

      {proposal.notes && (
        <div className="print-avoid-break print-panel mt-6 rounded-xl px-5 py-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-semibold mb-1">Notes</div>
          <div className="whitespace-pre-line leading-relaxed">{proposal.notes}</div>
        </div>
      )}

      <div className="print-page-footer print-avoid-break">
        <span>
          {proposal.company} · Prepared for {proposal.resellerName || "-"}
        </span>
        <span>Confidential - not for redistribution</span>
      </div>
    </div>
  );
}
