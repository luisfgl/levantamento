# Pacote Etapa 2 — Storage Local, Serviços Padrão, Obra Exemplo e Exportação JSON

## 1. Objetivo

Esta etapa adiciona a camada de persistência local do MVP.

Entrega esperada:

```text
Storage local + serviços padrão + obra exemplo + exportação/importação JSON + testes
```

Ainda não haverá interface completa.

---

## 2. Arquivos desta etapa

Criar os seguintes arquivos:

```text
lib/storage/storageKeys.ts
lib/storage/projetoStorage.ts
lib/storage/exportacaoJson.ts

lib/dados/servicosPadrao.ts
lib/dados/obraExemplo.ts

tests/storage/projetoStorage.test.ts
tests/storage/exportacaoJson.test.ts
```

Criar a pasta de testes, se ainda não existir:

```powershell
mkdir tests\storage
```

Se a pasta já existir, ignore o aviso.

---

## 3. `lib/storage/storageKeys.ts`

```ts
// lib/storage/storageKeys.ts

export const STORAGE_KEYS = {
  OBRAS: 'lsv_obras_v1',
  AMBIENTES: 'lsv_ambientes_v1',
  SERVICOS: 'lsv_servicos_v1',
  LEVANTAMENTOS: 'lsv_levantamentos_v1',
} as const
```

---

## 4. `lib/storage/projetoStorage.ts`

```ts
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
```

### Observação técnica

`limparStorageLSV` foi incluído para facilitar testes e reset local durante desenvolvimento.

---

## 5. `lib/storage/exportacaoJson.ts`

```ts
// lib/storage/exportacaoJson.ts

import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'

export interface ExportacaoProjetoLSV {
  versao: '1.0.0'
  exportadoEm: string
  obra: Obra
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentos: LevantamentoServico[]
}

interface MontarExportacaoParams {
  obra: Obra
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentos: LevantamentoServico[]
}

export function montarExportacaoObra({
  obra,
  ambientes,
  servicos,
  levantamentos,
}: MontarExportacaoParams): ExportacaoProjetoLSV {
  return {
    versao: '1.0.0',
    exportadoEm: new Date().toISOString(),
    obra,
    ambientes: ambientes.filter((ambiente) => ambiente.obraId === obra.id),
    servicos,
    levantamentos: levantamentos.filter((levantamento) => levantamento.obraId === obra.id),
  }
}

export function validarImportacaoJson(dados: unknown): dados is ExportacaoProjetoLSV {
  if (!dados || typeof dados !== 'object') return false

  const parcial = dados as Partial<ExportacaoProjetoLSV>

  if (parcial.versao !== '1.0.0') return false
  if (!parcial.exportadoEm || typeof parcial.exportadoEm !== 'string') return false
  if (!parcial.obra || typeof parcial.obra !== 'object') return false
  if (!Array.isArray(parcial.ambientes)) return false
  if (!Array.isArray(parcial.servicos)) return false
  if (!Array.isArray(parcial.levantamentos)) return false

  return true
}

export function gerarNomeArquivoExportacao(nomeObra: string, data = new Date()): string {
  const nomeNormalizado = nomeObra
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  const dataIso = data.toISOString().slice(0, 10)
  const nomeSeguro = nomeNormalizado || 'obra'

  return `levantamento-servicos-valores-${nomeSeguro}-${dataIso}.json`
}

export function baixarJson(nomeArquivo: string, dados: unknown): void {
  if (typeof window === 'undefined') return

  const conteudo = JSON.stringify(dados, null, 2)
  const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()

  URL.revokeObjectURL(url)
}
```

### Decisão técnica

`baixarJson` usa APIs do navegador. Por isso, ela retorna sem fazer nada se estiver em ambiente server-side.

---

## 6. `lib/dados/servicosPadrao.ts`

```ts
// lib/dados/servicosPadrao.ts

import type { Servico } from '@/lib/tipos/servico'

const agora = '2026-01-01T00:00:00.000Z'

export const servicosPadrao: Servico[] = [
  {
    id: 'serv_padrao_reboco_interno',
    nome: 'Reboco interno',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_reboco_externo',
    nome: 'Reboco externo',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_contrapiso',
    nome: 'Contrapiso',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_regularizacao',
    nome: 'Regularização',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_piso',
    nome: 'Piso',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_rodape',
    nome: 'Rodapé',
    categoria: 'pisos',
    unidade: 'm',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'comprimento_linear',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_revestimento_parede',
    nome: 'Revestimento parede',
    categoria: 'revestimentos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_pintura_parede',
    nome: 'Pintura parede',
    categoria: 'pintura',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_elevacao_muro',
    nome: 'Elevação de muro',
    categoria: 'muros',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_reboco_muro',
    nome: 'Reboco de muro',
    categoria: 'muros',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_porta',
    nome: 'Porta',
    categoria: 'acabamentos',
    unidade: 'un',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'item_unitario',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_janela',
    nome: 'Janela',
    categoria: 'acabamentos',
    unidade: 'un',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'item_unitario',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_vaso_sanitario',
    nome: 'Vaso sanitário',
    categoria: 'acabamentos',
    unidade: 'un',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'item_unitario',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_instalacoes_eletricas',
    nome: 'Instalações elétricas',
    categoria: 'instalacoes',
    unidade: 'verba',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'valor_manual',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_hidrossanitarias',
    nome: 'Hidrossanitárias',
    categoria: 'instalacoes',
    unidade: 'verba',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'valor_manual',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_padrao_limpeza_final',
    nome: 'Limpeza final',
    categoria: 'complementacao',
    unidade: 'verba',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'valor_manual',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
]
```

---

## 7. `lib/dados/obraExemplo.ts`

```ts
// lib/dados/obraExemplo.ts

import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'

const agora = '2026-01-01T00:00:00.000Z'

export const obraExemplo: Obra = {
  id: 'obra_exemplo_residencia_modelo',
  nome: 'Residência Modelo',
  cliente: 'Cliente Teste',
  endereco: 'Rua Exemplo, 123',
  contrato: 'Contrato teste',
  modalidade: 'Orçamento de serviços',
  responsavelTecnico: 'Responsável Técnico',
  registroProfissional: 'CREA/CAU/CFT',
  dataOrcamento: '2026-01-01',
  bdiPadraoPercentual: 35,
  observacoes: 'Obra exemplo para validação manual do MVP.',
  status: 'rascunho',
  criadoEm: agora,
  atualizadoEm: agora,
}

export const ambientesExemplo: Ambiente[] = [
  {
    id: 'amb_exemplo_sala',
    obraId: obraExemplo.id,
    pavimento: 'Térreo',
    nome: 'Sala',
    descricao: 'Ambiente de teste',
    ordem: 1,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'amb_exemplo_cozinha',
    obraId: obraExemplo.id,
    pavimento: 'Térreo',
    nome: 'Cozinha',
    descricao: 'Ambiente de teste',
    ordem: 2,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'amb_exemplo_banheiro',
    obraId: obraExemplo.id,
    pavimento: 'Térreo',
    nome: 'Banheiro',
    descricao: 'Ambiente de teste',
    ordem: 3,
    criadoEm: agora,
    atualizadoEm: agora,
  },
]

export const levantamentosExemplo: LevantamentoServico[] = [
  {
    id: 'lev_exemplo_reboco_sala',
    obraId: obraExemplo.id,
    ambienteId: 'amb_exemplo_sala',
    servicoId: 'serv_padrao_reboco_interno',
    descricao: 'Reboco da parede principal da sala',
    comprimento: 5,
    altura: 2.8,
    unidade: 'm2',
    valorUnitario: 35,
    bdiPercentual: 35,
    usaBdi: true,
    vaos: [
      {
        id: 'vao_exemplo_porta_sala',
        levantamentoId: 'lev_exemplo_reboco_sala',
        tipo: 'porta',
        descricao: 'Porta da sala',
        largura: 0.8,
        altura: 2.1,
        quantidade: 1,
        criadoEm: agora,
        atualizadoEm: agora,
      },
      {
        id: 'vao_exemplo_janela_sala',
        levantamentoId: 'lev_exemplo_reboco_sala',
        tipo: 'janela',
        descricao: 'Janela da sala',
        largura: 1.5,
        altura: 1.2,
        quantidade: 1,
        criadoEm: agora,
        atualizadoEm: agora,
      },
    ],
    observacoes: 'Exemplo com desconto de vãos.',
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'lev_exemplo_piso_cozinha',
    obraId: obraExemplo.id,
    ambienteId: 'amb_exemplo_cozinha',
    servicoId: 'serv_padrao_piso',
    descricao: 'Piso da cozinha',
    comprimento: 4,
    largura: 3,
    unidade: 'm2',
    valorUnitario: 60,
    bdiPercentual: 35,
    usaBdi: true,
    vaos: [],
    observacoes: 'Exemplo de piso.',
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'lev_exemplo_porta_banheiro',
    obraId: obraExemplo.id,
    ambienteId: 'amb_exemplo_banheiro',
    servicoId: 'serv_padrao_porta',
    descricao: 'Porta do banheiro',
    quantidade: 1,
    unidade: 'un',
    valorUnitario: 250,
    bdiPercentual: 35,
    usaBdi: true,
    vaos: [],
    observacoes: 'Exemplo de item unitário.',
    criadoEm: agora,
    atualizadoEm: agora,
  },
]
```

---

## 8. Testes de storage

### 8.1 Ajustar Vitest para ambiente `jsdom`

Instalar dependência:

```powershell
npm install -D jsdom
```

Alterar `vitest.config.ts` para:

```ts
// vitest.config.ts

import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

### 8.2 `tests/storage/projetoStorage.test.ts`

```ts
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
```

### 8.3 `tests/storage/exportacaoJson.test.ts`

```ts
// tests/storage/exportacaoJson.test.ts

import { describe, expect, it } from 'vitest'
import {
  gerarNomeArquivoExportacao,
  montarExportacaoObra,
  validarImportacaoJson,
} from '@/lib/storage/exportacaoJson'
import { ambientesExemplo, levantamentosExemplo, obraExemplo } from '@/lib/dados/obraExemplo'
import { servicosPadrao } from '@/lib/dados/servicosPadrao'

describe('exportacaoJson', () => {
  it('monta exportação de obra', () => {
    const exportacao = montarExportacaoObra({
      obra: obraExemplo,
      ambientes: ambientesExemplo,
      servicos: servicosPadrao,
      levantamentos: levantamentosExemplo,
    })

    expect(exportacao.versao).toBe('1.0.0')
    expect(exportacao.obra.id).toBe(obraExemplo.id)
    expect(exportacao.ambientes).toHaveLength(3)
    expect(exportacao.servicos.length).toBeGreaterThan(0)
    expect(exportacao.levantamentos).toHaveLength(3)
  })

  it('valida JSON de importação correto', () => {
    const exportacao = montarExportacaoObra({
      obra: obraExemplo,
      ambientes: ambientesExemplo,
      servicos: servicosPadrao,
      levantamentos: levantamentosExemplo,
    })

    expect(validarImportacaoJson(exportacao)).toBe(true)
  })

  it('rejeita JSON de importação inválido', () => {
    expect(validarImportacaoJson({})).toBe(false)
    expect(validarImportacaoJson(null)).toBe(false)
    expect(validarImportacaoJson({ versao: '2.0.0' })).toBe(false)
  })

  it('gera nome seguro para arquivo exportado', () => {
    const nome = gerarNomeArquivoExportacao('Residência Modelo', new Date('2026-01-15T00:00:00.000Z'))

    expect(nome).toBe('levantamento-servicos-valores-residencia-modelo-2026-01-15.json')
  })
})
```

---

## 9. Validação

Rodar:

```powershell
npm run lint
npm test
npm run build
```

Resultado esperado:

```text
lint sem erro
testes passando
build concluído
```

---

## 10. Commit sugerido

Depois da validação:

```powershell
git status
git add .
git commit -m "feat: adicionar storage local e dados padrao"
git push
```

---

## 11. Observação importante

Esta etapa ainda não deve usar Supabase.

Mesmo já existindo ambiente Supabase, Vercel e Render, o objetivo atual é validar armazenamento local e estrutura de dados. Supabase entra depois que o fluxo local estiver funcional.
