// lib/utils/normalizacao.ts

export function normalizarNumeroEntrada(valor: string): number {
  const normalizado = valor.replace(',', '.').trim()
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : Number.NaN
}

export function limitarMinimoZero(valor: number): number {
  if (!Number.isFinite(valor)) return 0
  return Math.max(0, valor)
}
