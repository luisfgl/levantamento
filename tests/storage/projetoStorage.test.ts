// tests/storage/projetoStorage.test.ts

import { beforeEach, describe, expect, it } from 'vitest'
import {
  atualizarItem,
  carregarLista,
  inserirItem,
  removerItem,
  salvarLista,
} from '@/lib/storage/projetoStorage'

interface ItemTeste {
  id: string
  nome: string
}

const key = 'teste_storage_lsv'

beforeEach(() => {
  window.localStorage.clear()
})

describe('projetoStorage', () => {
  it('retorna lista vazia quando não há dados', () => {
    expect(carregarLista<ItemTeste>(key)).toEqual([])
  })

  it('salva e carrega lista', () => {
    const itens: ItemTeste[] = [{ id: '1', nome: 'Item 1' }]

    salvarLista(key, itens)

    expect(carregarLista<ItemTeste>(key)).toEqual(itens)
  })

  it('insere item', () => {
    inserirItem<ItemTeste>(key, { id: '1', nome: 'Item 1' })

    expect(carregarLista<ItemTeste>(key)).toEqual([{ id: '1', nome: 'Item 1' }])
  })

  it('atualiza item', () => {
    salvarLista<ItemTeste>(key, [{ id: '1', nome: 'Item antigo' }])

    atualizarItem<ItemTeste>(key, { id: '1', nome: 'Item novo' })

    expect(carregarLista<ItemTeste>(key)).toEqual([{ id: '1', nome: 'Item novo' }])
  })

  it('remove item', () => {
    salvarLista<ItemTeste>(key, [
      { id: '1', nome: 'Item 1' },
      { id: '2', nome: 'Item 2' },
    ])

    removerItem<ItemTeste>(key, '1')

    expect(carregarLista<ItemTeste>(key)).toEqual([{ id: '2', nome: 'Item 2' }])
  })

  it('retorna lista vazia quando JSON está corrompido', () => {
    window.localStorage.setItem(key, '{json inválido')

    expect(carregarLista<ItemTeste>(key)).toEqual([])
  })
})

