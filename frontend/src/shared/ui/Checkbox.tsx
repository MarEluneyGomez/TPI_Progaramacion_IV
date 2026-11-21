type CheckboxProps = {
  id: string
  label: string
  checked: boolean
  onChange: (valor: boolean) => void
  descripcion?: string
}

function Checkbox({ id, label, checked, onChange, descripcion }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-orange-600"
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {descripcion && <span className="text-xs text-slate-500">{descripcion}</span>}
      </span>
    </label>
  )
}

export default Checkbox
