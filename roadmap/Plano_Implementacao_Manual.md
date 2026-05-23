# Plano de Implementação Manual — MVP Levantamento de Serviços e Valores

## 1. Objetivo deste documento

Este documento transforma a especificação técnica do MVP em uma sequência prática de implementação manual.

A finalidade é permitir construir o sistema sem Codex, com etapas pequenas, verificáveis e sem misturar este projeto com o Franklin.

O produto inicial será uma aplicação local com:

* Next.js;
* TypeScript;
* Tailwind CSS;
* motor de cálculo isolado;
* persistência em `localStorage`;
* exportação/importação JSON;
* sem Supabase;
* sem login;
* sem PDF.

---

## 2. Regra principal do projeto

O MVP só deve avançar para telas complexas depois que o motor de cálculo estiver testado.

Ordem obrigatória:

```text
Tipos → Cálculos → Testes → Storage → UI → Exportação
```

Não inverter essa ordem.

---

## 3. Etapa 0 — Criação do projeto

### 3.1 Criar pasta do projeto

Sugestão de caminho:

```powershell
cd E:\Projetos
npx create-next-app@latest levantamento-servicos-valores --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
cd levantamento-servicos-valores
```

### 3.2 Rodar o projeto

```powershell
npm run dev
```

Acessar:

```text
http://localhost:3000
```

### 3.3 Critério de pronto

A etapa estará concluída quando:

* o projeto abrir no navegador;
* não houver erro no terminal;
* a página inicial padrão do Next.js carregar corretamente.

---

## 4. Etapa 1 — Estrutura de pastas

Criar manualmente a seguinte estrutura:

```text
components/
  ui/
  obras/
  ambientes/
  servicos/
  levantamento/
  resumo/

lib/
  calculos/
  storage/
  dados/
  tipos/
  utils/

tests/
  calculos/
```

### 4.1 Arquivos mínimos da etapa

```text
lib/tipos/comum.ts
lib/tipos/obra.ts
lib/tipos/ambiente.ts
lib/tipos/servico.ts
lib/tipos/vao.ts
lib/tipos/levantamento.ts
lib/tipos/resumo.ts

lib/utils/id.ts
lib/utils/formatacao.ts
lib/utils/normalizacao.ts
```

### 4.2 Critério de pronto

A etapa estará concluída quando:

* todas as pastas existirem;
* todos os arquivos de tipos existirem;
* o projeto continuar compilando.

---

## 5. Etapa 2 — Tipos TypeScript

### 5.1 Arquivo `lib/tipos/comum.ts`

Criar os tipos de domínio comuns:

```ts
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

### 5.2 Arquivo `lib/tipos/obra.ts`

```ts
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

### 5.3 Arquivo `lib/tipos/ambiente.ts`

```ts
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

### 5.4 Arquivo `lib/tipos/servico.ts`

```ts
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

### 5.5 Arquivo `lib/tipos/vao.ts`

```ts
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

### 5.6 Arquivo `lib/tipos/levantamento.ts`

```ts
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

### 5.7 Arquivo `lib/tipos/resumo.ts`

```ts
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

### 5.8 Critério de pronto

A etapa estará concluída quando:

* todos os tipos forem criados;
* não houver erro de TypeScript;
* o projeto compilar normalmente.

---

## 6. Etapa 3 — Utilitários básicos

### 6.1 Arquivo `lib/utils/id.ts`

```ts
export function criarId(prefixo: string): string {
  return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
```

### 6.2 Arquivo `lib/utils/formatacao.ts`

```ts
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

### 6.3 Arquivo `lib/utils/normalizacao.ts`

```ts
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

### 6.4 Critério de pronto

A etapa estará concluída quando:

* utilitários forem criados;
* não houver erro de lint ou TypeScript.

---

## 7. Etapa 4 — Motor de cálculo

### 7.1 Arquivo `lib/calculos/area.ts`

```ts
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

### 7.2 Arquivo `lib/calculos/bdi.ts`

```ts
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

### 7.3 Arquivo `lib/calculos/validacoes.ts`

```ts
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

### 7.4 Arquivo `lib/calculos/levantamento.ts`

Implementar cálculo completo por tipo de serviço.

Função obrigatória:

```ts
export function calcularLevantamento(
  levantamento: LevantamentoServico,
  servico: Servico,
): ResultadoCalculoLevantamento
```

Regras:

* tipo `parede`: usa comprimento × altura e desconta vãos;
* tipo `piso`: usa comprimento × largura;
* tipo `item_unitario`: usa quantidade;
* tipo `valor_manual`: usa valorManual;
* tipo `comprimento_linear`: usa comprimento;
* sempre calcular BDI se `usaBdi` for verdadeiro;
* retornar erros em vez de lançar exceção;
* não aceitar saldo negativo.

### 7.5 Arquivo `lib/calculos/resumo.ts`

Implementar:

```ts
export function calcularResumoObra(
  levantamentos: LevantamentoServico[],
  servicos: Servico[],
): ResumoObra
```

Regras:

* procurar serviço pelo `servicoId`;
* calcular item;
* agrupar por categoria;
* ignorar item com erro no total geral;
* contar itens com erro;
* retornar subtotal, BDI e total geral.

### 7.6 Critério de pronto

A etapa estará concluída quando:

* todos os arquivos de cálculo existirem;
* funções exportadas estiverem tipadas;
* nenhum cálculo depender de React;
* nenhum cálculo acessar `localStorage`;
* nenhum cálculo formatar moeda.

---

## 8. Etapa 5 — Testes do motor

### 8.1 Configuração mínima

Opção simples com Node test runner:

```powershell
npm pkg set scripts.test="node --test tests/**/*.test.mjs"
```

Como o projeto é TypeScript, há duas opções:

1. usar Vitest;
2. ou testar funções compiladas/convertidas.

Recomendação prática: usar Vitest.

```powershell
npm install -D vitest
npm pkg set scripts.test="vitest run"
```

### 8.2 Criar testes

Arquivos:

```text
tests/calculos/area.test.ts
tests/calculos/bdi.test.ts
tests/calculos/levantamento.test.ts
tests/calculos/resumo.test.ts
```

### 8.3 Casos obrigatórios

#### Área

* parede 4 × 2,8 = 11,2;
* piso 5 × 3 = 15;
* vão 0,8 × 2,1 × 1 = 1,68.

#### BDI

* subtotal 1000 com BDI 35 = 350;
* subtotal 1000 sem BDI = 0;
* total 1000 + 350 = 1350.

#### Levantamento

* parede sem vão;
* parede com vão;
* piso;
* item unitário;
* valor manual;
* comprimento linear;
* área descontada maior que área bruta gera erro;
* valor unitário negativo gera erro.

#### Resumo

* agrupa por categoria;
* soma subtotal;
* soma BDI;
* soma total;
* conta itens com erro.

### 8.4 Critério de pronto

A etapa estará concluída quando:

```powershell
npm test
```

executar sem falhas.

---

## 9. Etapa 6 — Storage local

### 9.1 Arquivo `lib/storage/storageKeys.ts`

```ts
export const STORAGE_KEYS = {
  OBRAS: 'lsv_obras_v1',
  AMBIENTES: 'lsv_ambientes_v1',
  SERVICOS: 'lsv_servicos_v1',
  LEVANTAMENTOS: 'lsv_levantamentos_v1',
} as const
```

### 9.2 Arquivo `lib/storage/projetoStorage.ts`

Implementar funções genéricas:

```ts
export function carregarLista<T>(key: string): T[]
export function salvarLista<T>(key: string, itens: T[]): void
export function inserirItem<T extends { id: string }>(key: string, item: T): void
export function atualizarItem<T extends { id: string }>(key: string, itemAtualizado: T): void
export function removerItem(key: string, id: string): void
```

Regras:

* retornar lista vazia se `window` não existir;
* retornar lista vazia se JSON estiver inválido;
* salvar apenas arrays;
* não quebrar renderização.

### 9.3 Arquivo `lib/storage/exportacaoJson.ts`

Implementar exportação/importação de obra.

Interface:

```ts
export interface ExportacaoProjetoLSV {
  versao: '1.0.0'
  exportadoEm: string
  obra: Obra
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentos: LevantamentoServico[]
}
```

Funções:

```ts
export function montarExportacaoObra(...): ExportacaoProjetoLSV
export function baixarJson(nomeArquivo: string, dados: unknown): void
export function validarImportacaoJson(dados: unknown): dados is ExportacaoProjetoLSV
```

### 9.4 Critério de pronto

A etapa estará concluída quando:

* obra, ambientes, serviços e levantamentos forem persistidos;
* recarregar a página não apagar dados;
* exportação JSON funcionar.

---

## 10. Etapa 7 — Dados padrão

### 10.1 Arquivo `lib/dados/servicosPadrao.ts`

Criar lista de serviços padrão com valor unitário `0`.

Categorias mínimas:

* reboco;
* pisos;
* revestimentos;
* pintura;
* muros;
* acabamentos;
* instalações;
* complementação.

### 10.2 Inicialização

Ao abrir o sistema, se não houver serviços no `localStorage`, criar serviços padrão.

Atenção: não recriar serviços padrão toda vez que abrir a página, senão duplicará dados.

### 10.3 Critério de pronto

A etapa estará concluída quando:

* serviços padrão aparecerem na tela de serviços;
* não houver duplicação ao recarregar a página;
* usuário conseguir editar valor unitário.

---

## 11. Etapa 8 — Interface inicial

### 11.1 Página inicial `app/page.tsx`

Função:

* apresentar nome do sistema;
* mostrar botão para acessar obras;
* explicar que é MVP local.

### 11.2 Página `app/obras/page.tsx`

Função:

* listar obras;
* criar nova obra;
* editar obra;
* excluir obra;
* abrir obra.

### 11.3 Página `app/obras/[obraId]/page.tsx`

Função:

* carregar obra pelo ID;
* exibir abas internas:

  * Dados da obra;
  * Ambientes;
  * Serviços;
  * Levantamento;
  * Resumo;
  * Exportar.

### 11.4 Critério de pronto

A etapa estará concluída quando:

* criar obra funcionar;
* abrir obra funcionar;
* recarregar página preservar obra;
* excluir obra remover dados relacionados ou sinalizar que removerá.

---

## 12. Etapa 9 — Ambientes

### 12.1 Componentes

Criar:

```text
components/ambientes/AmbienteForm.tsx
components/ambientes/AmbientesTable.tsx
```

### 12.2 Campos

* pavimento;
* nome;
* descrição.

### 12.3 Regras

* nome é obrigatório;
* ordem pode ser automática;
* ambiente deve estar vinculado à obra.

### 12.4 Critério de pronto

A etapa estará concluída quando:

* criar ambiente funcionar;
* editar ambiente funcionar;
* excluir ambiente funcionar;
* ambientes forem filtrados por obra.

---

## 13. Etapa 10 — Serviços

### 13.1 Componentes

Criar:

```text
components/servicos/ServicoForm.tsx
components/servicos/ServicosTable.tsx
```

### 13.2 Campos

* nome;
* categoria;
* unidade;
* tipo de cálculo;
* valor unitário padrão;
* usa BDI;
* ativo.

### 13.3 Regras

* nome é obrigatório;
* valor unitário não pode ser negativo;
* serviço inativo não aparece como opção de novo levantamento;
* serviço usado em levantamento não deve ser apagado fisicamente; preferir inativar.

### 13.4 Critério de pronto

A etapa estará concluída quando:

* serviços padrão carregarem;
* usuário conseguir editar valores;
* usuário conseguir criar serviço novo;
* usuário conseguir inativar serviço.

---

## 14. Etapa 11 — Levantamento

### 14.1 Componentes

Criar:

```text
components/levantamento/LevantamentoForm.tsx
components/levantamento/LevantamentosTable.tsx
components/levantamento/CalculoItemResumo.tsx
```

### 14.2 Formulário dinâmico

Campos conforme tipo:

| Tipo de cálculo    | Campos exibidos      |
| ------------------ | -------------------- |
| parede             | comprimento, altura  |
| piso               | comprimento, largura |
| item_unitario      | quantidade           |
| valor_manual       | valor manual         |
| comprimento_linear | comprimento          |

Campos comuns:

* ambiente;
* serviço;
* descrição;
* valor unitário;
* BDI percentual;
* observações.

### 14.3 Regras

* ao selecionar serviço, preencher valor unitário com valor padrão;
* ao selecionar serviço, preencher unidade automaticamente;
* ao selecionar serviço, preencher `usaBdi` automaticamente;
* ao criar levantamento, salvar `servicoId`, não copiar categoria;
* cálculo deve sempre buscar o serviço vinculado.

### 14.4 Critério de pronto

A etapa estará concluída quando:

* criar levantamento funcionar;
* editar levantamento funcionar;
* duplicar levantamento funcionar;
* excluir levantamento funcionar;
* cálculo aparecer corretamente na tabela;
* item com erro aparecer destacado.

---

## 15. Etapa 12 — Vãos

### 15.1 Componentes

Criar:

```text
components/levantamento/VaosModal.tsx
components/levantamento/VaoForm.tsx
```

### 15.2 Campos

* tipo;
* descrição;
* largura;
* altura;
* quantidade.

### 15.3 Regras

* vão só deve ser habilitado para serviço de tipo `parede`;
* área do vão = largura × altura × quantidade;
* soma dos vãos atualiza área descontada;
* se área descontada > área bruta, o item deve exibir erro;
* não salvar largura, altura ou quantidade negativa.

### 15.4 Critério de pronto

A etapa estará concluída quando:

* adicionar vão funcionar;
* editar vão funcionar;
* remover vão funcionar;
* área descontada atualizar automaticamente;
* saldo negativo gerar erro.

---

## 16. Etapa 13 — Resumo

### 16.1 Componentes

Criar:

```text
components/resumo/ResumoCategoriasTable.tsx
components/resumo/ResumoGeralCard.tsx
```

### 16.2 Regras

* usar `calcularResumoObra`;
* agrupar por categoria;
* somar subtotal, BDI e total;
* exibir quantidade de itens válidos;
* exibir quantidade de itens com erro;
* não somar item com erro crítico no total geral.

### 16.3 Critério de pronto

A etapa estará concluída quando:

* resumo por categoria bater com os cálculos individuais;
* total geral bater com a soma das categorias;
* itens com erro forem informados.

---

## 17. Etapa 14 — Exportação e importação

### 17.1 Exportação

Criar botão:

```text
Exportar JSON
```

O arquivo deve conter:

* obra;
* ambientes da obra;
* serviços;
* levantamentos da obra;
* versão;
* data de exportação.

### 17.2 Importação

Criar botão:

```text
Importar JSON
```

Regras:

* validar estrutura;
* importar como nova obra;
* evitar sobrescrever dados existentes;
* regenerar IDs se necessário.

### 17.3 Critério de pronto

A etapa estará concluída quando:

* exportar arquivo JSON funcionar;
* importar arquivo exportado funcionar;
* obra importada abrir corretamente.

---

## 18. Etapa 15 — Revisão final do MVP

### 18.1 Checklist funcional

* [ ] Criar obra.
* [ ] Editar obra.
* [ ] Excluir obra.
* [ ] Criar ambiente.
* [ ] Editar ambiente.
* [ ] Excluir ambiente.
* [ ] Carregar serviços padrão.
* [ ] Editar serviço.
* [ ] Criar serviço novo.
* [ ] Inativar serviço.
* [ ] Criar levantamento tipo parede.
* [ ] Criar levantamento tipo piso.
* [ ] Criar levantamento tipo item unitário.
* [ ] Criar levantamento tipo valor manual.
* [ ] Criar levantamento tipo comprimento linear.
* [ ] Adicionar vão.
* [ ] Validar saldo negativo.
* [ ] Calcular resumo por categoria.
* [ ] Calcular total geral.
* [ ] Persistir dados após reload.
* [ ] Exportar JSON.
* [ ] Importar JSON.

### 18.2 Checklist técnico

* [ ] Motor de cálculo sem React.
* [ ] Storage sem regra de cálculo.
* [ ] Componentes sem duplicação de fórmula.
* [ ] Tipos centralizados.
* [ ] Cálculos testados.
* [ ] Sem Supabase.
* [ ] Sem PDF.
* [ ] Sem dependência externa desnecessária.
* [ ] Sem dados do Franklin.
* [ ] Sem reaproveitar arquivos do Franklin diretamente.

---

## 19. Sequência de commits sugerida

Mesmo sem Codex, usar Git desde o início.

### Commit 1

```text
chore: criar projeto base next
```

### Commit 2

```text
chore: adicionar estrutura inicial de pastas
```

### Commit 3

```text
feat: adicionar tipos de dominio do mvp
```

### Commit 4

```text
feat: implementar motor de calculo inicial
```

### Commit 5

```text
test: adicionar testes do motor de calculo
```

### Commit 6

```text
feat: adicionar persistencia local
```

### Commit 7

```text
feat: implementar cadastro de obras
```

### Commit 8

```text
feat: implementar ambientes e servicos
```

### Commit 9

```text
feat: implementar levantamentos e vaos
```

### Commit 10

```text
feat: implementar resumo da obra
```

### Commit 11

```text
feat: adicionar exportacao e importacao json
```

### Commit 12

```text
chore: revisar mvp local
```

---

## 20. Comando de validação antes de cada commit

Antes de cada commit, rodar:

```powershell
npm run lint
npm test
npm run build
```

Se algum falhar, não fazer commit.

---

## 21. Próximo passo depois deste documento

O próximo passo prático é gerar os primeiros arquivos-base do projeto:

1. tipos TypeScript;
2. utilitários;
3. motor de cálculo;
4. testes do motor.

A primeira entrega real de código deve ser pequena:

```text
Tipos + motor de cálculo + testes
```

Sem interface ainda.

Esse corte reduz risco e valida a parte mais importante do sistema antes de gastar tempo com tela.

