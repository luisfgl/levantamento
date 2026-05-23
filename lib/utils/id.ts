export function criarId(prefixo: string): string {
  return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
