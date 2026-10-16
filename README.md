# Margin IQ — Pricing Intelligence

A pricing and margin calculator for domain resellers. Build TLD pricing proposals, see your margins in real time as you price, and export a **client-ready PDF or Excel quote** that never shows your cost or markup — for any ResellerClub or LogicBoxes **business unit**.

## Features

- **One line per TLD** - each TLD shows Registration, Renewal, Transfer and Restore side by side, just like the client's quote. Type a price, or a margin like `20%` to have the price worked out from the cost; **Set margin** prices every cell at once.
- **Forex for non-USD quotes (e.g. INR)** - USD costs from the cost sheet are converted at the European Central Bank reference rate (fetched automatically, or type your own) plus a forex buffer (default 2%). Each converted cost shows its USD value underneath and profit shows its USD equivalent; the rate is saved with the proposal, and the client's quote shows the local currency only.
- **Live margin calculation** — enter cost and sell price per TLD/operation (Registration, Renewal, Transfer, Restore) and see margin ₹/%, health status, and totals update instantly.
- **Business units** - ResellerClub Global / India / Spain / China / UK / Turkey / Indonesia / Brazil and LogicBoxes Global / IN. The unit sets the quote currency (USD, INR, EUR, CNY, GBP, TRY, IDR, BRL) and is the name on the client's PDF and Excel.
- **Client-safe exports** — PDF and Excel outputs show pricing only. Cost, margin, and margin % never appear in exported documents; they stay in-app for internal use.
- **Registry cost sheet auto-fill** - load the product team's TLD registry pricing workbook in Settings; picking a TLD and operation then fills its cost (registry fee + ICANN fee) automatically. Costs in a different currency from the proposal are flagged instead of filled, and costs you type yourself are never overwritten.
- **Margin simulator** — quickly test "what if I priced this at X" for any row without editing the live proposal.
- **Import / export** — bulk-import pricing from Excel/CSV, export a clean pricing sheet back out.
- **Proposal history** — autosave, save drafts, clone, search, and filter past proposals by reseller or date.
- **Undo/redo, keyboard command palette (Ctrl+K), light/dark mode.**
- **Configurable margin health thresholds** — flag low-margin or loss-making rows.

## Tech stack

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [lucide-react](https://lucide.dev/) for icons
- [SheetJS (xlsx)](https://sheetjs.com/) for Excel import/export
- PDF export via the browser's native print-to-PDF (no external PDF library)

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Build for production

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Project structure

```
├── index.html
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx          # App state, history, settings, PDF/Excel export
│   ├── lib/costSheet.js # Registry cost sheet parser + TLD cost lookup
│   ├── lib/sheetLink.js # Remembers the linked (OneDrive-synced) cost sheet file
│   ├── lib/pricing.js   # Row model, margin maths, TLD grouping
│   ├── lib/format.js    # Money / date formatting
│   ├── lib/fx.js        # Exchange rates, buffer and conversion
│   ├── lib/businessUnits.js # Business units and their currencies
│   ├── components/      # EditorView, PricingGrid, SummaryPanel, Field
│   └── index.css        # Tailwind entry + base resets
├── vite.config.js
├── eslint.config.js
└── package.json
```

## Notes

- The registry cost sheet contains internal costs. It is only loaded from a file you pick and kept in your browser's `localStorage`; it is never bundled with the app, sent anywhere, or included in exports. Spreadsheet files are git-ignored so a downloaded copy can't be committed by accident. To keep it current automatically (Edge/Chrome): in SharePoint use **Add shortcut to My files** so OneDrive syncs the workbook, then **Settings -> Link sheet file** and pick the synced copy. Margin IQ re-reads it on every open and whenever you return to the tab. In other browsers, use **Load a copy once** and reload it when prices change (the app warns once a copy is over 30 days old).
- Exchange rates come from the free [Frankfurter](https://frankfurter.dev) API (ECB data). Only the request for USD rates is sent - never prices, costs or proposal details.
- All proposal data is stored locally in the browser (`localStorage`) — nothing is sent to a server.
- Exported PDFs are generated via the browser's print dialog ("Save as PDF"); no server-side rendering is involved.

## License

Add your preferred license here (e.g. MIT, proprietary/internal use only).
