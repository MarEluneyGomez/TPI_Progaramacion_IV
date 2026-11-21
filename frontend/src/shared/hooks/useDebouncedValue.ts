import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(valor: T, demoraMs = 300): T {
  const [diferido, setDiferido] = useState(valor)

  useEffect(() => {
    const temporizador = window.setTimeout(() => setDiferido(valor), demoraMs)
    return () => window.clearTimeout(temporizador)
  }, [valor, demoraMs])

  return diferido
}
