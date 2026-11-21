import Card from '@/shared/ui/Card'

type TarjetaResumenProps = {
  titulo: string
  valor: string
  detalle?: string
  acento?: 'naranja' | 'azul' | 'verde' | 'gris' | 'ambar'
}

const ACENTOS = {
  naranja: 'border-l-orange-500',
  azul: 'border-l-blue-500',
  verde: 'border-l-emerald-500',
  gris: 'border-l-slate-400',
  ambar: 'border-l-amber-500',
} as const

function TarjetaResumen({ titulo, valor, detalle, acento = 'gris' }: TarjetaResumenProps) {
  return (
    <Card className={`border-l-4 p-5 ${ACENTOS[acento]}`}>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
    </Card>
  )
}

export default TarjetaResumen
