export function FieldControl({ label, description, children }) {
  return (
    <label className="grid gap-1.5">
      <div className="grid gap-0.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-txt-3">
          {label}
        </span>
        {description ? (
          <span className="text-[11px] text-txt-3/80">{description}</span>
        ) : null}
      </div>
      {children}
    </label>
  );
}
