// lib/calculos/area.ts

export function calcularAreaParede(comprimento: number, altura: number): number {
  return comprimento * altura
}

export function calcularAreaPiso(comprimento: number, largura: number): number {
  return comprimento * largura
}

export function calcularAreaVao(largura: number, altura: number, quantidade: number): number {
  return largura * altura * quantidade
}
