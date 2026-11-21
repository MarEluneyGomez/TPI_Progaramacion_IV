export function erroresDe(meta: { isTouched: boolean; errors: unknown[] }): string[] {
  return meta.isTouched ? meta.errors.filter((e): e is string => typeof e === 'string') : []
}

export function validarLargo(valor: string, campo: string, minimo: number, maximo: number): string | undefined {
  const largo = valor.trim().length
  if (largo < minimo) return minimo === 1 ? `${campo} es obligatorio` : `${campo} debe tener al menos ${minimo} caracteres`
  if (largo > maximo) return `Máximo ${maximo} caracteres`
  return undefined
}

export function validarNumero(valor: string, campo: string, minimo: number, entero = false): string | undefined {
  if (valor.trim() === '') return `${campo} es obligatorio`
  const numero = Number(valor)
  if (Number.isNaN(numero)) return `${campo} debe ser un número`
  if (entero && !Number.isInteger(numero)) return `${campo} debe ser un número entero`
  if (numero < minimo) return `${campo} no puede ser menor que ${minimo}`
  return undefined
}

export function validarUrlOpcional(valor: string): string | undefined {
  const limpio = valor.trim()
  return limpio && !/^https?:\/\/\S+$/.test(limpio) ? 'La URL debe empezar con http:// o https://' : undefined
}
