// lib/utils/formatacao.ts

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarNumero(valor: number, casas = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor)
}

export function formatarPercentual(valor: number): string {
  return `${formatarNumero(valor, 2)}%`
}
