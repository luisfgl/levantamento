// lib/calculos/bdi.ts

export function calcularBdi(
  subtotal: number,
  bdiPercentual: number,
  usaBdi: boolean,
): number {
  if (!usaBdi) return 0
  return subtotal * (bdiPercentual / 100)
}

export function calcularTotal(subtotal: number, valorBdi: number): number {
  return subtotal + valorBdi
}
