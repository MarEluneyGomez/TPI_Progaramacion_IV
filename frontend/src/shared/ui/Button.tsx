import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'
type Tamanio = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  tamanio?: Tamanio
  cargando?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm',
  secundario: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  peligro: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  fantasma: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
}

const TAMANIOS: Record<Tamanio, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

function Button({ variante = 'primario', tamanio = 'md', cargando = false, className = '', disabled, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${TAMANIOS[tamanio]} ${className}`}
      {...props}
    >
      {cargando && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  )
}

export default Button
