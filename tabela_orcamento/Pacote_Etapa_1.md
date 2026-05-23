# Pacote Etapa 1 — Tipos, Utilitários, Motor de Cálculo e Testes

## 1. Objetivo

Esta etapa cria a base técnica do MVP sem interface.

Entrega esperada:

```text
Tipos TypeScript + utilitários + motor de cálculo + testes automatizados
```

Nada de tela nesta etapa.

---

## 2. Comandos iniciais

### 2.1 Criar projeto

```powershell
cd E:\Projetos
npx create-next-app@latest levantamento-servicos-valores --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
cd levantamento-servicos-valores
```

### 2.2 Instalar Vitest

```powershell
npm install -D vitest
npm pkg set scripts.test="vitest run"
```

### 2.3 Criar pastas

```powershell
mkdir lib\tipos
mkdir lib\utils
mkdir lib\calculos
mkdir tests
mkdir tests\calculos
```

---

## 3. Arquivos de tipos

### 3.1 `lib/tipos/comum.ts`

```ts
// lib/tipos/comum.ts

export type StatusObra =
  | 'rascunho'
  | 'em_orcamento'
  | 'enviado_cliente'
  | 'aprovado'
  | 'recusado'
  | 'em_execucao'
  | 'finalizado'

export type UnidadeMedida =
  | 'm2'
  | 'm'
  | 'un'
  | 'verba'
  | 'ponto'
  | 'conjunto'

export type CategoriaServico =
  | 'reboco'
  | 'pisos'
  | 'revestimentos'
  | 'pintura'
  | 'muros'
  | 'acabamentos'
  | 'instalacoes'
  | 'complementacao'
  | 'outros'

export type TipoCalculoServico =
  | 'parede'
  | 'piso'
  | 'item_unitario'
  | 'valor_manual'
  | 'comprimento_linear'
```

### 3.2 `lib/tipos/obra.ts`

```ts
// lib/tipos/obra.ts

import type { StatusObra } from './comum'

export interface Obra {
  id: string
  nome: string
  cliente: string
  endereco?: string
  contrato?: string
  modalidade?: string
  responsavelTecnico?: string
  registroProfissional?: string
  dataOrcamento: string
  bdiPadraoPercentual: number
  observacoes?: string
  status: StatusObra
  criadoEm: string
  atualizadoEm: string
}
```

### 3.3 `lib/tipos/ambiente.ts`

```ts
// lib/tipos/ambiente.ts

export interface Ambiente {
  id: string
  obraId: string
  pavimento?: string
  nome: string
  descricao?: string
  ordem: number
  criadoEm: string
  atualizadoEm: string
}
```

### 3.4 `lib/tipos/servico.ts`

```ts
// lib/tipos/servico.ts

import type {
  CategoriaServico,
  TipoCalculoServico,
  UnidadeMedida,
} from './comum'

export interface Servico {
  id: string
  nome: string
  categoria: CategoriaServico
  unidade: UnidadeMedida
  valorUnitarioPadrao: number
  tipoCalculo: TipoCalculoServico
  usaBdi: boolean
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}
```

### 3.5 `lib/tipos/vao.ts`

```ts
// lib/tipos/vao.ts

export type TipoVao = 'porta' | 'janela' | 'portao' | 'vao_livre' | 'outro'

export interface Vao {
  id: string
  levantamentoId: string
  tipo: TipoVao
  descricao?: string
  largura: number
  altura: number
  quantidade: number
  criadoEm: string
  atualizadoEm: string
}
```

### 3.6 `lib/tipos/levantamento.ts`

```ts
// lib/tipos/levantamento.ts

import type { UnidadeMedida } from './comum'
import type { Vao } from './vao'

export interface LevantamentoServico {
  id: string
  obraId: string
  ambienteId: string
  servicoId: string
  descricao?: string

  comprimento?: number
  largura?: number
  altura?: number
  quantidade?: number
  valorManual?: number

  unidade: UnidadeMedida
  valorUnitario: number
  bdiPercentual: number
  usaBdi: boolean

  vaos: Vao[]

  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export interface ResultadoCalculoLevantamento {
  areaBruta: number
  areaDescontada: number
  saldo: number
  subtotal: number
  valorBdi: number
  total: number
  erros: string[]
}
```

### 3.7 `lib/tipos/resumo.ts`

```ts
// lib/tipos/resumo.ts

import type { CategoriaServico } from './comum'

export interface ResumoCategoria {
  categoria: CategoriaServico
  subtotal: number
  valorBdi: number
  total: number
  quantidadeItens: number
}

export interface ResumoObra {
  subtotal: number
  valorBdi: number
  total: number
  quantidadeItens: number
  quantidadeItensComErro: number
  categorias: ResumoCategoria[]
}
```

---

## 4. Utilitários

### 4.1 `lib/utils/id.ts`

```ts
// lib/utils/id.ts

export function criarId(prefixo: string): string {
  return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
```

### 4.2 `lib/utils/formatacao.ts`

```ts
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
```

### 4.3 `lib/utils/normalizacao.ts`

```ts
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
```

---

## 5. Motor de cálculo

### 5.1 `lib/calculos/area.ts`

```ts
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
```

### 5.2 `lib/calculos/bdi.ts`

```ts
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
```

### 5.3 `lib/calculos/validacoes.ts`

```ts
// lib/calculos/validacoes.ts

export function validarNumeroNaoNegativo(
  valor: number | undefined,
  campo: string,
): string[] {
  if (valor === undefined || valor === null) return []
  if (Number.isNaN(valor)) return [`${campo} inválido.`]
  if (valor < 0) return [`${campo} não pode ser negativo.`]
  return []
}

export function validarObrigatorioNumero(
  valor: number | undefined,
  campo: string,
): string[] {
  if (valor === undefined || valor === null || Number.isNaN(valor)) {
    return [`${campo} é obrigatório.`]
  }

  if (valor < 0) return [`${campo} não pode ser negativo.`]

  return []
}
```

### 5.4 `lib/calculos/levantamento.ts`

```ts
// lib/calculos/levantamento.ts

import type { LevantamentoServico, ResultadoCalculoLevantamento } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { calcularAreaParede, calcularAreaPiso, calcularAreaVao } from './area'
import { calcularBdi, calcularTotal } from './bdi'
import { validarNumeroNaoNegativo, validarObrigatorioNumero } from './validacoes'

function resultadoZerado(erros: string[] = []): ResultadoCalculoLevantamento {
  return {
    areaBruta: 0,
    areaDescontada: 0,
    saldo: 0,
    subtotal: 0,
    valorBdi: 0,
    total: 0,
    erros,
  }
}

function somarAreaVaos(levantamento: LevantamentoServico): number {
  return levantamento.vaos.reduce((total, vao) => {
    return total + calcularAreaVao(vao.largura, vao.altura, vao.quantidade)
  }, 0)
}

function validarVaos(levantamento: LevantamentoServico): string[] {
  const erros: string[] = []

  for (const vao of levantamento.vaos) {
    erros.push(...validarObrigatorioNumero(vao.largura, 'Largura do vão'))
    erros.push(...validarObrigatorioNumero(vao.altura, 'Altura do vão'))
    erros.push(...validarObrigatorioNumero(vao.quantidade, 'Quantidade do vão'))
  }

  return erros
}

export function calcularLevantamento(
  levantamento: LevantamentoServico,
  servico: Servico,
): ResultadoCalculoLevantamento {
  const erros: string[] = []

  erros.push(...validarNumeroNaoNegativo(levantamento.valorUnitario, 'Valor unitário'))
  erros.push(...validarNumeroNaoNegativo(levantamento.bdiPercentual, 'BDI'))

  if (!servico) {
    return resultadoZerado(['Serviço não encontrado.'])
  }

  let areaBruta = 0
  let areaDescontada = 0
  let saldo = 0
  let subtotal = 0

  switch (servico.tipoCalculo) {
    case 'parede': {
      erros.push(...validarObrigatorioNumero(levantamento.comprimento, 'Comprimento'))
      erros.push(...validarObrigatorioNumero(levantamento.altura, 'Altura'))
      erros.push(...validarVaos(levantamento))

      if (erros.length > 0) return resultadoZerado(erros)

      areaBruta = calcularAreaParede(levantamento.comprimento ?? 0, levantamento.altura ?? 0)
      areaDescontada = somarAreaVaos(levantamento)
      saldo = areaBruta - areaDescontada

      if (saldo < 0) {
        erros.push('Área descontada não pode ser maior que a área bruta.')
        return {
          areaBruta,
          areaDescontada,
          saldo,
          subtotal: 0,
          valorBdi: 0,
          total: 0,
          erros,
        }
      }

      subtotal = saldo * levantamento.valorUnitario
      break
    }

    case 'piso': {
      erros.push(...validarObrigatorioNumero(levantamento.comprimento, 'Comprimento'))
      erros.push(...validarObrigatorioNumero(levantamento.largura, 'Largura'))

      if (erros.length > 0) return resultadoZerado(erros)

      areaBruta = calcularAreaPiso(levantamento.comprimento ?? 0, levantamento.largura ?? 0)
      areaDescontada = 0
      saldo = areaBruta
      subtotal = saldo * levantamento.valorUnitario
      break
    }

    case 'item_unitario': {
      erros.push(...validarObrigatorioNumero(levantamento.quantidade, 'Quantidade'))

      if (erros.length > 0) return resultadoZerado(erros)

      areaBruta = 0
      areaDescontada = 0
      saldo = levantamento.quantidade ?? 0
      subtotal = saldo * levantamento.valorUnitario
      break
    }

    case 'valor_manual': {
      erros.push(...validarObrigatorioNumero(levantamento.valorManual, 'Valor manual'))

      if (erros.length > 0) return resultadoZerado(erros)

      areaBruta = 0
      areaDescontada = 0
      saldo = 1
      subtotal = levantamento.valorManual ?? 0
      break
    }

    case 'comprimento_linear': {
      erros.push(...validarObrigatorioNumero(levantamento.comprimento, 'Comprimento'))

      if (erros.length > 0) return resultadoZerado(erros)

      areaBruta = 0
      areaDescontada = 0
      saldo = levantamento.comprimento ?? 0
      subtotal = saldo * levantamento.valorUnitario
      break
    }

    default: {
      return resultadoZerado(['Tipo de cálculo não suportado.'])
    }
  }

  const usaBdi = levantamento.usaBdi && servico.usaBdi
  const valorBdi = calcularBdi(subtotal, levantamento.bdiPercentual, usaBdi)
  const total = calcularTotal(subtotal, valorBdi)

  return {
    areaBruta,
    areaDescontada,
    saldo,
    subtotal,
    valorBdi,
    total,
    erros,
  }
}
```

### 5.5 `lib/calculos/resumo.ts`

```ts
// lib/calculos/resumo.ts

import type { CategoriaServico } from '@/lib/tipos/comum'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { ResumoCategoria, ResumoObra } from '@/lib/tipos/resumo'
import type { Servico } from '@/lib/tipos/servico'
import { calcularLevantamento } from './levantamento'

function criarResumoCategoria(categoria: CategoriaServico): ResumoCategoria {
  return {
    categoria,
    subtotal: 0,
    valorBdi: 0,
    total: 0,
    quantidadeItens: 0,
  }
}

export function calcularResumoObra(
  levantamentos: LevantamentoServico[],
  servicos: Servico[],
): ResumoObra {
  const categoriasMap = new Map<CategoriaServico, ResumoCategoria>()

  let subtotalGeral = 0
  let valorBdiGeral = 0
  let totalGeral = 0
  let quantidadeItens = 0
  let quantidadeItensComErro = 0

  for (const levantamento of levantamentos) {
    const servico = servicos.find((item) => item.id === levantamento.servicoId)

    if (!servico) {
      quantidadeItensComErro += 1
      continue
    }

    const resultado = calcularLevantamento(levantamento, servico)

    if (resultado.erros.length > 0) {
      quantidadeItensComErro += 1
      continue
    }

    const categoria = servico.categoria
    const resumoCategoria = categoriasMap.get(categoria) ?? criarResumoCategoria(categoria)

    resumoCategoria.subtotal += resultado.subtotal
    resumoCategoria.valorBdi += resultado.valorBdi
    resumoCategoria.total += resultado.total
    resumoCategoria.quantidadeItens += 1

    categoriasMap.set(categoria, resumoCategoria)

    subtotalGeral += resultado.subtotal
    valorBdiGeral += resultado.valorBdi
    totalGeral += resultado.total
    quantidadeItens += 1
  }

  return {
    subtotal: subtotalGeral,
    valorBdi: valorBdiGeral,
    total: totalGeral,
    quantidadeItens,
    quantidadeItensComErro,
    categorias: Array.from(categoriasMap.values()),
  }
}
```

---

## 6. Testes

### 6.1 `tests/calculos/area.test.ts`

```ts
// tests/calculos/area.test.ts

import { describe, expect, it } from 'vitest'
import { calcularAreaParede, calcularAreaPiso, calcularAreaVao } from '@/lib/calculos/area'

describe('cálculos de área', () => {
  it('calcula área de parede', () => {
    expect(calcularAreaParede(4, 2.8)).toBeCloseTo(11.2)
  })

  it('calcula área de piso', () => {
    expect(calcularAreaPiso(5, 3)).toBeCloseTo(15)
  })

  it('calcula área de vão', () => {
    expect(calcularAreaVao(0.8, 2.1, 1)).toBeCloseTo(1.68)
  })
})
```

### 6.2 `tests/calculos/bdi.test.ts`

```ts
// tests/calculos/bdi.test.ts

import { describe, expect, it } from 'vitest'
import { calcularBdi, calcularTotal } from '@/lib/calculos/bdi'

describe('cálculos de BDI', () => {
  it('calcula BDI quando habilitado', () => {
    expect(calcularBdi(1000, 35, true)).toBeCloseTo(350)
  })

  it('retorna zero quando BDI está desabilitado', () => {
    expect(calcularBdi(1000, 35, false)).toBeCloseTo(0)
  })

  it('calcula total com BDI', () => {
    expect(calcularTotal(1000, 350)).toBeCloseTo(1350)
  })
})
```

### 6.3 `tests/calculos/levantamento.test.ts`

```ts
// tests/calculos/levantamento.test.ts

import { describe, expect, it } from 'vitest'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'

const agora = '2026-01-01T00:00:00.000Z'

function criarServico(parcial: Partial<Servico>): Servico {
  return {
    id: 'serv_1',
    nome: 'Serviço teste',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
    ...parcial,
  }
}

function criarLevantamento(parcial: Partial<LevantamentoServico>): LevantamentoServico {
  return {
    id: 'lev_1',
    obraId: 'obra_1',
    ambienteId: 'amb_1',
    servicoId: 'serv_1',
    unidade: 'm2',
    valorUnitario: 35,
    bdiPercentual: 35,
    usaBdi: true,
    vaos: [],
    criadoEm: agora,
    atualizadoEm: agora,
    ...parcial,
  }
}

describe('cálculo de levantamento', () => {
  it('calcula parede sem vão', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({ comprimento: 4, altura: 2.8 })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.areaBruta).toBeCloseTo(11.2)
    expect(resultado.saldo).toBeCloseTo(11.2)
    expect(resultado.subtotal).toBeCloseTo(392)
    expect(resultado.valorBdi).toBeCloseTo(137.2)
    expect(resultado.total).toBeCloseTo(529.2)
  })

  it('calcula parede com vão', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({
      comprimento: 5,
      altura: 2.8,
      vaos: [
        {
          id: 'vao_1',
          levantamentoId: 'lev_1',
          tipo: 'porta',
          largura: 0.8,
          altura: 2.1,
          quantidade: 1,
          criadoEm: agora,
          atualizadoEm: agora,
        },
        {
          id: 'vao_2',
          levantamentoId: 'lev_1',
          tipo: 'janela',
          largura: 1.5,
          altura: 1.2,
          quantidade: 1,
          criadoEm: agora,
          atualizadoEm: agora,
        },
      ],
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.areaBruta).toBeCloseTo(14)
    expect(resultado.areaDescontada).toBeCloseTo(3.48)
    expect(resultado.saldo).toBeCloseTo(10.52)
    expect(resultado.subtotal).toBeCloseTo(368.2)
    expect(resultado.valorBdi).toBeCloseTo(128.87)
    expect(resultado.total).toBeCloseTo(497.07)
  })

  it('calcula piso', () => {
    const servico = criarServico({ tipoCalculo: 'piso', categoria: 'pisos' })
    const levantamento = criarLevantamento({ comprimento: 4, largura: 3, valorUnitario: 60 })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.areaBruta).toBeCloseTo(12)
    expect(resultado.subtotal).toBeCloseTo(720)
    expect(resultado.valorBdi).toBeCloseTo(252)
    expect(resultado.total).toBeCloseTo(972)
  })

  it('calcula item unitário', () => {
    const servico = criarServico({ tipoCalculo: 'item_unitario', categoria: 'acabamentos', unidade: 'un' })
    const levantamento = criarLevantamento({ quantidade: 2, valorUnitario: 250, unidade: 'un' })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.saldo).toBeCloseTo(2)
    expect(resultado.subtotal).toBeCloseTo(500)
    expect(resultado.valorBdi).toBeCloseTo(175)
    expect(resultado.total).toBeCloseTo(675)
  })

  it('calcula valor manual', () => {
    const servico = criarServico({ tipoCalculo: 'valor_manual', categoria: 'instalacoes', unidade: 'verba' })
    const levantamento = criarLevantamento({ valorManual: 1000, unidade: 'verba' })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.subtotal).toBeCloseTo(1000)
    expect(resultado.valorBdi).toBeCloseTo(350)
    expect(resultado.total).toBeCloseTo(1350)
  })

  it('calcula comprimento linear', () => {
    const servico = criarServico({ tipoCalculo: 'comprimento_linear', categoria: 'pisos', unidade: 'm' })
    const levantamento = criarLevantamento({ comprimento: 12, valorUnitario: 15, unidade: 'm' })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.saldo).toBeCloseTo(12)
    expect(resultado.subtotal).toBeCloseTo(180)
    expect(resultado.valorBdi).toBeCloseTo(63)
    expect(resultado.total).toBeCloseTo(243)
  })

  it('gera erro quando área descontada é maior que área bruta', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({
      comprimento: 1,
      altura: 1,
      vaos: [
        {
          id: 'vao_1',
          levantamentoId: 'lev_1',
          tipo: 'porta',
          largura: 2,
          altura: 2,
          quantidade: 1,
          criadoEm: agora,
          atualizadoEm: agora,
        },
      ],
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toContain('Área descontada não pode ser maior que a área bruta.')
    expect(resultado.total).toBeCloseTo(0)
  })

  it('gera erro quando valor unitário é negativo', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({ comprimento: 4, altura: 2.8, valorUnitario: -1 })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toContain('Valor unitário não pode ser negativo.')
    expect(resultado.total).toBeCloseTo(0)
  })
})
```

### 6.4 `tests/calculos/resumo.test.ts`

```ts
// tests/calculos/resumo.test.ts

import { describe, expect, it } from 'vitest'
import { calcularResumoObra } from '@/lib/calculos/resumo'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'

const agora = '2026-01-01T00:00:00.000Z'

const servicos: Servico[] = [
  {
    id: 'serv_reboco',
    nome: 'Reboco interno',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 35,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_piso',
    nome: 'Piso',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 60,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
]

function criarLevantamento(parcial: Partial<LevantamentoServico>): LevantamentoServico {
  return {
    id: 'lev_1',
    obraId: 'obra_1',
    ambienteId: 'amb_1',
    servicoId: 'serv_reboco',
    unidade: 'm2',
    valorUnitario: 35,
    bdiPercentual: 35,
    usaBdi: true,
    vaos: [],
    criadoEm: agora,
    atualizadoEm: agora,
    ...parcial,
  }
}

describe('resumo da obra', () => {
  it('agrupa e soma por categoria', () => {
    const levantamentos: LevantamentoServico[] = [
      criarLevantamento({ id: 'lev_1', servicoId: 'serv_reboco', comprimento: 4, altura: 2.8 }),
      criarLevantamento({ id: 'lev_2', servicoId: 'serv_piso', comprimento: 4, largura: 3, valorUnitario: 60 }),
    ]

    const resumo = calcularResumoObra(levantamentos, servicos)

    expect(resumo.quantidadeItens).toBe(2)
    expect(resumo.quantidadeItensComErro).toBe(0)
    expect(resumo.categorias).toHaveLength(2)
    expect(resumo.subtotal).toBeCloseTo(1112)
    expect(resumo.valorBdi).toBeCloseTo(389.2)
    expect(resumo.total).toBeCloseTo(1501.2)
  })

  it('conta item com erro e não soma no total', () => {
    const levantamentos: LevantamentoServico[] = [
      criarLevantamento({ id: 'lev_1', servicoId: 'serv_reboco', comprimento: 4, altura: 2.8 }),
      criarLevantamento({ id: 'lev_erro', servicoId: 'serv_reboco', comprimento: 1, altura: 1, valorUnitario: -10 }),
    ]

    const resumo = calcularResumoObra(levantamentos, servicos)

    expect(resumo.quantidadeItens).toBe(1)
    expect(resumo.quantidadeItensComErro).toBe(1)
    expect(resumo.subtotal).toBeCloseTo(392)
    expect(resumo.valorBdi).toBeCloseTo(137.2)
    expect(resumo.total).toBeCloseTo(529.2)
  })
})
```

---

## 7. Rodar validação

Depois de criar todos os arquivos:

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

## 8. Commit sugerido

```powershell
git add .
git commit -m "feat: adicionar tipos e motor de calculo do mvp"
```

---

## 9. Observações técnicas importantes

1. O motor ainda não arredonda valores internamente.
2. Arredondamento deve ser apenas visual no MVP.
3. Os testes usam `toBeCloseTo` para evitar erro de ponto flutuante.
4. O cálculo combina `levantamento.usaBdi` e `servico.usaBdi`.
5. Se qualquer um dos dois estiver falso, o BDI não é aplicado.
6. Itens com erro são ignorados no resumo geral.
7. Isso é proposital para não contaminar o total da obra com cálculo inválido.

---

## 10. Próxima etapa depois desta

Depois que esta etapa passar em `npm test` e `npm run build`, avançar para:

```text
Etapa 2 — Storage local + serviços padrão + obra exemplo
```

Ainda sem interface completa.

A próxima camada deve permitir salvar/carregar dados no navegador antes de criar telas mais complexas.
