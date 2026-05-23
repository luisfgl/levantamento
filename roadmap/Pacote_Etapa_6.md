# Pacote Etapa 6 — Vãos e Descontos

## 1. Objetivo

Esta etapa adiciona o controle de vãos/descontos nos lançamentos de levantamento do tipo `parede`.

Entrega esperada:

```text
Adicionar vão + editar vão + remover vão + descontar área automaticamente + erro visual para saldo negativo
```

---

## 2. Escopo desta etapa

### Incluído

1. Criar vão vinculado a um levantamento.
2. Editar vão.
3. Remover vão.
4. Exibir lista de vãos do item.
5. Permitir vãos somente para serviços do tipo `parede`.
6. Calcular área do vão em tempo real.
7. Atualizar automaticamente:

   * área descontada;
   * saldo;
   * subtotal;
   * BDI;
   * total.
8. Exibir erro quando área descontada for maior que área bruta.
9. Persistir vãos dentro do próprio `LevantamentoServico` no `localStorage`.

### Fora desta etapa

1. Resumo por categoria.
2. Exportação por botão.
3. Importação JSON visual.
4. Supabase.
5. PDF.
6. Cronograma físico-financeiro.

---

## 3. Arquivos novos ou alterados

Criar:

```text
components/levantamento/VaoForm.tsx
components/levantamento/VaosModal.tsx
```

Alterar:

```text
components/levantamento/LevantamentosTable.tsx
src/app/obras/[obraId]/page.tsx
```

---

## 4. `components/levantamento/VaoForm.tsx`

```tsx
// components/levantamento/VaoForm.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { calcularAreaVao } from '@/lib/calculos/area'
import type { TipoVao, Vao } from '@/lib/tipos/vao'
import { formatarNumero } from '@/lib/utils/formatacao'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

const tipoVaoOptions: Array<{ label: string; value: TipoVao }> = [
  { label: 'Porta', value: 'porta' },
  { label: 'Janela', value: 'janela' },
  { label: 'Portão', value: 'portao' },
  { label: 'Vão livre', value: 'vao_livre' },
  { label: 'Outro', value: 'outro' },
]

interface VaoFormProps {
  levantamentoId: string
  vaoEmEdicao?: Vao | null
  onSalvar: (vao: Vao) => void
  onCancelarEdicao?: () => void
}

function numeroParaCampo(valor: number | undefined): string {
  if (valor === undefined || valor === null || Number.isNaN(valor)) return ''
  return String(valor)
}

export function VaoForm({ levantamentoId, vaoEmEdicao, onSalvar, onCancelarEdicao }: VaoFormProps) {
  const [tipo, setTipo] = useState<TipoVao>('porta')
  const [descricao, setDescricao] = useState('')
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(vaoEmEdicao)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!vaoEmEdicao) {
        setTipo('porta')
        setDescricao('')
        setLargura('')
        setAltura('')
        setQuantidade('1')
        setErro(null)
        return
      }

      setTipo(vaoEmEdicao.tipo)
      setDescricao(vaoEmEdicao.descricao ?? '')
      setLargura(numeroParaCampo(vaoEmEdicao.largura))
      setAltura(numeroParaCampo(vaoEmEdicao.altura))
      setQuantidade(numeroParaCampo(vaoEmEdicao.quantidade))
      setErro(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [vaoEmEdicao])

  const areaCalculada = useMemo(() => {
    const larguraNumero = normalizarNumeroEntrada(largura)
    const alturaNumero = normalizarNumeroEntrada(altura)
    const quantidadeNumero = normalizarNumeroEntrada(quantidade)

    if (!Number.isFinite(larguraNumero) || !Number.isFinite(alturaNumero) || !Number.isFinite(quantidadeNumero)) {
      return 0
    }

    if (larguraNumero < 0 || alturaNumero < 0 || quantidadeNumero < 0) {
      return 0
    }

    return calcularAreaVao(larguraNumero, alturaNumero, quantidadeNumero)
  }, [altura, largura, quantidade])

  function limparFormulario() {
    setTipo('porta')
    setDescricao('')
    setLargura('')
    setAltura('')
    setQuantidade('1')
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const larguraNumero = normalizarNumeroEntrada(largura)
    const alturaNumero = normalizarNumeroEntrada(altura)
    const quantidadeNumero = normalizarNumeroEntrada(quantidade)

    if (!Number.isFinite(larguraNumero) || larguraNumero < 0) {
      setErro('Informe uma largura válida.')
      return
    }

    if (!Number.isFinite(alturaNumero) || alturaNumero < 0) {
      setErro('Informe uma altura válida.')
      return
    }

    if (!Number.isFinite(quantidadeNumero) || quantidadeNumero < 0) {
      setErro('Informe uma quantidade válida.')
      return
    }

    const agora = new Date().toISOString()

    const vao: Vao = {
      id: vaoEmEdicao?.id ?? criarId('vao'),
      levantamentoId,
      tipo,
      descricao: descricao.trim() || undefined,
      largura: larguraNumero,
      altura: alturaNumero,
      quantidade: quantidadeNumero,
      criadoEm: vaoEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(vao)

    if (!editando) {
      limparFormulario()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Tipo"
          value={tipo}
          onChange={(event) => setTipo(event.target.value as TipoVao)}
          options={tipoVaoOptions}
        />
        <Input label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        <Input label="Largura (m)" value={largura} onChange={(event) => setLargura(event.target.value)} />
        <Input label="Altura (m)" value={altura} onChange={(event) => setAltura(event.target.value)} />
        <Input label="Quantidade" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        Área calculada do vão: <strong>{formatarNumero(areaCalculada)} m²</strong>
      </div>

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar vão' : 'Adicionar vão'}</Button>
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

## 5. `components/levantamento/VaosModal.tsx`

```tsx
// components/levantamento/VaosModal.tsx

'use client'

import { useMemo, useState } from 'react'
import { calcularAreaVao } from '@/lib/calculos/area'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { VaoForm } from '@/components/levantamento/VaoForm'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import type { Vao } from '@/lib/tipos/vao'
import { formatarMoeda, formatarNumero } from '@/lib/utils/formatacao'

interface VaosModalProps {
  levantamento: LevantamentoServico
  servico: Servico
  onFechar: () => void
  onSalvarLevantamento: (levantamento: LevantamentoServico) => void
}

function descreverTipoVao(tipo: string): string {
  const mapa: Record<string, string> = {
    porta: 'Porta',
    janela: 'Janela',
    portao: 'Portão',
    vao_livre: 'Vão livre',
    outro: 'Outro',
  }

  return mapa[tipo] ?? tipo
}

export function VaosModal({ levantamento, servico, onFechar, onSalvarLevantamento }: VaosModalProps) {
  const [vaoEmEdicao, setVaoEmEdicao] = useState<Vao | null>(null)

  const resultado = useMemo(() => {
    return calcularLevantamento(levantamento, servico)
  }, [levantamento, servico])

  function salvarVao(vao: Vao) {
    const existe = levantamento.vaos.some((item) => item.id === vao.id)
    const novosVaos = existe ? levantamento.vaos.map((item) => (item.id === vao.id ? vao : item)) : [...levantamento.vaos, vao]

    onSalvarLevantamento({
      ...levantamento,
      vaos: novosVaos,
      atualizadoEm: new Date().toISOString(),
    })

    setVaoEmEdicao(null)
  }

  function removerVao(vaoId: string) {
    const confirmar = window.confirm('Remover este vão?')
    if (!confirmar) return

    onSalvarLevantamento({
      ...levantamento,
      vaos: levantamento.vaos.filter((vao) => vao.id !== vaoId),
      atualizadoEm: new Date().toISOString(),
    })

    if (vaoEmEdicao?.id === vaoId) {
      setVaoEmEdicao(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Vãos e descontos</p>
            <h2 className="text-2xl font-bold text-slate-950">{servico.nome}</h2>
            <p className="text-sm text-slate-600">{levantamento.descricao ?? 'Item sem descrição'}</p>
          </div>
          <Button type="button" variant="secondary" onClick={onFechar}>
            Fechar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Área bruta</p>
            <p className="text-xl font-semibold text-slate-950">{formatarNumero(resultado.areaBruta)} m²</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Área descontada</p>
            <p className="text-xl font-semibold text-slate-950">{formatarNumero(resultado.areaDescontada)} m²</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Saldo</p>
            <p className="text-xl font-semibold text-slate-950">{formatarNumero(resultado.saldo)} m²</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-xl font-semibold text-slate-950">{formatarMoeda(resultado.total)}</p>
          </Card>
        </div>

        {resultado.erros.length > 0 ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Erro no cálculo:</p>
            <ul className="mt-2 list-inside list-disc">
              {resultado.erros.map((erro) => (
                <li key={erro}>{erro}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">{vaoEmEdicao ? 'Editar vão' : 'Novo vão'}</h3>
            <VaoForm
              levantamentoId={levantamento.id}
              vaoEmEdicao={vaoEmEdicao}
              onSalvar={salvarVao}
              onCancelarEdicao={() => setVaoEmEdicao(null)}
            />
          </Card>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3 text-right">Largura</th>
                  <th className="px-4 py-3 text-right">Altura</th>
                  <th className="px-4 py-3 text-right">Qtd</th>
                  <th className="px-4 py-3 text-right">Área</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {levantamento.vaos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                      Nenhum vão cadastrado para este item.
                    </td>
                  </tr>
                ) : (
                  levantamento.vaos.map((vao) => (
                    <tr key={vao.id}>
                      <td className="px-4 py-3 text-slate-700">{descreverTipoVao(vao.tipo)}</td>
                      <td className="px-4 py-3 text-slate-600">{vao.descricao ?? '-'}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatarNumero(vao.largura)} m</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatarNumero(vao.altura)} m</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatarNumero(vao.quantidade)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatarNumero(calcularAreaVao(vao.largura, vao.altura, vao.quantidade))} m²
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="secondary" onClick={() => setVaoEmEdicao(vao)}>
                            Editar
                          </Button>
                          <Button type="button" variant="danger" onClick={() => removerVao(vao.id)}>
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 6. Alterar `components/levantamento/LevantamentosTable.tsx`

### 6.1 Atualizar interface

Na interface `LevantamentosTableProps`, adicionar:

```tsx
onAbrirVaos: (levantamento: LevantamentoServico) => void
```

A interface deve ficar assim:

```tsx
interface LevantamentosTableProps {
  levantamentos: LevantamentoServico[]
  ambientes: Ambiente[]
  servicos: Servico[]
  onEditar: (levantamento: LevantamentoServico) => void
  onDuplicar: (levantamento: LevantamentoServico) => void
  onExcluir: (levantamentoId: string) => void
  onAbrirVaos: (levantamento: LevantamentoServico) => void
}
```

### 6.2 Atualizar assinatura do componente

Troque:

```tsx
export function LevantamentosTable({
  levantamentos,
  ambientes,
  servicos,
  onEditar,
  onDuplicar,
  onExcluir,
}: LevantamentosTableProps) {
```

por:

```tsx
export function LevantamentosTable({
  levantamentos,
  ambientes,
  servicos,
  onEditar,
  onDuplicar,
  onExcluir,
  onAbrirVaos,
}: LevantamentosTableProps) {
```

### 6.3 Adicionar coluna de vãos

No `<thead>`, depois de:

```tsx
<th className="px-4 py-3 text-right">Saldo</th>
```

adicione:

```tsx
<th className="px-4 py-3 text-right">Vãos</th>
```

No `<tbody>`, depois do `<td>` de saldo, adicione:

```tsx
<td className="px-4 py-3 text-right text-slate-700">
  {resultado ? `${formatarNumero(resultado.areaDescontada)} m²` : '-'}
</td>
```

### 6.4 Adicionar botão `Vãos`

Dentro do bloco de ações, antes de `Editar`, adicione:

```tsx
{servico?.tipoCalculo === 'parede' ? (
  <Button type="button" variant="ghost" onClick={() => onAbrirVaos(levantamento)}>
    Vãos
  </Button>
) : null}
```

---

## 7. Alterar `src/app/obras/[obraId]/page.tsx`

### 7.1 Import novo

Adicione:

```tsx
import { VaosModal } from '@/components/levantamento/VaosModal'
```

---

### 7.2 Estado novo

Depois de:

```tsx
const [levantamentoEmEdicao, setLevantamentoEmEdicao] = useState<LevantamentoServico | null>(null)
```

adicione:

```tsx
const [levantamentoComVaosAberto, setLevantamentoComVaosAberto] = useState<LevantamentoServico | null>(null)
```

---

### 7.3 Criar helper do serviço do modal

Depois de `levantamentosValidos`, adicione:

```tsx
const servicoDoLevantamentoComVaos = useMemo(() => {
  if (!levantamentoComVaosAberto) return null
  return servicos.find((servico) => servico.id === levantamentoComVaosAberto.servicoId) ?? null
}, [levantamentoComVaosAberto, servicos])
```

---

### 7.4 Atualizar `handleSalvarLevantamento`

Depois de:

```tsx
setLevantamentoEmEdicao(null)
```

adicione:

```tsx
if (levantamentoComVaosAberto?.id === levantamento.id) {
  setLevantamentoComVaosAberto(levantamento)
}
```

A função completa deve ficar assim:

```tsx
function handleSalvarLevantamento(levantamento: LevantamentoServico) {
  const existe = levantamentos.some((item) => item.id === levantamento.id)
  const novaLista = existe
    ? levantamentos.map((item) => (item.id === levantamento.id ? levantamento : item))
    : [...levantamentos, levantamento]

  salvarLevantamentosDaObra(novaLista)
  setLevantamentoEmEdicao(null)

  if (levantamentoComVaosAberto?.id === levantamento.id) {
    setLevantamentoComVaosAberto(levantamento)
  }
}
```

---

### 7.5 Atualizar `handleExcluirLevantamento`

Dentro de `handleExcluirLevantamento`, depois de limpar `levantamentoEmEdicao`, adicione:

```tsx
if (levantamentoComVaosAberto?.id === levantamentoId) {
  setLevantamentoComVaosAberto(null)
}
```

---

### 7.6 Atualizar chamada de `LevantamentosTable`

Adicione a prop:

```tsx
onAbrirVaos={setLevantamentoComVaosAberto}
```

Deve ficar assim:

```tsx
<LevantamentosTable
  levantamentos={levantamentos}
  ambientes={ambientes}
  servicos={servicos}
  onEditar={setLevantamentoEmEdicao}
  onDuplicar={handleDuplicarLevantamento}
  onExcluir={handleExcluirLevantamento}
  onAbrirVaos={setLevantamentoComVaosAberto}
/>
```

---

### 7.7 Renderizar modal

Antes do fechamento do `<main>`, depois do conteúdo principal, adicione:

```tsx
{levantamentoComVaosAberto && servicoDoLevantamentoComVaos ? (
  <VaosModal
    levantamento={levantamentoComVaosAberto}
    servico={servicoDoLevantamentoComVaos}
    onFechar={() => setLevantamentoComVaosAberto(null)}
    onSalvarLevantamento={handleSalvarLevantamento}
  />
) : null}
```

Fica dentro do `return`, no mesmo nível da `<div className="mx-auto...">`, antes de fechar o `<main>`.

---

## 8. Validação técnica

Rodar:

```powershell
npm run lint
npm test
npm run build
```

---

## 9. Validação manual

Rodar:

```powershell
npm run dev
```

Checklist:

```text
[ ] Criar levantamento tipo parede
[ ] Botão Vãos aparece no item tipo parede
[ ] Botão Vãos não aparece em piso/item unitário/valor manual/comprimento linear
[ ] Abrir modal de vãos
[ ] Criar vão tipo porta
[ ] Criar vão tipo janela
[ ] Área do vão calcula corretamente
[ ] Área descontada atualiza na tabela
[ ] Saldo atualiza na tabela
[ ] Subtotal, BDI e total atualizam após desconto
[ ] Editar vão funciona
[ ] Remover vão funciona
[ ] Recarregar página preserva vãos
[ ] Criar vão maior que a área bruta destaca erro no item
```

### Massa de teste sugerida

#### Levantamento de parede

```text
Serviço: Reboco interno
Comprimento: 5
Altura: 2,8
Valor unitário: 35
BDI: 35
```

Sem vãos:

```text
Área bruta: 14,00 m²
Saldo: 14,00 m²
Subtotal: R$ 490,00
BDI: R$ 171,50
Total: R$ 661,50
```

Adicionar porta:

```text
Tipo: Porta
Largura: 0,8
Altura: 2,1
Quantidade: 1
Área do vão: 1,68 m²
```

Resultado esperado:

```text
Área descontada: 1,68 m²
Saldo: 12,32 m²
Subtotal: R$ 431,20
BDI: R$ 150,92
Total: R$ 582,12
```

Adicionar janela:

```text
Tipo: Janela
Largura: 1,5
Altura: 1,2
Quantidade: 1
Área do vão: 1,80 m²
```

Resultado esperado com porta + janela:

```text
Área descontada: 3,48 m²
Saldo: 10,52 m²
Subtotal: R$ 368,20
BDI: R$ 128,87
Total: R$ 497,07
```

Teste de erro:

```text
Tipo: Vão livre
Largura: 10
Altura: 10
Quantidade: 1
```

Resultado esperado:

```text
Área descontada maior que área bruta
Linha destacada como erro
Total zerado ou inválido conforme motor de cálculo
```

---

## 10. Commit sugerido

Depois da validação:

```powershell
git status
git add .
git commit -m "feat: adicionar vaos e descontos"
git push
```

---

## 11. Próxima etapa

Depois desta etapa, avance para:

```text
Etapa 7 — Resumo da obra
```

O resumo deve usar `calcularResumoObra` e já considerar automaticamente os descontos de vãos, porque os vãos ficam dentro de cada levantamento.
