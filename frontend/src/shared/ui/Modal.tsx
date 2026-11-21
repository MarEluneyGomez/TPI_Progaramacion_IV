import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

function Modal({ abierto, titulo, onCerrar, children, ancho = 'md' }: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4" onClick={onCerrar} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        onClick={(e) => e.stopPropagation()}
        className={`max-h-full w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="titulo-modal" className="text-lg font-semibold text-slate-900">
            {titulo}
          </h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
