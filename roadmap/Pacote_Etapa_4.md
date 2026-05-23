# Pacote Etapa 4 — Ambientes e Serviços

## 1. Objetivo

Esta etapa adiciona a gestão básica de ambientes e serviços dentro da página da obra.

Entrega esperada:

```text
CRUD de ambientes + listagem de serviços + edição de valores unitários + ativar/inativar serviços
```

Ainda não entra lançamento completo de levantamento.

---

## 2. Escopo desta etapa

### Incluído

1. Criar ambiente.
2. Editar ambiente.
3. Excluir ambiente.
4. Listar ambientes da obra.
5. Listar serviços padrão.
6. Editar valor unitário padrão do serviço.
7. Editar nome/categoria/unidade/tipo de cálculo do serviço.
8. Ativar/inativar serviço.
9. Criar serviço novo.
10. Persistir tudo no `localStorage`.

### Fora desta etapa

1. Lançamento de levantamento.
2. Vãos.
3. Resumo financeiro visual.
4. Exportação por botão.
5. Supabase.
6. PDF.

---

## 3. Arquivos novos ou alterados

Criar:

```text
components/ambientes/AmbienteForm.tsx
components/ambientes/AmbientesTable.tsx

components/servicos/ServicoForm.tsx
components/servicos/ServicosTable.tsx

components/ui/Select.tsx
```

Alterar:

```text
src/app/obras/[obraId]/page.tsx
```

Se necessário, criar pastas:

```powershell
mkdir components\ambientes
mkdir components\servicos
```

---

## 4. `components/ui/Select.tsx`

```tsx
// components/ui/Select.tsx

import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{
    label: string
    value: string
  }>
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <select
        id={selectId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
```

---

## 5. `components/ambientes/AmbienteForm.tsx`

```tsx
// components/ambientes/AmbienteForm.tsx

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Ambiente } from '@/lib/tipos/ambiente'
import { criarId } from '@/lib/utils/id'

interface AmbienteFormProps {
  obraId: string
  ambienteEmEdicao?: Ambiente | null
  proximaOrdem: number
  onSalvar: (ambiente: Ambiente) => void
  onCancelarEdicao?: () => void
}

export function AmbienteForm({
  obraId,
  ambienteEmEdicao,
  proximaOrdem,
  onSalvar,
  onCancelarEdicao,
}: AmbienteFormProps) {
  const [pavimento, setPavimento] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(ambienteEmEdicao)

  useEffect(() => {
    if (!ambienteEmEdicao) {
      setPavimento('')
      setNome('')
      setDescricao('')
      setErro(null)
      return
    }

    setPavimento(ambienteEmEdicao.pavimento ?? '')
    setNome(ambienteEmEdicao.nome)
    setDescricao(ambienteEmEdicao.descricao ?? '')
    setErro(null)
  }, [ambienteEmEdicao])

  function limparFormulario() {
    setPavimento('')
    setNome('')
    setDescricao('')
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!nome.trim()) {
      setErro('Informe o nome do ambiente.')
      return
    }

    const agora = new Date().toISOString()

    const ambiente: Ambiente = {
      id: ambienteEmEdicao?.id ?? criarId('amb'),
      obraId,
      pavimento: pavimento.trim() || undefined,
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      ordem: ambienteEmEdicao?.ordem ?? proximaOrdem,
      criadoEm: ambienteEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(ambiente)

    if (!editando) {
      limparFormulario()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Pavimento" value={pavimento} onChange={(e) => setPavimento(e.target.value)} />
        <Input label="Nome do ambiente" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      <Textarea label="Descrição" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar ambiente' : 'Adicionar ambiente'}</Button>
        {editando && onCancelarEdicao ? (
          <Button type="button" variant="secondary" onClick={onCancelarEdicao}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
```

---

## 6. `components/ambientes/AmbientesTable.tsx`

```tsx
// components/ambientes/AmbientesTable.tsx

'use client'

import { Button } from '@/components/ui/Button'
import type { Ambiente } from '@/lib/tipos/ambiente'

interface AmbientesTableProps {
  ambientes: Ambiente[]
  onEditar: (ambiente: Ambiente) => void
  onExcluir: (ambienteId: string) => void
}

export function AmbientesTable({ ambientes, onEditar, onExcluir }: AmbientesTableProps) {
  if (ambientes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum ambiente cadastrado para esta obra.
      </div>
    )
  }

  const ambientesOrdenados = [...ambientes].sort((a, b) => a.ordem - b.ordem)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Ordem</th>
            <th className="px-4 py-3">Pavimento</th>
            <th className="px-4 py-3">Ambiente</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {ambientesOrdenados.map((ambiente) => (
            <tr key={ambiente.id}>
              <td className="px-4 py-3 text-slate-600">{ambiente.ordem}</td>
              <td className="px-4 py-3 text-slate-600">{ambiente.pavimento ?? '-'}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{ambiente.nome}</td>
              <td className="px-4 py-3 text-slate-600">{ambiente.descricao ?? '-'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => onEditar(ambiente)}>
                    Editar
                  </Button>
                  <Button type="button" variant="danger" onClick={() => onExcluir(ambiente.id)}>
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 7. `components/servicos/ServicoForm.tsx`

```tsx
// components/servicos/ServicoForm.tsx

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { CategoriaServico, TipoCalculoServico, UnidadeMedida } from '@/lib/tipos/comum'
import type { Servico } from '@/lib/tipos/servico'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

const categoriaOptions: Array<{ label: string; value: CategoriaServico }> = [
  { label: 'Reboco', value: 'reboco' },
  { label: 'Pisos', value: 'pisos' },
  { label: 'Revestimentos', value: 'revestimentos' },
  { label: 'Pintura', value: 'pintura' },
  { label: 'Muros', value: 'muros' },
  { label: 'Acabamentos', value: 'acabamentos' },
  { label: 'Instalações', value: 'instalacoes' },
  { label: 'Complementação', value: 'complementacao' },
  { label: 'Outros', value: 'outros' },
]

const unidadeOptions: Array<{ label: string; value: UnidadeMedida }> = [
  { label: 'm²', value: 'm2' },
  { label: 'm', value: 'm' },
  { label: 'un', value: 'un' },
  { label: 'verba', value: 'verba' },
  { label: 'ponto', value: 'ponto' },
  { label: 'conjunto', value: 'conjunto' },
]

const tipoCalculoOptions: Array<{ label: string; value: TipoCalculoServico }> = [
  { label: 'Parede', value: 'parede' },
  { label: 'Piso', value: 'piso' },
  { label: 'Item unitário', value: 'item_unitario' },
  { label: 'Valor manual', value: 'valor_manual' },
  { label: 'Comprimento linear', value: 'comprimento_linear' },
]

interface ServicoFormProps {
  servicoEmEdicao?: Servico | null
  onSalvar: (servico: Servico) => void
  onCancelarEdicao?: () => void
}

export function ServicoForm({ servicoEmEdicao, onSalvar, onCancelarEdicao }: ServicoFormProps) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<CategoriaServico>('outros')
  const [unidade, setUnidade] = useState<UnidadeMedida>('m2')
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculoServico>('parede')
  const [valorUnitarioPadrao, setValorUnitarioPadrao] = useState('0')
  const [usaBdi, setUsaBdi] = useState(true)
  const [ativo, setAtivo] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(servicoEmEdicao)

  useEffect(() => {
    if (!servicoEmEdicao) {
      setNome('')
      setCategoria('outros')
      setUnidade('m2')
      setTipoCalculo('parede')
      setValorUnitarioPadrao('0')
      setUsaBdi(true)
      setAtivo(true)
      setErro(null)
      return
    }

    setNome(servicoEmEdicao.nome)
    setCategoria(servicoEmEdicao.categoria)
    setUnidade(servicoEmEdicao.unidade)
    setTipoCalculo(servicoEmEdicao.tipoCalculo)
    setValorUnitarioPadrao(String(servicoEmEdicao.valorUnitarioPadrao))
    setUsaBdi(servicoEmEdicao.usaBdi)
    setAtivo(servicoEmEdicao.ativo)
    setErro(null)
  }, [servicoEmEdicao])

  function limparFormulario() {
    setNome('')
    setCategoria('outros')
    setUnidade('m2')
    setTipoCalculo('parede')
    setValorUnitarioPadrao('0')
    setUsaBdi(true)
    setAtivo(true)
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const valor = normalizarNumeroEntrada(valorUnitarioPadrao)

    if (!nome.trim()) {
      setErro('Informe o nome do serviço.')
      return
    }

    if (!Number.isFinite(valor) || valor < 0) {
      setErro('Informe um valor unitário válido.')
      return
    }

    const agora = new Date().toISOString()

    const servico: Servico = {
      id: servicoEmEdicao?.id ?? criarId('serv'),
      nome: nome.trim(),
      categoria,
      unidade,
      valorUnitarioPadrao: valor,
      tipoCalculo,
      usaBdi,
      ativo,
      criadoEm: servicoEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(servico)

    if (!editando) {
      limparFormulario()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Input label="Nome do serviço" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaServico)} options={categoriaOptions} />
        <Select label="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value as UnidadeMedida)} options={unidadeOptions} />
        <Select
          label="Tipo de cálculo"
          value={tipoCalculo}
          onChange={(e) => setTipoCalculo(e.target.value as TipoCalculoServico)}
          options={tipoCalculoOptions}
        />
        <Input
          label="Valor unitário padrão"
          value={valorUnitarioPadrao}
          onChange={(e) => setValorUnitarioPadrao(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={usaBdi} onChange={(e) => setUsaBdi(e.target.checked)} />
          Usa BDI
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Serviço ativo
        </label>
      </div>

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar serviço' : 'Adicionar serviço'}</Button>
        {editando && onCancelarEdicao ? (
          <Button type="button" variant="secondary" onClick={onCancelarEdicao}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
```

---

## 8. `components/servicos/ServicosTable.tsx`

```tsx
// components/servicos/ServicosTable.tsx

'use client'

import { Button } from '@/components/ui/Button'
import type { Servico } from '@/lib/tipos/servico'
import { formatarMoeda } from '@/lib/utils/formatacao'

interface ServicosTableProps {
  servicos: Servico[]
  onEditar: (servico: Servico) => void
  onAlternarAtivo: (servico: Servico) => void
}

export function ServicosTable({ servicos, onEditar, onAlternarAtivo }: ServicosTableProps) {
  if (servicos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum serviço cadastrado.
      </div>
    )
  }

  const servicosOrdenados = [...servicos].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome))

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Serviço</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Unidade</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3 text-right">Valor padrão</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {servicosOrdenados.map((servico) => (
            <tr key={servico.id} className={servico.ativo ? '' : 'bg-slate-50 text-slate-500'}>
              <td className="px-4 py-3 font-medium text-slate-900">{servico.nome}</td>
              <td className="px-4 py-3 text-slate-600">{servico.categoria}</td>
              <td className="px-4 py-3 text-slate-600">{servico.unidade}</td>
              <td className="px-4 py-3 text-slate-600">{servico.tipoCalculo}</td>
              <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(servico.valorUnitarioPadrao)}</td>
              <td className="px-4 py-3 text-slate-600">{servico.ativo ? 'Ativo' : 'Inativo'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => onEditar(servico)}>
                    Editar
                  </Button>
                  <Button type="button" variant={servico.ativo ? 'ghost' : 'secondary'} onClick={() => onAlternarAtivo(servico)}>
                    {servico.ativo ? 'Inativar' : 'Ativar'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 9. Alterar `src/app/obras/[obraId]/page.tsx`

Substituir o arquivo inteiro por:

```tsx
// src/app/obras/[obraId]/page.tsx

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AmbienteForm } from '@/components/ambientes/AmbienteForm'
import { AmbientesTable } from '@/components/ambientes/AmbientesTable'
import { ServicoForm } from '@/components/servicos/ServicoForm'
import { ServicosTable } from '@/components/servicos/ServicosTable'
import { Card } from '@/components/ui/Card'
import { STORAGE_KEYS } from '@/lib/storage/storageKeys'
import { carregarLista, salvarLista } from '@/lib/storage/projetoStorage'
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
  const [ambienteEmEdicao, setAmbienteEmEdicao] = useState<Ambiente | null>(null)
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null)
  const [abaAtiva, setAbaAtiva] = useState('Dados da obra')
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const obras = carregarLista<Obra>(STORAGE_KEYS.OBRAS)
      const obraEncontrada = obras.find((item) => item.id === obraId) ?? null

      setObra(obraEncontrada)
      setAmbientes(carregarLista<Ambiente>(STORAGE_KEYS.AMBIENTES).filter((item) => item.obraId === obraId))
      setServicos(carregarLista<Servico>(STORAGE_KEYS.SERVICOS))
      setLevantamentos(
        carregarLista<LevantamentoServico>(STORAGE_KEYS.LEVANTAMENTOS).filter((item) => item.obraId === obraId),
      )
      setCarregado(true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [obraId])

  const proximaOrdemAmbiente = useMemo(() => {
    if (ambientes.length === 0) return 1
    return Math.max(...ambientes.map((ambiente) => ambiente.ordem)) + 1
  }, [ambientes])

  function salvarAmbientesDaObra(novosAmbientesDaObra: Ambiente[]) {
    const todosAmbientes = carregarLista<Ambiente>(STORAGE_KEYS.AMBIENTES)
    const ambientesDeOutrasObras = todosAmbientes.filter((ambiente) => ambiente.obraId !== obraId)
    const novaListaGlobal = [...ambientesDeOutrasObras, ...novosAmbientesDaObra]

    salvarLista(STORAGE_KEYS.AMBIENTES, novaListaGlobal)
    setAmbientes(novosAmbientesDaObra)
  }

  function handleSalvarAmbiente(ambiente: Ambiente) {
    const existe = ambientes.some((item) => item.id === ambiente.id)
    const novaLista = existe ? ambientes.map((item) => (item.id === ambiente.id ? ambiente : item)) : [...ambientes, ambiente]

    salvarAmbientesDaObra(novaLista)
    setAmbienteEmEdicao(null)
  }

  function handleExcluirAmbiente(ambienteId: string) {
    const ambienteTemLevantamento = levantamentos.some((levantamento) => levantamento.ambienteId === ambienteId)

    if (ambienteTemLevantamento) {
      window.alert('Não é possível excluir ambiente com levantamento vinculado.')
      return
    }

    const confirmar = window.confirm('Excluir este ambiente?')
    if (!confirmar) return

    salvarAmbientesDaObra(ambientes.filter((ambiente) => ambiente.id !== ambienteId))

    if (ambienteEmEdicao?.id === ambienteId) {
      setAmbienteEmEdicao(null)
    }
  }

  function handleSalvarServico(servico: Servico) {
    const existe = servicos.some((item) => item.id === servico.id)
    const novaLista = existe ? servicos.map((item) => (item.id === servico.id ? servico : item)) : [...servicos, servico]

    salvarLista(STORAGE_KEYS.SERVICOS, novaLista)
    setServicos(novaLista)
    setServicoEmEdicao(null)
  }

  function handleAlternarServicoAtivo(servico: Servico) {
    const atualizado: Servico = {
      ...servico,
      ativo: !servico.ativo,
      atualizadoEm: new Date().toISOString(),
    }

    handleSalvarServico(atualizado)
  }

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
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-slate-900">
                {ambienteEmEdicao ? 'Editar ambiente' : 'Novo ambiente'}
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-600">Cadastre os ambientes físicos da obra.</p>
              <AmbienteForm
                obraId={obra.id}
                ambienteEmEdicao={ambienteEmEdicao}
                proximaOrdem={proximaOrdemAmbiente}
                onSalvar={handleSalvarAmbiente}
                onCancelarEdicao={() => setAmbienteEmEdicao(null)}
              />
            </Card>

            <AmbientesTable ambientes={ambientes} onEditar={setAmbienteEmEdicao} onExcluir={handleExcluirAmbiente} />
          </div>
        ) : null}

        {abaAtiva === 'Serviços' ? (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-slate-900">
                {servicoEmEdicao ? 'Editar serviço' : 'Novo serviço'}
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-600">Configure os serviços e valores padrão do orçamento.</p>
              <ServicoForm
                servicoEmEdicao={servicoEmEdicao}
                onSalvar={handleSalvarServico}
                onCancelarEdicao={() => setServicoEmEdicao(null)}
              />
            </Card>

            <ServicosTable servicos={servicos} onEditar={setServicoEmEdicao} onAlternarAtivo={handleAlternarServicoAtivo} />
          </div>
        ) : null}

        {abaAtiva === 'Levantamento' ? (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Levantamento</h2>
            <p className="mt-2 text-sm text-slate-600">Itens lançados: {levantamentos.length}</p>
            <p className="mt-4 text-sm text-slate-500">Formulário de levantamento entra na próxima etapa.</p>
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

## 10. Validação

Rodar:

```powershell
npm run lint
npm test
npm run build
```

Rodar localmente:

```powershell
npm run dev
```

Checklist manual:

* [X] Abrir obra existente.
* [X] Aba Ambientes abre.
* [X] Criar ambiente funciona.
* [X] Editar ambiente funciona.
* [X] Excluir ambiente funciona.
* [X] Recarregar página preserva ambientes.
* [X] Aba Serviços abre.
* [X] Serviços padrão aparecem.
* [X] Editar valor unitário de serviço funciona.
* [X] Criar serviço novo funciona.
* [X] Ativar/inativar serviço funciona.
* [X] Recarregar página preserva serviços.

---

## 11. Commit sugerido

Depois da validação:

```powershell
git status
git add .
git commit -m "feat: adicionar ambientes e servicos"
git push
```

---

## 12. Observação importante

Não avance para levantamento enquanto ambientes e serviços não estiverem estáveis.

O próximo passo lógico, depois desta etapa, será:

```text
Etapa 5 — Levantamento de serviços
```

A Etapa 5 dependerá diretamente de ambientes cadastrados e serviços ativos.
