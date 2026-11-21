const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export function formatearPrecio(valor: number): string {
  return formatoPrecio.format(valor)
}

export function formatearFecha(iso: string): string {
  const conZona = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`
  return formatoFecha.format(new Date(conZona))
}
