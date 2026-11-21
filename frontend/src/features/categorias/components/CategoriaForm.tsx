import { useForm } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { erroresDe, validarLargo } from '@/shared/utils/formularios'
import type { CategoriaCreate, CategoriaRead } from '../types/categoria.types'

type CategoriaFormProps = {
  categoria: CategoriaRead | null
  error: string | null
  onGuardar: (datos: CategoriaCreate) => Promise<void>
  onCancelar: () => void
}

function CategoriaForm({ categoria, error, onGuardar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      await onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null })
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <form.Field name="nombre" validators={{ onChange: ({ value }) => validarLargo(value, 'El nombre', 2, 100) }}>
        {(field) => (
          <Input id="nombre-categoria" label="Nombre" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} maxLength={100} autoFocus />
        )}
      </form.Field>
      <form.Field name="descripcion" validators={{ onChange: ({ value }) => validarLargo(value, 'La descripción', 0, 500) }}>
        {(field) => (
          <Input id="descripcion-categoria" label="Descripción (opcional)" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} multilinea maxLength={500} />
        )}
      </form.Field>
      {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeGuardar, guardando]) => (
            <Button type="submit" disabled={!puedeGuardar} cargando={guardando}>
              {categoria ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export default CategoriaForm
