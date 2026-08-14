/* Shared, plain (server-renderable) form field wrappers for admin forms.
   No client interactivity needed — these are native inputs inside a
   <form action={serverAction}>, submitted the normal browser way. */

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] tracking-widest uppercase text-steel">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-steel">{hint}</span>}
    </label>
  )
}

const inputClass = 'admin-input-focus w-full rounded-xl border border-cloud bg-mist/60 px-4 py-3 text-[15px] text-ocean placeholder:text-steel/50'

export function TextInput(props) {
  return <input {...props} className={inputClass} />
}

export function TextArea({ rows = 4, ...props }) {
  return <textarea rows={rows} {...props} className={`${inputClass} resize-y font-mono text-sm`} />
}

export function Select({ children, ...props }) {
  return <select {...props} className={inputClass}>{children}</select>
}

const fileInputClass = 'admin-input-focus w-full rounded-xl border border-dashed border-cloud bg-mist px-4 py-3 text-sm text-steel file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ocean hover:file:bg-cloud/40 file:cursor-pointer cursor-pointer'

export function FileInput({ current, currentLabel, accept, locationHint, aspectHint, ...props }) {
  return (
    <div>
      {current && (
        <p className="mb-1.5 text-xs text-steel truncate flex items-center gap-1.5">
          <span className="font-semibold text-ocean">{currentLabel || 'Current'}:</span>
          <a href={current} target="_blank" rel="noreferrer" className="text-azure hover:underline truncate">{current}</a>
        </p>
      )}
      <input type="file" accept={accept} {...props} className={fileInputClass} />
      {/* Choosing no file means "keep what's there", so without this there
          is no way to CLEAR a logo or video once one has been set — only
          to swap it for another. Only shown when there's something to
          remove. The action reads `remove_<fieldname>`. */}
      {current && props.name && (
        <label className="mt-2 flex items-center gap-2 text-xs text-steel cursor-pointer w-fit">
          <input type="checkbox" name={`remove_${props.name}`} value="1" className="accent-crimson" />
          Remove the current file
        </label>
      )}
      {(locationHint || aspectHint) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
          {locationHint && <span className="font-medium text-ocean bg-mist px-2 py-0.5 rounded-md border border-cloud">📍 {locationHint}</span>}
          {aspectHint && <span className="font-mono text-[10px] text-steel bg-white px-2 py-0.5 rounded-md border border-cloud">📐 {aspectHint}</span>}
        </div>
      )}
    </div>
  )
}

/* Groups related fields under a titled card — used to break long content
   forms (brands, products, solutions, posts) into scannable sections. */
export function Card({ title, description, children }) {
  return (
    <div className="admin-fade-in rounded-2xl border border-cloud bg-white p-6 shadow-sm">
      {title && (
        <div className="mb-5">
          <h2 className="font-display font-bold text-ocean text-base">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-steel">{description}</p>}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  )
}

/* Keeps the Save button reachable without scrolling on long forms. Must be
   rendered inside the <form> so SubmitButton (useFormStatus) still works. */
export function StickyActions({ children }) {
  return (
    <div className="sticky bottom-0 -mx-6 sm:-mx-10 mt-8 flex items-center gap-3 border-t border-cloud bg-white/90 px-6 py-4 shadow-[0_-8px_24px_-8px_rgba(28,32,38,0.1)] backdrop-blur sm:px-10">
      {children}
    </div>
  )
}
