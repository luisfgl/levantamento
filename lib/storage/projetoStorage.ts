// lib/storage/projetoStorage.ts

function storageDisponivel(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function carregarLista<T>(key: string): T[] {
  if (!storageDisponivel()) return []

  try {
    const bruto = window.localStorage.getItem(key)
    if (!bruto) return []

    const dados = JSON.parse(bruto)
    return Array.isArray(dados) ? (dados as T[]) : []
  } catch {
    return []
  }
}

export function salvarLista<T>(key: string, itens: T[]): void {
  if (!storageDisponivel()) return

  window.localStorage.setItem(key, JSON.stringify(itens))
}

export function inserirItem<T extends { id: string }>(key: string, item: T): T[] {
  const itens = carregarLista<T>(key)
  const novaLista = [...itens, item]
  salvarLista(key, novaLista)
  return novaLista
}

export function atualizarItem<T extends { id: string }>(key: string, itemAtualizado: T): T[] {
  const itens = carregarLista<T>(key)
  const novaLista = itens.map((item) => (item.id === itemAtualizado.id ? itemAtualizado : item))
  salvarLista(key, novaLista)
  return novaLista
}

export function removerItem<T extends { id: string }>(key: string, id: string): T[] {
  const itens = carregarLista<T>(key)
  const novaLista = itens.filter((item) => item.id !== id)
  salvarLista(key, novaLista)
  return novaLista
}

export function limparStorageLSV(): void {
  if (!storageDisponivel()) return

  window.localStorage.removeItem('lsv_obras_v1')
  window.localStorage.removeItem('lsv_ambientes_v1')
  window.localStorage.removeItem('lsv_servicos_v1')
  window.localStorage.removeItem('lsv_levantamentos_v1')
}