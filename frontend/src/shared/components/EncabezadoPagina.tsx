import type { ReactNode } from 'react'

type EncabezadoPaginaProps = {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}

function EncabezadoPagina({ titulo, descripcion, acciones }: EncabezadoPaginaProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-3">{acciones}</div>}
    </div>
  )
}

export default EncabezadoPagina
