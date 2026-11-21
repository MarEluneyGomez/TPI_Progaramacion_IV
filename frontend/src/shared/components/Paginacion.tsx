import Button from '@/shared/ui/Button'

type PaginacionProps = {
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
  totalItems?: number
}

function Paginacion({ pagina, totalPaginas, onCambiar, totalItems }: PaginacionProps) {
  if (totalPaginas <= 1 && totalItems === undefined) return null

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span>{totalItems !== undefined && `${totalItems} resultado${totalItems === 1 ? '' : 's'}`}</span>
      <div className="flex items-center gap-3">
        <Button variante="secundario" tamanio="sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina <= 0}>
          Anterior
        </Button>
        <span>
          Página {totalPaginas === 0 ? 0 : pagina + 1} de {totalPaginas}
        </span>
        <Button variante="secundario" tamanio="sm" onClick={() => onCambiar(pagina + 1)} disabled={pagina >= totalPaginas - 1}>
          Siguiente
        </Button>
      </div>
    </nav>
  )
}

export default Paginacion
