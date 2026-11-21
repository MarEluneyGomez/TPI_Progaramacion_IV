import { useForm } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import Button from '@/shared/ui/Button'
import Checkbox from '@/shared/ui/Checkbox'
import Input from '@/shared/ui/Input'
import { erroresDe, validarNumero } from '@/shared/utils/formularios'
import type { ProductoRead, ProductoStockUpdate } from '../types/producto.types'

type StockFormProps = {
  producto: ProductoRead
  error: string | null
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>
  onCancelar: () => void
}

function StockForm({ producto, error, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      await onGuardar({ stock: Number(value.stock), disponible: value.disponible })
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        Producto: <span className="font-medium text-slate-900">{producto.nombre}</span>
      </p>
      <form.Field name="stock" validators={{ onChange: ({ value }) => validarNumero(value, 'El stock', 0, true) }}>
        {(field) => (
          <Input id="stock-nuevo" label="Stock" type="number" min={0} step={1} value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} autoFocus />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => <Checkbox id="disponible-stock" label="Disponible para la venta" checked={field.state.value} onChange={field.handleChange} />}
      </form.Field>
      {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeGuardar, guardando]) => (
            <Button type="submit" disabled={!puedeGuardar} cargando={guardando}>
              Guardar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export default StockForm
