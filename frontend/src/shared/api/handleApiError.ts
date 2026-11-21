import axios from 'axios'

type ErrorValidacion = { loc: (string | number)[]; msg: string }
type CuerpoError = { detail?: string | ErrorValidacion[] }

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<CuerpoError>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((e) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join('. ')
    return `Error ${error.response.status}`
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}

export function statusDeError(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export function detalleDeError(error: unknown): unknown {
  return axios.isAxiosError<CuerpoError>(error) ? error.response?.data?.detail : undefined
}
