import { useForm } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import type { CategoriaRead } from '@/features/categorias/types/categoria.types'
import Button from '@/shared/ui/Button'
import Checkbox from '@/shared/ui/Checkbox'
import Input from '@/shared/ui/Input'
import Select from '@/shared/ui/Select'
import { erroresDe, validarLargo, validarNumero, validarUrlOpcional } from '@/shared/utils/formularios'
import type { ProductoCreate, ProductoRead } from '../types/producto.types'

type ProductoFormProps = {
  producto: ProductoRead | null
  categorias: CategoriaRead[]
  error: string | null
  onGuardar: (datos: ProductoCreate) => Promise<void>
  onCancelar: () => void
}

function ProductoForm({ producto, categorias, error, onGuardar, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : '',
    },
    onSubmit: async ({ value }) => {
      await onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      })
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <form.Field name="nombre" validators={{ onChange: ({ value }) => validarLargo(value, 'El nombre', 1, 150) }}>
        {(field) => (
          <Input id="nombre" label="Nombre" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} maxLength={150} autoFocus />
        )}
      </form.Field>
      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}>
        {(field) => (
          <Select
            id="categoria_id"
            label="Categoría"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            errores={erroresDe(field.state.meta)}
            placeholder="Seleccionar..."
            opciones={categorias.map((c) => ({ valor: String(c.id), etiqueta: c.nombre }))}
          />
        )}
      </form.Field>
      <form.Field name="descripcion" validators={{ onChange: ({ value }) => validarLargo(value, 'La descripción', 0, 1000) }}>
        {(field) => (
          <Input id="descripcion" label="Descripción (opcional)" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} multilinea filas={2} maxLength={1000} />
        )}
      </form.Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarNumero(value, 'El precio', 0) }}>
          {(field) => (
            <Input id="precio_base" label="Precio" type="number" min={0} step={0.01} value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} />
          )}
        </form.Field>
        <form.Field name="stock" validators={{ onChange: ({ value }) => validarNumero(value, 'El stock', 0, true) }}>
          {(field) => (
            <Input id="stock" label="Stock" type="number" min={0} step={1} value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} />
          )}
        </form.Field>
      </div>
      <form.Field name="imagen_url" validators={{ onChange: ({ value }) => validarUrlOpcional(value) }}>
        {(field) => (
          <Input id="imagen_url" label="URL de la imagen (opcional)" type="url" placeholder="https://..." value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} errores={erroresDe(field.state.meta)} maxLength={500} />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <Checkbox id="disponible" label="Disponible para la venta" checked={field.state.value} onChange={field.handleChange} />
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
              {producto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export default ProductoForm
