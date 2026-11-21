import { useForm } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { erroresDe, validarLargo } from '@/shared/utils/formularios'
import { ETIQUETA_FORMA_PAGO, type FormaPago } from '../types/pedido.types'

export type DatosCheckout = {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

type CheckoutFormProps = {
  error: string | null
  onConfirmar: (datos: DatosCheckout) => Promise<void>
}

const FORMAS_PAGO: FormaPago[] = ['EFECTIVO', 'TRANSFERENCIA']

function CheckoutForm({ error, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as DatosCheckout,
    onSubmit: async ({ value }) => {
      await onConfirmar({ ...value, direccion_entrega: value.direccion_entrega.trim(), notas: value.notas.trim() })
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <form.Field name="direccion_entrega" validators={{ onChange: ({ value }) => validarLargo(value, 'La dirección', 5, 200) }}>
        {(field) => (
          <Input
            id="direccion_entrega"
            label="Dirección de entrega"
            placeholder="Calle, número, piso, ciudad"
            autoComplete="street-address"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            errores={erroresDe(field.state.meta)}
            maxLength={200}
            autoFocus
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Forma de pago</legend>
            <div className="flex flex-wrap gap-3">
              {FORMAS_PAGO.map((forma) => (
                <label
                  key={forma}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                    field.state.value === forma ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    value={forma}
                    checked={field.state.value === forma}
                    onChange={() => field.handleChange(forma)}
                    className="accent-orange-600"
                  />
                  {ETIQUETA_FORMA_PAGO[forma]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: ({ value }) => validarLargo(value, 'Las notas', 0, 500) }}>
        {(field) => (
          <Input
            id="notas"
            label="Notas (opcional)"
            placeholder="Ej: tocar timbre, sin cebolla"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            errores={erroresDe(field.state.meta)}
            multilinea
            filas={2}
            maxLength={500}
          />
        )}
      </form.Field>

      {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([puedeEnviar, enviando]) => (
          <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export default CheckoutForm
