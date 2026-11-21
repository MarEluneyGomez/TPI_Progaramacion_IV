type InputProps = {
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
  onBlur?: () => void
  errores?: string[]
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'search'
  placeholder?: string
  multilinea?: boolean
  filas?: number
  min?: number
  step?: number
  maxLength?: number
  autoComplete?: string
  autoFocus?: boolean
  ayuda?: string
}

const claseCampo = (conError: boolean) =>
  `w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
    conError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
  }`

function Input({
  id,
  label,
  value,
  onChange,
  onBlur,
  errores = [],
  type = 'text',
  placeholder,
  multilinea = false,
  filas = 3,
  min,
  step,
  maxLength,
  autoComplete,
  autoFocus,
  ayuda,
}: InputProps) {
  const conError = errores.length > 0
  const comunes = {
    id,
    name: id,
    value,
    placeholder,
    maxLength,
    autoFocus,
    onBlur,
    'aria-invalid': conError,
    'aria-describedby': conError ? `${id}-error` : undefined,
    className: claseCampo(conError),
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {multilinea ? (
        <textarea {...comunes} rows={filas} onChange={(e) => onChange(e.target.value)} className={`${comunes.className} resize-none`} />
      ) : (
        <input {...comunes} type={type} min={min} step={step} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      )}
      {ayuda && !conError && <p className="text-xs text-slate-500">{ayuda}</p>}
      {conError && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {errores.join('. ')}
        </p>
      )}
    </div>
  )
}

export default Input
