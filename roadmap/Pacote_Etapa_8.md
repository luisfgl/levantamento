# Pacote Etapa 8 — Exportação JSON pela Interface

## 1. Objetivo

Esta etapa implementa a exportação JSON pela aba `Exportar`, usando a estrutura já criada em `lib/storage/exportacaoJson.ts`.

Entrega esperada:

```text
Aba Exportar funcional + prévia dos dados + nome automático + download JSON
```

---

## 2. Escopo desta etapa

### Incluído

1. Exibir resumo dos dados que serão exportados.
2. Gerar nome automático do arquivo JSON.
3. Montar objeto de exportação com:

   * obra;
   * ambientes da obra;
   * serviços;
   * levantamentos da obra;
   * vãos dentro dos levantamentos.
4. Exibir prévia técnica do JSON.
5. Baixar arquivo `.json`.
6. Validar se a exportação montada está no formato esperado.
7. Exibir alerta se não houver obra carregada.

### Fora desta etapa

1. Importação visual de JSON.
2. PDF.
3. DOCX.
4. Supabase.
5. Login.
6. Envio por e-mail.

---

## 3. Arquivos novos ou alterados

Criar:

```text
components/exportacao/ExportacaoJsonPanel.tsx
```

Alterar:

```text
src/app/obras/[obraId]/page.tsx
```

Se necessário, criar pasta:

```powershell
mkdir components\exportacao
```

---

## 4. `components/exportacao/ExportacaoJsonPanel.tsx`

```tsx
// components/exportacao/ExportacaoJsonPanel.tsx

'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  baixarJson,
  gerarNomeArquivoExportacao,
  montarExportacaoObra,
  validarImportacaoJson,
} from '@/lib/storage/exportacaoJson'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'

interface ExportacaoJsonPanelProps {
  obra: Obra
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentos: LevantamentoServico[]
}

export function ExportacaoJsonPanel({ obra, ambientes, servicos, levantamentos }: ExportacaoJsonPanelProps) {
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const exportacao = useMemo(() => {
    return montarExportacaoObra({
      obra,
      ambientes,
      servicos,
      levantamentos,
    })
  }, [ambientes, levantamentos, obra, servicos])

  const nomeArquivo = useMemo(() => {
    return gerarNomeArquivoExportacao(obra.nome)
  }, [obra.nome])

  const totalVaos = useMemo(() => {
    return exportacao.levantamentos.reduce((total, levantamento) => total + levantamento.vaos.length, 0)
  }, [exportacao.levantamentos])

  const jsonPreview = useMemo(() => {
    return JSON.stringify(exportacao, null, 2)
  }, [exportacao])

  function handleExportar() {
    setMensagem(null)
    setErro(null)

    if (!validarImportacaoJson(exportacao)) {
      setErro('A exportação montada não passou na validação de estrutura.')
      return
    }

    baixarJson(nomeArquivo, exportacao)
    setMensagem(`Arquivo gerado: ${nomeArquivo}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Exportar JSON</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gere um arquivo de backup local com a obra, ambientes, serviços, levantamentos e vãos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Obra</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{obra.nome}</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Ambientes</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{exportacao.ambientes.length}</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Serviços</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{exportacao.servicos.length}</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Levantamentos</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{exportacao.levantamentos.length}</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Vãos</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{totalVaos}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Arquivo</h3>
        <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
          {nomeArquivo}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={handleExportar}>
            Baixar JSON
          </Button>
        </div>

        {mensagem ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{mensagem}</p> : null}
        {erro ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}
      </Card>

      <Card>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Prévia técnica</h3>
            <p className="text-sm text-slate-600">Conteúdo que será gravado no arquivo JSON.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            versão {exportacao.versao}
          </span>
        </div>

        <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
          {jsonPreview}
        </pre>
      </Card>
    </div>
  )
}
```

---

## 5. Alterar `src/app/obras/[obraId]/page.tsx`

### 5.1 Import novo

Adicione aos imports:

```tsx
import { ExportacaoJsonPanel } from '@/components/exportacao/ExportacaoJsonPanel'
```

---

### 5.2 Substituir bloco da aba `Exportar`

Procure o bloco atual:

```tsx
{abaAtiva === 'Exportar' ? (
  <Card>
    <h2 className="text-xl font-semibold text-slate-900">Exportar</h2>
    <p className="mt-2 text-sm text-slate-500">Botão de exportação JSON entra em etapa própria.</p>
  </Card>
) : null}
```

Substitua por:

```tsx
{abaAtiva === 'Exportar' ? (
  <ExportacaoJsonPanel
    obra={obra}
    ambientes={ambientes}
    servicos={servicos}
    levantamentos={levantamentos}
  />
) : null}
```

---

## 6. Validação técnica

Rodar:

```powershell
npm run lint
npm test
npm run build
```

---

## 7. Validação manual

Rodar:

```powershell
npm run dev
```

Checklist:

```text
[ ] Aba Exportar abre
[ ] Mostra nome da obra
[ ] Mostra quantidade de ambientes
[ ] Mostra quantidade de serviços
[ ] Mostra quantidade de levantamentos
[ ] Mostra quantidade de vãos
[ ] Mostra nome automático do arquivo
[ ] Mostra prévia JSON
[ ] Botão Baixar JSON funciona
[ ] Arquivo baixado abre como JSON válido
[ ] JSON contém obra
[ ] JSON contém ambientes da obra
[ ] JSON contém serviços
[ ] JSON contém levantamentos da obra
[ ] JSON contém vãos dentro dos levantamentos
```

---

## 8. Conferência mínima do arquivo baixado

Depois de baixar, abra o arquivo no VS Code e confira se existe esta estrutura:

```json
{
  "versao": "1.0.0",
  "exportadoEm": "...",
  "obra": {},
  "ambientes": [],
  "servicos": [],
  "levantamentos": []
}
```

Em pelo menos um levantamento de parede com vãos, confirme:

```json
"vaos": [
  {
    "id": "...",
    "levantamentoId": "...",
    "tipo": "porta",
    "largura": 0.8,
    "altura": 2.1,
    "quantidade": 1
  }
]
```

---

## 9. Commit sugerido

Depois da validação:

```powershell
git status
git add .
git commit -m "feat: adicionar exportacao json pela interface"
git push
```

---

## 10. Próxima etapa

Depois desta etapa, avance para:

```text
Etapa 9 — Importação JSON pela interface
```

A importação deve permitir carregar um arquivo JSON exportado pelo próprio sistema e restaurar:

```text
obra
ambientes
serviços
levantamentos
vãos dentro dos levantamentos
```
