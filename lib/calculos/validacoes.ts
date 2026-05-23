// lib/calculos/validacoes.ts

export function validarNumeroNaoNegativo(
  valor: number | undefined,
  campo: string,
): string[] {
  if (valor === undefined || valor === null) return []
  if (Number.isNaN(valor)) return [`${campo} invÃ¡lido.`]
  if (valor < 0) return [`${campo} nÃ£o pode ser negativo.`]
  return []
}

export function validarObrigatorioNumero(
  valor: number | undefined,
  campo: string,
): string[] {
  if (valor === undefined || valor === null || Number.isNaN(valor)) {
    return [`${campo} Ã© obrigatÃ³rio.`]
  }

  if (valor < 0) return [`${campo} nÃ£o pode ser negativo.`]

  return []
}
