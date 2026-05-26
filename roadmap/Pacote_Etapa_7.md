# Pacote Etapa 7 — Resumo da Obra

## 1. Objetivo

Esta etapa implementa o resumo financeiro da obra usando o motor `calcularResumoObra` já existente.

Entrega esperada:

```text
Resumo geral + resumo por categoria + itens com erro + totais considerando vãos/descontos
```

---

## 2. Escopo desta etapa

### Incluído

1. Exibir subtotal geral da obra.
2. Exibir BDI total da obra.
3. Exibir total geral da obra.
4. Exibir quantidade de itens válidos.
5. Exibir quantidade de itens com erro.
6. Exibir tabela de resumo por categoria.
7. Exibir lista de itens com erro.
8. Considerar automaticamente os vãos/descontos já cadastrados.
9. Atualizar resumo conforme alterações em levantamentos, vãos e serviços.

### Fora desta etapa

1. Exportação JSON por botão.
2. Importação JSON visual.
3. PDF.
4. DOCX.
5. Supabase.
6. Login.

---

## 3. Arquivos novos ou alterados

Criar:

```text
components/resumo/ResumoGeralCard.tsx
components/resumo/ResumoCategoriasTable.tsx
components/resumo/ItensComErroTable.tsx
```

Alterar:

```text
src/app/obras/[obraId]/page.tsx
```

Se necessário, criar pasta:

```powershell
mkdir components\resumo
```

---

## 4. `components/resumo/ResumoGeralCard.tsx`

```tsx
// components/resumo/ResumoGeralCard.tsx

'use client'

import { Card } from '@/components/ui/Card'
import type { ResumoObra } from '@/lib/tipos/resumo'
import { formatarMoeda } from '@/lib/utils/formatacao'

interface ResumoGeralCardProps {
  resumo: ResumoObra
}

export function ResumoGeralCard({ resumo }: ResumoGeralCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Subtotal</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{formatarMoeda(resumo.subtotal)}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">BDI total</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{formatarMoeda(resumo.valorBdi)}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Total geral</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{formatarMoeda(resumo.total)}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Itens válidos</p>
        <p className="mt-2 text-2xl font-bold text-emerald-700">{resumo.quantidadeItens}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Itens com erro</p>
        <p className={`mt-2 text-2xl font-bold ${resumo.quantidadeItensComErro > 0 ? 'text-red-700' : 'text-slate-950'}`}>
          {resumo.quantidadeItensComErro}
        </p>
      </Card>
    </div>
  )
}
```

---

## 5. `components/resumo/ResumoCategoriasTable.tsx`

```tsx
// components/resumo/ResumoCategoriasTable.tsx

'use client'

import { Card } from '@/components/ui/Card'
import type { ResumoCategoria } from '@/lib/tipos/resumo'
import { formatarMoeda } from '@/lib/utils/formatacao'

interface ResumoCategoriasTableProps {
  categorias: ResumoCategoria[]
}

function nomeCategoria(categoria: string): string {
  const nomes: Record<string, string> = {
    reboco: 'Reboco',
    pisos: 'Pisos',
    revestimentos: 'Revestimentos',
    pintura: 'Pintura',
    muros: 'Muros',
    acabamentos: 'Acabamentos',
    instalacoes: 'Instalações',
    complementacao: 'Complementação',
    outros: 'Outros',
  }

  return nomes[categoria] ?? categoria
}

export function ResumoCategoriasTable({ categorias }: ResumoCategoriasTableProps) {
  if (categorias.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Resumo por categoria</h2>
        <p className="mt-2 text-sm text-slate-600">Nenhum item válido para resumir.</p>
      </Card>
    )
  }

  const categoriasOrdenadas = [...categorias].sort((a, b) => b.total - a.total)

  return (
    <Card>
      <h2 className="text-xl font-semibold text-slate-900">Resumo por categoria</h2>
      <p className="mt-1 text-sm text-slate-600">Totais agrupados pela categoria do serviço.</p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Itens</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-right">BDI</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categoriasOrdenadas.map((categoria) => (
              <tr key={categoria.categoria}>
                <td className="px-4 py-3 font-medium text-slate-900">{nomeCategoria(categoria.categoria)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{categoria.quantidadeItens}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(categoria.subtotal)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(categoria.valorBdi)}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-950">{formatarMoeda(categoria.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
```

---

## 6. `components/resumo/ItensComErroTable.tsx`

```tsx
// components/resumo/ItensComErroTable.tsx

'use client'

import { Card } from '@/components/ui/Card'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'

interface ItensComErroTableProps {
  levantamentos: LevantamentoServico[]
  ambientes: Ambiente[]
  servicos: Servico[]
}

function nomeAmbiente(ambientes: Ambiente[], ambienteId: string): string {
  const ambiente = ambientes.find((item) => item.id === ambienteId)
  if (!ambiente) return 'Ambiente não encontrado'
  return ambiente.pavimento ? `${ambiente.pavimento} / ${ambiente.nome}` : ambiente.nome
}

export function ItensComErroTable({ levantamentos, ambientes, servicos }: ItensComErroTableProps) {
  const itensComErro = levantamentos
    .map((levantamento) => {
      const servico = servicos.find((item) => item.id === levantamento.servicoId)

      if (!servico) {
        return {
          levantamento,
          servicoNome: 'Serviço não encontrado',
          erros: ['Serviço não encontrado.'],
        }
      }

      const resultado = calcularLevantamento(levantamento, servico)

      return {
        levantamento,
        servicoNome: servico.nome,
        erros: resultado.erros,
      }
    })
    .filter((item) => item.erros.length > 0)

  if (itensComErro.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Itens com erro</h2>
        <p className="mt-2 text-sm text-emerald-700">Nenhum item com erro no momento.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-slate-900">Itens com erro</h2>
      <p className="mt-1 text-sm text-slate-600">Estes itens não entram no total da obra enquanto tiverem erro.</p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-red-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-red-50 text-red-800">
            <tr>
              <th className="px-4 py-3">Ambiente</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Erros</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {itensComErro.map((item) => (
              <tr key={item.levantamento.id}>
                <td className="px-4 py-3 text-slate-700">{nomeAmbiente(ambientes, item.levantamento.ambienteId)}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{item.servicoNome}</td>
                <td className="px-4 py-3 text-slate-600">{item.levantamento.descricao ?? '-'}</td>
                <td className="px-4 py-3 text-red-700">
                  <ul className="list-inside list-disc">
                    {item.erros.map((erro) => (
                      <li key={erro}>{erro}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
```

---

## 7. Alterar `src/app/obras/[obraId]/page.tsx`

### 7.1 Imports novos

Adicione aos imports:

```tsx
import { ItensComErroTable } from '@/components/resumo/ItensComErroTable'
import { ResumoCategoriasTable } from '@/components/resumo/ResumoCategoriasTable'
import { ResumoGeralCard } from '@/components/resumo/ResumoGeralCard'
import { calcularResumoObra } from '@/lib/calculos/resumo'
```

---

### 7.2 Criar memo do resumo

Depois de `servicoDoLevantamentoComVaos`, adicione:

```tsx
const resumoObra = useMemo(() => {
  return calcularResumoObra(levantamentos, servicos)
}, [levantamentos, servicos])
```

---

### 7.3 Substituir bloco da aba `Resumo`

Procure:

```tsx
{abaAtiva === 'Resumo' ? (
  <Card>
    <h2 className="text-xl font-semibold text-slate-900">Resumo</h2>
    <p className="mt-2 text-sm text-slate-500">Resumo visual entra após vãos e descontos.</p>
  </Card>
) : null}
```

Substitua por:

```tsx
{abaAtiva === 'Resumo' ? (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-950">Resumo da obra</h2>
      <p className="mt-1 text-sm text-slate-600">
        Totais calculados com base nos levantamentos válidos. Itens com erro não entram no total.
      </p>
    </div>

    <ResumoGeralCard resumo={resumoObra} />

    <ResumoCategoriasTable categorias={resumoObra.categorias} />

    <ItensComErroTable levantamentos={levantamentos} ambientes={ambientes} servicos={servicos} />
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

---

## 9. Validação manual

Rodar:

```powershell
npm run dev
```

Checklist:

```text
[ ] Aba Resumo abre
[ ] Subtotal geral aparece
[ ] BDI total aparece
[ ] Total geral aparece
[ ] Quantidade de itens válidos aparece
[ ] Quantidade de itens com erro aparece
[ ] Resumo por categoria aparece
[ ] Categoria reboco soma corretamente
[ ] Categoria pisos soma corretamente
[ ] Itens com erro aparecem em tabela separada
[ ] Itens com erro não entram no total
[ ] Alterar vão muda o resumo automaticamente
[ ] Remover vão muda o resumo automaticamente
[ ] Recarregar página preserva resumo correto
```

### Massa de teste sugerida

#### Reboco com porta + janela

```text
Comprimento: 5
Altura: 2,8
Valor unitário: 35
BDI: 35
Vãos:
- Porta: 0,8 × 2,1 × 1 = 1,68 m²
- Janela: 1,5 × 1,2 × 1 = 1,80 m²
```

Esperado:

```text
Subtotal: R$ 368,20
BDI: R$ 128,87
Total: R$ 497,07
Categoria: Reboco
```

#### Piso

```text
Comprimento: 4
Largura: 3
Valor unitário: 60
BDI: 35
```

Esperado:

```text
Subtotal: R$ 720,00
BDI: R$ 252,00
Total: R$ 972,00
Categoria: Pisos
```

#### Porta

```text
Quantidade: 1
Valor unitário: 250
BDI: 35
```

Esperado:

```text
Subtotal: R$ 250,00
BDI: R$ 87,50
Total: R$ 337,50
Categoria: Acabamentos
```

#### Total geral esperado com os três itens válidos

```text
Subtotal: R$ 1.338,20
BDI: R$ 468,37
Total: R$ 1.806,57
Itens válidos: 3
Itens com erro: 0
```

Se houver um item com erro, ele deve aparecer na tabela de erro e não deve entrar no total.

---

## 10. Commit sugerido

Depois da validação:

```powershell
git status
git add .
git commit -m "feat: adicionar resumo da obra"
git push
```

---

## 11. Próxima etapa

Depois desta etapa, avance para:

```text
Etapa 8 — Exportação JSON pela interface
```

Nessa próxima etapa, a aba `Exportar` deve ganhar:

```text
botão de exportar JSON
nome automático do arquivo
prévia dos dados exportados
opção de baixar o arquivo
```
