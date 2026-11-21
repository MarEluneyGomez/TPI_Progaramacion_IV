export type OpcionSelect = { valor: string; etiqueta: string }

type SelectProps = {
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
  onBlur?: () => void
  opciones: OpcionSelect[]
  errores?: string[]
  placeholder?: string
}

function Select({ id, label, value, onChange, onBlur, opciones, errores = [], placeholder }: SelectProps) {
  const conError = errores.length > 0
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={conError}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
          conError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
        }`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      {conError && <p className="text-xs text-red-600">{errores.join('. ')}</p>}
    </div>
  )
}

export default Select
