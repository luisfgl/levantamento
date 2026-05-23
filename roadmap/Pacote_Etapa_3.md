# Pacote Etapa 3 — Interface Básica e CRUD de Obras

## 1. Objetivo

Esta etapa cria a primeira interface funcional do MVP.

Entrega esperada:

```text
Página inicial + listagem de obras + criação de obra + abertura da obra + inicialização dos serviços padrão
```

Ainda não entra levantamento completo, vãos, resumo visual ou PDF.

---

## 2. Escopo desta etapa

### Incluído

1. Página inicial simples.
2. Página `/obras` com lista de obras.
3. Formulário para criar obra.
4. Exclusão de obra.
5. Página `/obras/[obraId]` para abrir uma obra.
6. Abas internas placeholder:

   * Dados da obra;
   * Ambientes;
   * Serviços;
   * Levantamento;
   * Resumo;
   * Exportar.
7. Inicialização de serviços padrão se ainda não existirem.
8. Uso do `localStorage` já criado na Etapa 2.

### Fora desta etapa

1. CRUD completo de ambientes.
2. CRUD completo de serviços.
3. Formulário de levantamento.
4. Modal de vãos.
5. Resumo calculado visual.
6. Exportação via botão.
7. Supabase.
8. PDF.

---

## 3. Arquivos novos ou alterados

Arquivos principais:

```text
src/app/page.tsx
src/app/obras/page.tsx
src/app/obras/[obraId]/page.tsx

components/obras/ObraForm.tsx
components/obras/ObraCard.tsx
components/obras/ObrasList.tsx

components/ui/Button.tsx
components/ui/Input.tsx
components/ui/Textarea.tsx
components/ui/Card.tsx

lib/storage/inicializacaoStorage.ts
```

Se as pastas não existirem, criar:

```powershell
mkdir components
mkdir components\ui
mkdir components\obras
mkdir src\app\obras
mkdir src\app\obras\[obraId]
```

---

## 4. `components/ui/Button.tsx`

```tsx
// components/ui/Button.tsx

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## 5. `components/ui/Input.tsx`

```tsx
// components/ui/Input.tsx

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
```

---

## 6. `components/ui/Textarea.tsx`

```tsx
// components/ui/Textarea.tsx

import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name

  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <textarea
        id={textareaId}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
```

---

## 7. `components/ui/Card.tsx`

```tsx
// components/ui/Card.tsx

import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>
}
```

---

## 8. `lib/storage/inicializacaoStorage.ts`

```ts
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
```

---

## 9. `components/obras/ObraForm.tsx`

```tsx
// components/obras/ObraForm.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Obra } from '@/lib/tipos/obra'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

interface ObraFormProps {
  onSalvar: (obra: Obra) => void
}

export function ObraForm({ onSalvar }: ObraFormProps) {
  const [nome, setNome] = useState('')
  const [cliente, setCliente] = useState('')
  const [endereco, setEndereco] = useState('')
  const [responsavelTecnico, setResponsavelTecnico] = useState('')
  const [registroProfissional, setRegistroProfissional] = useState('')
  const [dataOrcamento, setDataOrcamento] = useState(new Date().toISOString().slice(0, 10))
  const [bdiPadrao, setBdiPadrao] = useState('35')
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function limparFormulario() {
    setNome('')
    setCliente('')
    setEndereco('')
    setResponsavelTecnico('')
    setRegistroProfissional('')
    setDataOrcamento(new Date().toISOString().slice(0, 10))
    setBdiPadrao('35')
    setObservacoes('')
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const bdi = normalizarNumeroEntrada(bdiPadrao)

    if (!nome.trim()) {
      setErro('Informe o nome da obra.')
      return
    }

    if (!cliente.trim()) {
      setErro('Informe o cliente.')
      return
    }

    if (!Number.isFinite(bdi) || bdi < 0) {
      setErro('Informe um BDI válido.')
      return
    }

    const agora = new Date().toISOString()

    const obra: Obra = {
      id: criarId('obra'),
      nome: nome.trim(),
      cliente: cliente.trim(),
      endereco: endereco.trim() || undefined,
      responsavelTecnico: responsavelTecnico.trim() || undefined,
      registroProfissional: registroProfissional.trim() || undefined,
      dataOrcamento,
      bdiPadraoPercentual: bdi,
      observacoes: observacoes.trim() || undefined,
      status: 'rascunho',
      criadoEm: agora,
      atualizadoEm: agora,
    }

    onSalvar(obra)
    limparFormulario()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nome da obra" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input label="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        <Input label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        <Input label="Data do orçamento" type="date" value={dataOrcamento} onChange={(e) => setDataOrcamento(e.target.value)} />
        <Input label="Responsável técnico" value={responsavelTecnico} onChange={(e) => setResponsavelTecnico(e.target.value)} />
        <Input label="Registro profissional" value={registroProfissional} onChange={(e) => setRegistroProfissional(e.target.value)} />
        <Input label="BDI padrão (%)" value={bdiPadrao} onChange={(e) => setBdiPadrao(e.target.value)} />
      </div>

      <Textarea label="Observações" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <Button type="submit">Criar obra</Button>
    </form>
  )
}
```

---

## 10. `components/obras/ObraCard.tsx`

```tsx
// components/obras/ObraCard.tsx

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Obra } from '@/lib/tipos/obra'
import { formatarPercentual } from '@/lib/utils/formatacao'

interface ObraCardProps {
  obra: Obra
  onExcluir: (obraId: string) => void
}

export function ObraCard({ obra, onExcluir }: ObraCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{obra.nome}</h3>
          <p className="text-sm text-slate-600">Cliente: {obra.cliente}</p>
          {obra.endereco ? <p className="text-sm text-slate-600">Endereço: {obra.endereco}</p> : null}
          <p className="text-sm text-slate-600">BDI padrão: {formatarPercentual(obra.bdiPadraoPercentual)}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Status: {obra.status}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/obras/${obra.id}`}>
            <Button type="button" variant="secondary">Abrir</Button>
          </Link>
          <Button type="button" variant="danger" onClick={() => onExcluir(obra.id)}>
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

---

## 11. `components/obras/ObrasList.tsx`

```tsx
// components/obras/ObrasList.tsx

'use client'

import { ObraCard } from './ObraCard'
import type { Obra } from '@/lib/tipos/obra'

interface ObrasListProps {
  obras: Obra[]
  onExcluir: (obraId: string) => void
}

export function ObrasList({ obras, onExcluir }: ObrasListProps) {
  if (obras.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
        Nenhuma obra cadastrada ainda.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {obras.map((obra) => (
        <ObraCard key={obra.id} obra={obra} onExcluir={onExcluir} />
      ))}
    </div>
  )
}
```

---

## 12. `src/app/page.tsx`

```tsx
// src/app/page.tsx

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <section className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">MVP Local</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Levantamento de Serviços e Valores
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Sistema local para cadastrar obras, estruturar serviços, lançar medições e preparar a base de orçamento técnico.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/obras"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Acessar obras
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">1. Obras</h2>
            <p className="mt-2 text-sm text-slate-600">Cadastre obras e dados básicos do orçamento.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">2. Serviços</h2>
            <p className="mt-2 text-sm text-slate-600">Use serviços padrão e depois personalize valores unitários.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">3. Levantamento</h2>
            <p className="mt-2 text-sm text-slate-600">A etapa de lançamento será construída após o CRUD básico.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
```

---

## 13. `src/app/obras/page.tsx`

```tsx
// src/app/obras/page.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ObraForm } from '@/components/obras/ObraForm'
import { ObrasList } from '@/components/obras/ObrasList'
import { Card } from '@/components/ui/Card'
import { servicosPadrao } from '@/lib/dados/servicosPadrao'
import { STORAGE_KEYS } from '@/lib/storage/storageKeys'
import { carregarLista, removerItem, salvarLista } from '@/lib/storage/projetoStorage'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    const obrasSalvas = carregarLista<Obra>(STORAGE_KEYS.OBRAS)
    const servicosSalvos = carregarLista<Servico>(STORAGE_KEYS.SERVICOS)

    if (servicosSalvos.length === 0) {
      salvarLista(STORAGE_KEYS.SERVICOS, servicosPadrao)
    }

    setObras(obrasSalvas)
    setCarregado(true)
  }, [])

  function handleSalvarObra(obra: Obra) {
    const novaLista = [...obras, obra]
    salvarLista(STORAGE_KEYS.OBRAS, novaLista)
    setObras(novaLista)
  }

  function handleExcluirObra(obraId: string) {
    const confirmar = window.confirm('Excluir esta obra e seus dados relacionados?')
    if (!confirmar) return

    const novasObras = removerItem<Obra>(STORAGE_KEYS.OBRAS, obraId)

    const ambientes = carregarLista<Ambiente>(STORAGE_KEYS.AMBIENTES)
    salvarLista(
      STORAGE_KEYS.AMBIENTES,
      ambientes.filter((ambiente) => ambiente.obraId !== obraId),
    )

    const levantamentos = carregarLista<LevantamentoServico>(STORAGE_KEYS.LEVANTAMENTOS)
    salvarLista(
      STORAGE_KEYS.LEVANTAMENTOS,
      levantamentos.filter((levantamento) => levantamento.obraId !== obraId),
    )

    setObras(novasObras)
  }

  if (!carregado) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <p className="text-slate-600">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Obras</p>
            <h1 className="text-3xl font-bold text-slate-950">Levantamento de Serviços e Valores</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            Voltar
          </Link>
        </div>

        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Nova obra</h2>
            <p className="text-sm text-slate-600">Cadastre a base do orçamento técnico.</p>
          </div>
          <ObraForm onSalvar={handleSalvarObra} />
        </Card>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Obras cadastradas</h2>
            <p className="text-sm text-slate-600">Total: {obras.length}</p>
          </div>
          <ObrasList obras={obras} onExcluir={handleExcluirObra} />
        </section>
      </div>
    </main>
  )
}
```

---

## 14. `src/app/obras/[obraId]/page.tsx`

```tsx
// src/app/obras/[obraId]/page.tsx

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { STORAGE_KEYS } from '@/lib/storage/storageKeys'
import { carregarLista } from '@/lib/storage/projetoStorage'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'
import { formatarPercentual } from '@/lib/utils/formatacao'

const abas = ['Dados da obra', 'Ambientes', 'Serviços', 'Levantamento', 'Resumo', 'Exportar']

export default function ObraDetalhePage() {
  const params = useParams<{ obraId: string }>()
  const obraId = params.obraId

  const [obra, setObra] = useState<Obra | null>(null)
  const [ambientes, setAmbientes] = useState<Ambiente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [levantamentos, setLevantamentos] = useState<LevantamentoServico[]>([])
  const [abaAtiva, setAbaAtiva] = useState('Dados da obra')
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    const obras = carregarLista<Obra>(STORAGE_KEYS.OBRAS)
    const obraEncontrada = obras.find((item) => item.id === obraId) ?? null

    setObra(obraEncontrada)
    setAmbientes(carregarLista<Ambiente>(STORAGE_KEYS.AMBIENTES).filter((item) => item.obraId === obraId))
    setServicos(carregarLista<Servico>(STORAGE_KEYS.SERVICOS))
    setLevantamentos(
      carregarLista<LevantamentoServico>(STORAGE_KEYS.LEVANTAMENTOS).filter((item) => item.obraId === obraId),
    )
    setCarregado(true)
  }, [obraId])

  if (!carregado) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <p className="text-slate-600">Carregando...</p>
      </main>
    )
  }

  if (!obra) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-2xl font-bold text-slate-950">Obra não encontrada</h1>
          <Link href="/obras" className="text-sm font-medium text-slate-700 hover:text-slate-950">
            Voltar para obras
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/obras" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              ← Voltar para obras
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">{obra.nome}</h1>
            <p className="text-slate-600">Cliente: {obra.cliente}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">BDI padrão</p>
            <p className="text-xl font-semibold text-slate-950">{formatarPercentual(obra.bdiPadraoPercentual)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {abas.map((aba) => (
            <button
              key={aba}
              type="button"
              onClick={() => setAbaAtiva(aba)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                abaAtiva === aba ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {aba}
            </button>
          ))}
        </div>

        {abaAtiva === 'Dados da obra' ? (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Dados da obra</h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Nome</dt>
                <dd className="text-slate-900">{obra.nome}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Cliente</dt>
                <dd className="text-slate-900">{obra.cliente}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Endereço</dt>
                <dd className="text-slate-900">{obra.endereco ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Data</dt>
                <dd className="text-slate-900">{obra.dataOrcamento}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Responsável técnico</dt>
                <dd className="text-slate-900">{obra.responsavelTecnico ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Registro</dt>
                <dd className="text-slate-900">{obra.registroProfissional ?? 'Não informado'}</dd>
              </div>
            </dl>
          </Card>
        ) : null}

        {abaAtiva === 'Ambientes' ? (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Ambientes</h2>
            <p className="mt-2 text-sm text-slate-600">Quantidade cadastrada: {ambientes.length}</p>
            <p className="mt-4 text-sm text-slate-500">CRUD de ambientes entra na próxima etapa.</p>
          </Card>
        ) : null}

        {abaAtiva === 'Serviços' ? (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Serviços</h2>
            <p className="mt-2 text-sm text-slate-600">Serviços carregados: {servicos.length}</p>
            <p className="mt-4 text-sm text-slate-500">Edição de serviços entra na próxima etapa.</p>
          </Card>
        ) : null}

        {abaAtiva === 'Levantamento' ? (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Levantamento</h2>
            <p className="mt-2 text-sm text-slate-600">Itens lançados: {levantamentos.length}</p>
            <p className="mt-4 text-sm text-slate-500">Formulário de levantamento entra depois do CRUD de ambientes e serviços.</p>
          </Card>
        ) : null}

        {abaAtiva === 'Resumo' ? (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Resumo</h2>
            <p className="mt-2 text-sm text-slate-500">Resumo visual entra após os lançamentos de levantamento.</p>
          </Card>
        ) : null}

        {abaAtiva === 'Exportar' ? (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Exportar</h2>
            <p className="mt-2 text-sm text-slate-500">Botão de exportação JSON entra em etapa própria.</p>
          </Card>
        ) : null}
      </div>
    </main>
  )
}
```

---

## 15. Validação

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

Rodar localmente:

```powershell
npm run dev
```

Testar no navegador:

```text
http://localhost:3000
http://localhost:3000/obras
```

Checklist manual:

* [ ] Página inicial abre.
* [ ] Botão “Acessar obras” funciona.
* [ ] Página de obras abre.
* [ ] Criar obra funciona.
* [ ] Obra aparece na lista.
* [ ] Botão “Abrir” funciona.
* [ ] Página da obra abre.
* [ ] Abas internas funcionam.
* [ ] Aba Serviços mostra quantidade de serviços padrão.
* [ ] Excluir obra funciona.
* [ ] Recarregar página preserva obras.

---

## 16. Commit sugerido

Depois da validação:

```powershell
git status
git add .
git commit -m "feat: adicionar interface basica de obras"
git push
```

---

## 17. Observação importante

Esta etapa cria interface, mas ainda não cria o fluxo completo de orçamento.

O objetivo aqui é validar navegação, criação de obra, persistência local e carregamento dos serviços padrão. Se essa base ficar sólida, a próxima etapa pode implementar ambientes e serviços com menos risco.
