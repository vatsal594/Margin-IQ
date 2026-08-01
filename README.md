# Margin IQ — Pricing Intelligence

A pricing and margin calculator for domain resellers. Build TLD pricing proposals, see your margins in real time as you price, and export a **client-ready PDF or Excel quote** that never shows your cost or markup — for either **ResellerClub** or **LogicBoxes**.

## Features

- **Live margin calculation** — enter cost and sell price per TLD/operation (Registration, Renewal, Transfer, Restore) and see margin ₹/%, health status, and totals update instantly.
- **Brand-aware proposals** — pick ResellerClub or LogicBoxes per proposal; the PDF header, footer, and Excel export automatically reflect the selected brand.
- **Client-safe exports** — PDF and Excel outputs show pricing only. Cost, margin, and margin % never appear in exported documents; they stay in-app for internal use.
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
│   ├── App.jsx          # Entire application (editor, history, settings, PDF/Excel export)
│   └── index.css        # Tailwind entry + base resets
├── vite.config.js
├── eslint.config.js
└── package.json
```

## Notes

- All proposal data is stored locally in the browser (`localStorage`) — nothing is sent to a server.
- Exported PDFs are generated via the browser's print dialog ("Save as PDF"); no server-side rendering is involved.

## License

Add your preferred license here (e.g. MIT, proprietary/internal use only).
