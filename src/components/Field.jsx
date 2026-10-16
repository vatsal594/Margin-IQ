export default function Field({ label, children, T, full }) {
  return (
    <div className={full ? "sm:col-span-2 md:col-span-3" : ""}>
      <label className={`block text-xs font-medium mb-1 ${T.muted}`}>{label}</label>
      {children}
    </div>
  );
}
