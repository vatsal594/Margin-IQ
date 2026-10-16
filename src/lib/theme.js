/* ---------------------------------------------------------------------- */
/* Design tokens                                                           */
/* One place for the app's look. Views receive these as `T` and combine    */
/* them, so light/dark and the palette stay consistent everywhere.         */
/* Palette: zinc neutrals + a single indigo->violet accent (from the logo). */
/* ---------------------------------------------------------------------- */

export function makeTheme(isDark) {
  const d = (dark, light) => (isDark ? dark : light);
  const surface = d("bg-zinc-900", "bg-white");
  const border = d("border-zinc-800", "border-zinc-200");
  const hover = d(
    "hover:bg-zinc-800/80 transition-colors duration-150",
    "hover:bg-zinc-100 transition-colors duration-150",
  );
  return {
    isDark,
    bg: d("bg-zinc-950", "bg-[#f5f6f8]"),
    surface,
    surfaceAlt: d("bg-zinc-800/40", "bg-zinc-50"),
    border,
    divider: d("divide-zinc-800", "divide-zinc-200"),
    text: d("text-zinc-100", "text-zinc-900"),
    muted: d("text-zinc-400", "text-zinc-500"),
    faint: d("text-zinc-500", "text-zinc-400"),
    hover,
    // Cards: hairline border + barely-there shadow.
    card: `${surface} border ${border} rounded-2xl ${d(
      "shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]",
      "shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
    )}`,
    input: d(
      "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none transition",
      "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition",
    ),
    btn: `inline-flex items-center justify-center gap-1.5 rounded-lg border ${border} ${surface} ${hover} font-medium disabled:opacity-40 disabled:pointer-events-none`,
    btnPrimary:
      "inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium shadow-sm shadow-indigo-600/20 transition disabled:opacity-40",
    chip: d(
      "inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/60 text-zinc-300",
      "inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600",
    ),
    menu: `${surface} border ${border} rounded-xl shadow-xl ${d("shadow-black/40", "shadow-zinc-900/10")}`,
    scrollThumb: d("#3f3f46", "#d4d4d8"),
  };
}
