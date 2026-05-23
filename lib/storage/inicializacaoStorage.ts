// lib/storage/inicializacaoStorage.ts

import { servicosPadrao } from '@/lib/dados/servicosPadrao'
import type { Servico } from '@/lib/tipos/servico'
import { STORAGE_KEYS } from './storageKeys'
import { carregarLista, salvarLista } from './projetoStorage'

export function inicializarServicosPadraoSeNecessario(): Servico[] {
  const servicosExistentes = carregarLista<Servico>(STORAGE_KEYS.SERVICOS)

  if (servicosExistentes.length > 0) {
    return servicosExistentes
  }

  salvarLista(STORAGE_KEYS.SERVICOS, servicosPadrao)
  return servicosPadrao
}