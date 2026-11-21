import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'

type EstadoErrorProps = {
  error: unknown
  onReintentar?: () => void
}

function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
      <p>{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="secundario" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export default EstadoError
