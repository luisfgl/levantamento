# Pacote Etapa 5 — Levantamento de Serviços

## 1. Objetivo

Esta etapa implementa a tela principal do orçamento: lançamento de serviços por ambiente, com cálculo automático por item.

Entrega esperada:

```text
Formulário dinâmico de levantamento + tabela calculada + editar + duplicar + excluir + persistência local
```

---

## 2. Escopo desta etapa

### Incluído

1. Criar lançamento de levantamento.
2. Editar lançamento.
3. Duplicar lançamento.
4. Excluir lançamento.
5. Exibir cálculo por item.
6. Exibir erros de cálculo por item.
7. Formulário muda conforme tipo de cálculo do serviço.
8. Ao selecionar serviço, preencher:

   * unidade;
   * valor unitário padrão;
   * uso de BDI.
9. Usar BDI padrão da obra no novo lançamento.
10. Persistir levantamentos no `localStorage`.

### Fora desta etapa

1. Vãos.
2. Modal de vãos.
3. Resumo por categoria.
4. Exportação por botão.
5. Supabase.
6. PDF.

Atenção: mesmo sem tela de vãos, cada levantamento deve salvar `vaos: []`, porque o tipo `LevantamentoServico` já exige esse campo.

---

## 3. Arquivos novos ou alterados

Criar:

```text
components/levantamento/CalculoItemResumo.tsx
components/levantamento/LevantamentoForm.tsx
components/levantamento/LevantamentosTable.tsx
```

Alterar:

```text
src/app/obras/[obraId]/page.tsx
```

Se necessário, criar a pasta:

```powershell
mkdir components\levantamento
```

---

## 4. `components/levantamento/CalculoItemResumo.tsx`

```tsx
// components/levantamento/CalculoItemResumo.tsx

'use client'

import { calcularLevantamento } from '@/lib/calculos/levantamento'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { formatarMoeda, formatarNumero } from '@/lib/utils/formatacao'

interface CalculoItemResumoProps {
  levantamento: LevantamentoServico
  servico?: Servico
}

export function CalculoItemResumo({ levantamento, servico }: CalculoItemResumoProps) {
  if (!servico) {
    return <p className="text-sm text-red-700">Serviço não encontrado.</p>
  }

  const resultado = calcularLevantamento(levantamento, servico)

  if (resultado.erros.length > 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <p className="font-medium">Item com erro:</p>
        <ul className="mt-1 list-inside list-disc">
          {resultado.erros.map((erro) => (
            <li key={erro}>{erro}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm md:grid-cols-3 lg:grid-cols-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Área bruta</p>
        <p className="font-medium text-slate-900">{formatarNumero(resultado.areaBruta)} {levantamento.unidade}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Desconto</p>
        <p className="font-medium text-slate-900">{formatarNumero(resultado.areaDescontada)} {levantamento.unidade}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Saldo</p>
        <p className="font-medium text-slate-900">{formatarNumero(resultado.saldo)} {levantamento.unidade}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Subtotal</p>
        <p className="font-medium text-slate-900">{formatarMoeda(resultado.subtotal)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">BDI</p>
        <p className="font-medium text-slate-900">{formatarMoeda(resultado.valorBdi)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
        <p className="font-semibold text-slate-950">{formatarMoeda(resultado.total)}</p>
      </div>
    </div>
  )
}
```

---

## 5. `components/levantamento/LevantamentoForm.tsx`

```tsx
// components/levantamento/LevantamentoForm.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

interface LevantamentoFormProps {
  obraId: string
  bdiPadraoPercentual: number
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentoEmEdicao?: LevantamentoServico | null
  onSalvar: (levantamento: LevantamentoServico) => void
  onCancelarEdicao?: () => void
}

function numeroOpcional(valor: string): number | undefined {
  if (!valor.trim()) return undefined
  return normalizarNumeroEntrada(valor)
}

function numeroObrigatorio(valor: string): number {
  return normalizarNumeroEntrada(valor)
}

export function LevantamentoForm({
  obraId,
  bdiPadraoPercentual,
  ambientes,
  servicos,
  levantamentoEmEdicao,
  onSalvar,
  onCancelarEdicao,
}: LevantamentoFormProps) {
  const [ambienteId, setAmbienteId] = useState('')
  const [servicoId, setServicoId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [comprimento, setComprimento] = useState('')
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorManual, setValorManual] = useState('')
  const [valorUnitario, setValorUnitario] = useState('')
  const [bdiPercentual, setBdiPercentual] = useState(String(bdiPadraoPercentual))
  const [usaBdi, setUsaBdi] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(levantamentoEmEdicao)

  const servicoSelecionado = useMemo(() => {
    return servicos.find((servico) => servico.id === servicoId) ?? null
  }, [servicoId, servicos])

  const servicosDisponiveis = useMemo(() => {
    return servicos.filter((servico) => servico.ativo || servico.id === levantamentoEmEdicao?.servicoId)
  }, [levantamentoEmEdicao?.servicoId, servicos])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!levantamentoEmEdicao) {
        setAmbienteId('')
        setServicoId('')
        setDescricao('')
        setComprimento('')
        setLargura('')
        setAltura('')
        setQuantidade('')
        setValorManual('')
        setValorUnitario('')
        setBdiPercentual(String(bdiPadraoPercentual))
        setUsaBdi(true)
        setObservacoes('')
        setErro(null)
        return
      }

      setAmbienteId(levantamentoEmEdicao.ambienteId)
      setServicoId(levantamentoEmEdicao.servicoId)
      setDescricao(levantamentoEmEdicao.descricao ?? '')
      setComprimento(levantamentoEmEdicao.comprimento === undefined ? '' : String(levantamentoEmEdicao.comprimento))
      setLargura(levantamentoEmEdicao.largura === undefined ? '' : String(levantamentoEmEdicao.largura))
      setAltura(levantamentoEmEdicao.altura === undefined ? '' : String(levantamentoEmEdicao.altura))
      setQuantidade(levantamentoEmEdicao.quantidade === undefined ? '' : String(levantamentoEmEdicao.quantidade))
      setValorManual(levantamentoEmEdicao.valorManual === undefined ? '' : String(levantamentoEmEdicao.valorManual))
      setValorUnitario(String(levantamentoEmEdicao.valorUnitario))
      setBdiPercentual(String(levantamentoEmEdicao.bdiPercentual))
      setUsaBdi(levantamentoEmEdicao.usaBdi)
      setObservacoes(levantamentoEmEdicao.observacoes ?? '')
      setErro(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [bdiPadraoPercentual, levantamentoEmEdicao])

  function limparFormulario() {
    setAmbienteId('')
    setServicoId('')
    setDescricao('')
    setComprimento('')
    setLargura('')
    setAltura('')
    setQuantidade('')
    setValorManual('')
    setValorUnitario('')
    setBdiPercentual(String(bdiPadraoPercentual))
    setUsaBdi(true)
    setObservacoes('')
    setErro(null)
  }

  function handleSelecionarServico(novoServicoId: string) {
    setServicoId(novoServicoId)

    const servico = servicos.find((item) => item.id === novoServicoId)
    if (!servico) return

    setValorUnitario(String(servico.valorUnitarioPadrao))
    setUsaBdi(servico.usaBdi)
    setErro(null)

    if (servico.tipoCalculo === 'valor_manual') {
      setValorManual('')
    }
  }

  function validarCamposBase(): boolean {
    if (!ambienteId) {
      setErro('Selecione um ambiente.')
      return false
    }

    if (!servicoSelecionado) {
      setErro('Selecione um serviço ativo.')
      return false
    }

    const valorUnitarioNumero = numeroObrigatorio(valorUnitario)
    const bdiNumero = numeroObrigatorio(bdiPercentual)

    if (!Number.isFinite(valorUnitarioNumero) || valorUnitarioNumero < 0) {
      setErro('Informe um valor unitário válido.')
      return false
    }

    if (!Number.isFinite(bdiNumero) || bdiNumero < 0) {
      setErro('Informe um BDI válido.')
      return false
    }

    return true
  }

  function validarCamposPorTipo(): boolean {
    if (!servicoSelecionado) return false

    const tipo = servicoSelecionado.tipoCalculo

    if (tipo === 'parede') {
      const c = numeroObrigatorio(comprimento)
      const h = numeroObrigatorio(altura)

      if (!Number.isFinite(c) || c < 0 || !Number.isFinite(h) || h < 0) {
        setErro('Informe comprimento e altura válidos para serviço de parede.')
        return false
      }
    }

    if (tipo === 'piso') {
      const c = numeroObrigatorio(comprimento)
      const l = numeroObrigatorio(largura)

      if (!Number.isFinite(c) || c < 0 || !Number.isFinite(l) || l < 0) {
        setErro('Informe comprimento e largura válidos para serviço de piso.')
        return false
      }
    }

    if (tipo === 'item_unitario') {
      const qtd = numeroObrigatorio(quantidade)

      if (!Number.isFinite(qtd) || qtd < 0) {
        setErro('Informe uma quantidade válida.')
        return false
      }
    }

    if (tipo === 'valor_manual') {
      const valor = numeroObrigatorio(valorManual)

      if (!Number.isFinite(valor) || valor < 0) {
        setErro('Informe um valor manual válido.')
        return false
      }
    }

    if (tipo === 'comprimento_linear') {
      const c = numeroObrigatorio(comprimento)

      if (!Number.isFinite(c) || c < 0) {
        setErro('Informe um comprimento válido.')
        return false
      }
    }

    return true
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validarCamposBase()) return
    if (!validarCamposPorTipo()) return
    if (!servicoSelecionado) return

    const agora = new Date().toISOString()

    const levantamento: LevantamentoServico = {
      id: levantamentoEmEdicao?.id ?? criarId('lev'),
      obraId,
      ambienteId,
      servicoId,
      descricao: descricao.trim() || undefined,
      comprimento: numeroOpcional(comprimento),
      largura: numeroOpcional(largura),
      altura: numeroOpcional(altura),
      quantidade: numeroOpcional(quantidade),
      valorManual: numeroOpcional(valorManual),
      unidade: servicoSelecionado.unidade,
      valorUnitario: numeroObrigatorio(valorUnitario),
      bdiPercentual: numeroObrigatorio(bdiPercentual),
      usaBdi,
      vaos: levantamentoEmEdicao?.vaos ?? [],
      observacoes: observacoes.trim() || undefined,
      criadoEm: levantamentoEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(levantamento)

    if (!editando) {
      limparFormulario()
    }
  }

  if (ambientes.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Cadastre pelo menos um ambiente antes de lançar serviços.
      </div>
    )
  }

  if (servicosDisponiveis.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Cadastre ou ative pelo menos um serviço antes de lançar levantamentos.
      </div>
    )
  }

  const tipoCalculo = servicoSelecionado?.tipoCalculo

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Ambiente"
          value={ambienteId}
          onChange={(event) => setAmbienteId(event.target.value)}
          options={[
            { label: 'Selecione...', value: '' },
            ...ambientes.map((ambiente) => ({
              label: `${ambiente.pavimento ? `${ambiente.pavimento} / ` : ''}${ambiente.nome}`,
              value: ambiente.id,
            })),
          ]}
        />

        <Select
          label="Serviço"
          value={servicoId}
          onChange={(event) => handleSelecionarServico(event.target.value)}
          options={[
            { label: 'Selecione...', value: '' },
            ...servicosDisponiveis.map((servico) => ({
              label: `${servico.nome} (${servico.unidade})`,
              value: servico.id,
            })),
          ]}
        />

        <Input label="Valor unitário" value={valorUnitario} onChange={(event) => setValorUnitario(event.target.value)} />
        <Input label="BDI (%)" value={bdiPercentual} onChange={(event) => setBdiPercentual(event.target.value)} />
      </div>

      <Input label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} />

      {tipoCalculo === 'parede' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Comprimento (m)" value={comprimento} onChange={(event) => setComprimento(event.target.value)} />
          <Input label="Altura (m)" value={altura} onChange={(event) => setAltura(event.target.value)} />
        </div>
      ) : null}

      {tipoCalculo === 'piso' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Comprimento (m)" value={comprimento} onChange={(event) => setComprimento(event.target.value)} />
          <Input label="Largura (m)" value={largura} onChange={(event) => setLargura(event.target.value)} />
        </div>
      ) : null}

      {tipoCalculo === 'item_unitario' ? (
        <Input label="Quantidade" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />
      ) : null}

      {tipoCalculo === 'valor_manual' ? (
        <Input label="Valor manual" value={valorManual} onChange={(event) => setValorManual(event.target.value)} />
      ) : null}

      {tipoCalculo === 'comprimento_linear' ? (
        <Input label="Comprimento (m)" value={comprimento} onChange={(event) => setComprimento(event.target.value)} />
      ) : null}

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={usaBdi} onChange={(event) => setUsaBdi(event.target.checked)} />
        Aplicar BDI neste item
      </label>

      <Textarea label="Observações" rows={2} value={observacoes} onChange={(event) => setObservacoes(event.target.value)} />

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar levantamento' : 'Adicionar levantamento'}</Button>
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

## 6. `components/levantamento/LevantamentosTable.tsx`

```tsx
// components/levantamento/LevantamentosTable.tsx

'use client'

import { calcularLevantamento } from '@/lib/calculos/levantamento'
import { Button } from '@/components/ui/Button'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { formatarMoeda, formatarNumero } from '@/lib/utils/formatacao'

interface LevantamentosTableProps {
  levantamentos: LevantamentoServico[]
  ambientes: Ambiente[]
  servicos: Servico[]
  onEditar: (levantamento: LevantamentoServico) => void
  onDuplicar: (levantamento: LevantamentoServico) => void
  onExcluir: (levantamentoId: string) => void
}

function obterNomeAmbiente(ambientes: Ambiente[], ambienteId: string): string {
  const ambiente = ambientes.find((item) => item.id === ambienteId)
  if (!ambiente) return 'Ambiente não encontrado'
  return `${ambiente.pavimento ? `${ambiente.pavimento} / ` : ''}${ambiente.nome}`
}

function descreverDimensoes(levantamento: LevantamentoServico, servico?: Servico): string {
  if (!servico) return '-'

  if (servico.tipoCalculo === 'parede') {
    return `C ${levantamento.comprimento ?? '-'} × H ${levantamento.altura ?? '-'}`
  }

  if (servico.tipoCalculo === 'piso') {
    return `C ${levantamento.comprimento ?? '-'} × L ${levantamento.largura ?? '-'}`
  }

  if (servico.tipoCalculo === 'item_unitario') {
    return `Qtd ${levantamento.quantidade ?? '-'}`
  }

  if (servico.tipoCalculo === 'valor_manual') {
    return `Manual ${formatarMoeda(levantamento.valorManual ?? 0)}`
  }

  if (servico.tipoCalculo === 'comprimento_linear') {
    return `C ${levantamento.comprimento ?? '-'}`
  }

  return '-'
}

export function LevantamentosTable({
  levantamentos,
  ambientes,
  servicos,
  onEditar,
  onDuplicar,
  onExcluir,
}: LevantamentosTableProps) {
  if (levantamentos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum levantamento lançado para esta obra.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Ambiente</th>
            <th className="px-4 py-3">Serviço</th>
            <th className="px-4 py-3">Dimensões</th>
            <th className="px-4 py-3 text-right">Saldo</th>
            <th className="px-4 py-3 text-right">Valor unit.</th>
            <th className="px-4 py-3 text-right">Subtotal</th>
            <th className="px-4 py-3 text-right">BDI</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {levantamentos.map((levantamento) => {
            const servico = servicos.find((item) => item.id === levantamento.servicoId)
            const resultado = servico ? calcularLevantamento(levantamento, servico) : null
            const temErro = !servico || Boolean(resultado?.erros.length)

            return (
              <tr key={levantamento.id} className={temErro ? 'bg-red-50' : ''}>
                <td className="px-4 py-3 text-slate-700">{obterNomeAmbiente(ambientes, levantamento.ambienteId)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{servico?.nome ?? 'Serviço não encontrado'}</p>
                  {levantamento.descricao ? <p className="text-xs text-slate-500">{levantamento.descricao}</p> : null}
                </td>
                <td className="px-4 py-3 text-slate-600">{descreverDimensoes(levantamento, servico)}</td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {resultado ? `${formatarNumero(resultado.saldo)} ${levantamento.unidade}` : '-'}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(levantamento.valorUnitario)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{resultado ? formatarMoeda(resultado.subtotal) : '-'}</td>
                <td className="px-4 py-3 text-right text-slate-700">{resultado ? formatarMoeda(resultado.valorBdi) : '-'}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-950">{resultado ? formatarMoeda(resultado.total) : '-'}</td>
                <td className="px-4 py-3">
                  {temErro ? (
                    <div className="text-xs text-red-700">
                      <p className="font-medium">Erro</p>
                      {resultado?.erros.map((erro) => <p key={erro}>{erro}</p>)}
                      {!servico ? <p>Serviço não encontrado.</p> : null}
                    </div>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">OK</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => onEditar(levantamento)}>
                      Editar
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => onDuplicar(levantamento)}>
                      Duplicar
                    </Button>
                    <Button type="button" variant="danger" onClick={() => onExcluir(levantamento.id)}>
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 7. Alterar `src/app/obras/[obraId]/page.tsx`

### 7.1 Imports novos

Adicione estes imports no topo:

```tsx
import { CalculoItemResumo } from '@/components/levantamento/CalculoItemResumo'
import { LevantamentoForm } from '@/components/levantamento/LevantamentoForm'
import { LevantamentosTable } from '@/components/levantamento/LevantamentosTable'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import { criarId } from '@/lib/utils/id'
```

Se o arquivo já tiver algum desses imports, não duplique.

---

### 7.2 Estado novo

Depois de:

```tsx
const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null)
```

adicione:

```tsx
const [levantamentoEmEdicao, setLevantamentoEmEdicao] = useState<LevantamentoServico | null>(null)
```

---

### 7.3 Helpers e handlers novos

Adicione estas funções dentro do componente, antes do `if (!carregado)`:

```tsx
function salvarLevantamentosDaObra(novosLevantamentosDaObra: LevantamentoServico[]) {
  const todosLevantamentos = carregarLista<LevantamentoServico>(STORAGE_KEYS.LEVANTAMENTOS)
  const levantamentosDeOutrasObras = todosLevantamentos.filter((levantamento) => levantamento.obraId !== obraId)
  const novaListaGlobal = [...levantamentosDeOutrasObras, ...novosLevantamentosDaObra]

  salvarLista(STORAGE_KEYS.LEVANTAMENTOS, novaListaGlobal)
  setLevantamentos(novosLevantamentosDaObra)
}

function handleSalvarLevantamento(levantamento: LevantamentoServico) {
  const existe = levantamentos.some((item) => item.id === levantamento.id)
  const novaLista = existe
    ? levantamentos.map((item) => (item.id === levantamento.id ? levantamento : item))
    : [...levantamentos, levantamento]

  salvarLevantamentosDaObra(novaLista)
  setLevantamentoEmEdicao(null)
}

function handleDuplicarLevantamento(levantamento: LevantamentoServico) {
  const agora = new Date().toISOString()

  const duplicado: LevantamentoServico = {
    ...levantamento,
    id: criarId('lev'),
    descricao: levantamento.descricao ? `${levantamento.descricao} (cópia)` : 'Item duplicado',
    vaos: levantamento.vaos.map((vao) => ({
      ...vao,
      id: criarId('vao'),
      levantamentoId: '',
      criadoEm: agora,
      atualizadoEm: agora,
    })),
    criadoEm: agora,
    atualizadoEm: agora,
  }

  duplicado.vaos = duplicado.vaos.map((vao) => ({
    ...vao,
    levantamentoId: duplicado.id,
  }))

  salvarLevantamentosDaObra([...levantamentos, duplicado])
}

function handleExcluirLevantamento(levantamentoId: string) {
  const confirmar = window.confirm('Excluir este lançamento de levantamento?')
  if (!confirmar) return

  salvarLevantamentosDaObra(levantamentos.filter((levantamento) => levantamento.id !== levantamentoId))

  if (levantamentoEmEdicao?.id === levantamentoId) {
    setLevantamentoEmEdicao(null)
  }
}

const levantamentosValidos = levantamentos.filter((levantamento) => {
  const servico = servicos.find((item) => item.id === levantamento.servicoId)
  if (!servico) return false

  const resultado = calcularLevantamento(levantamento, servico)
  return resultado.erros.length === 0
})
```

---

### 7.4 Substituir bloco da aba `Levantamento`

Procure o bloco atual:

```tsx
{abaAtiva === 'Levantamento' ? (
  <Card>
    <h2 className="text-xl font-semibold text-slate-900">Levantamento</h2>
    <p className="mt-2 text-sm text-slate-600">Itens lançados: {levantamentos.length}</p>
    <p className="mt-4 text-sm text-slate-500">Formulário de levantamento entra na próxima etapa.</p>
  </Card>
) : null}
```

Substitua por:

```tsx
{abaAtiva === 'Levantamento' ? (
  <div className="space-y-6">
    <Card>
      <h2 className="text-xl font-semibold text-slate-900">
        {levantamentoEmEdicao ? 'Editar levantamento' : 'Novo levantamento'}
      </h2>
      <p className="mb-4 mt-1 text-sm text-slate-600">
        Lance serviços por ambiente. Os cálculos usam o motor já testado do sistema.
      </p>
      <LevantamentoForm
        obraId={obra.id}
        bdiPadraoPercentual={obra.bdiPadraoPercentual}
        ambientes={ambientes}
        servicos={servicos}
        levantamentoEmEdicao={levantamentoEmEdicao}
        onSalvar={handleSalvarLevantamento}
        onCancelarEdicao={() => setLevantamentoEmEdicao(null)}
      />
    </Card>

    <Card>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Levantamentos lançados</h2>
          <p className="text-sm text-slate-600">
            Total: {levantamentos.length} | Válidos: {levantamentosValidos.length} | Com erro: {levantamentos.length - levantamentosValidos.length}
          </p>
        </div>
      </div>

      <LevantamentosTable
        levantamentos={levantamentos}
        ambientes={ambientes}
        servicos={servicos}
        onEditar={setLevantamentoEmEdicao}
        onDuplicar={handleDuplicarLevantamento}
        onExcluir={handleExcluirLevantamento}
      />
    </Card>

    {levantamentoEmEdicao ? (
      <Card>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Prévia do item em edição</h2>
        <CalculoItemResumo
          levantamento={levantamentoEmEdicao}
          servico={servicos.find((servico) => servico.id === levantamentoEmEdicao.servicoId)}
        />
      </Card>
    ) : null}
  </div>
) : null}
```

---

## 8. Validação técnica

Rodar:

```powershell
npm run lint
npm test
npm run build
```

Se o lint acusar `react-hooks/set-state-in-effect` em `LevantamentoForm.tsx`, confirme se o `useEffect` está usando `window.setTimeout`. Não troque por setState direto dentro do efeito.

---

## 9. Validação manual

Rodar:

```powershell
npm run dev
```

Abrir:

```text
http://localhost:3000/obras
```

Entrar em uma obra e testar:

```text
[X] Aba Levantamento abre
[X] Criar levantamento tipo parede funciona
[X] Criar levantamento tipo piso funciona
[X] Criar levantamento tipo item unitário funciona
[X] Criar levantamento tipo valor manual funciona
[X] Criar levantamento tipo comprimento linear funciona
[X] Editar levantamento funciona
[X] Duplicar levantamento funciona
[X] Excluir levantamento funciona
[X] Cálculos aparecem na tabela
[X] Item com erro aparece destacado
[X] Recarregar página preserva levantamentos
```

### Massa de teste sugerida

#### Parede

```text
Ambiente: Sala
Serviço: Reboco interno
Comprimento: 5
Altura: 2,8
Valor unitário: 35
BDI: 35
```

Sem vãos nesta etapa, o resultado esperado é:

```text
Área bruta: 14,00 m²
Saldo: 14,00 m²
Subtotal: R$ 490,00
BDI: R$ 171,50
Total: R$ 661,50
```

#### Piso

```text
Ambiente: Cozinha
Serviço: Piso
Comprimento: 4
Largura: 3
Valor unitário: 60
BDI: 35
```

Resultado esperado:

```text
Área bruta: 12,00 m²
Subtotal: R$ 720,00
BDI: R$ 252,00
Total: R$ 972,00
```

#### Item unitário

```text
Ambiente: Banheiro
Serviço: Porta
Quantidade: 1
Valor unitário: 250
BDI: 35
```

Resultado esperado:

```text
Subtotal: R$ 250,00
BDI: R$ 87,50
Total: R$ 337,50
```

---

## 10. Commit sugerido

Depois da validação:

```powershell
git status
git add .
git commit -m "feat: adicionar levantamento de servicos"
git push
```

---

## 11. Observação importante

Esta etapa ainda não implementa vãos. Isso é proposital.

Se tentar colocar vãos agora, a tela cresce demais e aumenta o risco de erro. Primeiro estabilize o fluxo:

```text
ambiente → serviço → medidas → cálculo → tabela → persistência
```

Depois entra:

```text
Etapa 6 — Vãos e descontos
```
