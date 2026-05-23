# Especificação Técnica do MVP — Levantamento de Serviços e Valores

## 1. Objetivo técnico do MVP

Criar uma aplicação web local, sem backend e sem autenticação, para validar a lógica central do sistema de levantamento de serviços e valores.

O MVP deve permitir:

1. cadastrar obras;
2. cadastrar ambientes da obra;
3. cadastrar e editar serviços;
4. lançar levantamentos por ambiente;
5. lançar vãos/descontos vinculados a levantamentos;
6. calcular área bruta, área descontada, saldo, subtotal, BDI e total;
7. gerar resumo por categoria;
8. gerar resumo total da obra;
9. salvar dados no navegador com `localStorage`;
10. exportar/importar dados em JSON.

O MVP não deve conter banco de dados, login, PDF, Supabase ou cronograma avançado.

---

## 2. Stack técnica

### 2.1 Tecnologias

* **Next.js**
* **TypeScript**
* **Tailwind CSS**
* **React Hook Form** — opcional
* **Zod** — opcional, mas recomendado para validação
* **localStorage** para persistência local
* **Vitest** ou testes nativos com `node:test` para o motor de cálculo

### 2.2 Restrições técnicas

1. Não usar Supabase no MVP.
2. Não usar banco de dados no MVP.
3. Não usar autenticação no MVP.
4. Não implementar PDF no MVP.
5. Não misturar este projeto com o Franklin.
6. Não colocar regra de cálculo dentro de componente visual.
7. Não depender de API externa.
8. Não salvar dados sensíveis.

---

## 3. Estrutura inicial de pastas

```text
app/
  layout.tsx
  page.tsx
  obras/
    page.tsx
  obras/[obraId]/
    page.tsx
    ambientes/
      page.tsx
    servicos/
      page.tsx
    levantamento/
      page.tsx
    resumo/
      page.tsx

components/
  ui/
    Button.tsx
    Input.tsx
    Select.tsx
    Textarea.tsx
    Card.tsx
    Modal.tsx
    Table.tsx

  obras/
    ObraForm.tsx
    ObraCard.tsx
    ObrasList.tsx

  ambientes/
    AmbienteForm.tsx
    AmbientesTable.tsx

  servicos/
    ServicoForm.tsx
    ServicosTable.tsx

  levantamento/
    LevantamentoForm.tsx
    LevantamentosTable.tsx
    VaosModal.tsx
    VaoForm.tsx
    CalculoItemResumo.tsx

  resumo/
    ResumoCategoriasTable.tsx
    ResumoGeralCard.tsx

lib/
  calculos/
    area.ts
    bdi.ts
    dinheiro.ts
    levantamento.ts
    resumo.ts
    validacoes.ts

  storage/
    storageKeys.ts
    obrasStorage.ts
    projetoStorage.ts
    exportacaoJson.ts

  dados/
    servicosPadrao.ts
    obraExemplo.ts

  tipos/
    comum.ts
    obra.ts
    ambiente.ts
    servico.ts
    levantamento.ts
    vao.ts
    resumo.ts

  utils/
    id.ts
    formatacao.ts
    normalizacao.ts

tests/
  calculos/
    area.test.ts
    bdi.test.ts
    levantamento.test.ts
    resumo.test.ts
```

---

## 4. Convenções gerais

### 4.1 Idioma do código

Usar nomes em português para tipos, funções e campos de domínio.

Exemplos corretos:

```ts
calcularAreaParede()
calcularResumoPorCategoria()
TipoCalculoServico
LevantamentoServico
```

Evitar misturar nomes como `budget`, `room`, `serviceItem`, exceto quando forem nomes técnicos da biblioteca.

### 4.2 Formato monetário

Internamente, valores monetários devem ser tratados em **number decimal**, representando reais.

Exemplo:

```ts
valorUnitario: 35.5 // R$ 35,50
```

No futuro, pode ser migrado para centavos inteiros, mas para MVP local isso adicionaria complexidade desnecessária.

### 4.3 Percentuais

Percentuais devem ser armazenados em formato decimal percentual humano.

Exemplo:

```ts
bdiPercentual: 35
```

O cálculo deve converter internamente:

```ts
valorBdi = subtotal * (bdiPercentual / 100)
```

Não armazenar BDI como `0.35` no MVP, para evitar erro de preenchimento na interface.

### 4.4 IDs

Usar IDs string gerados localmente.

Função sugerida:

```ts
export function criarId(prefixo: string): string {
  return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
```

Exemplos:

```text
obra_1710000000000_ab12cd
amb_1710000000000_ef34gh
serv_1710000000000_ij56kl
lev_1710000000000_mn78op
vao_1710000000000_qr90st
```

---

## 5. Tipos TypeScript

### 5.1 Tipos comuns

Arquivo:

```text
lib/tipos/comum.ts
```

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

### 5.2 Obra

Arquivo:

```text
lib/tipos/obra.ts
```

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

### 5.3 Ambiente

Arquivo:

```text
lib/tipos/ambiente.ts
```

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

### 5.4 Serviço

Arquivo:

```text
lib/tipos/servico.ts
```

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

### 5.5 Vão

Arquivo:

```text
lib/tipos/vao.ts
```

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

### 5.6 Levantamento

Arquivo:

```text
lib/tipos/levantamento.ts
```

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

### 5.7 Resumo

Arquivo:

```text
lib/tipos/resumo.ts
```

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
  categorias: ResumoCategoria[]
}
```

---

## 6. Motor de cálculo

### 6.1 Regras gerais

O motor de cálculo deve:

1. receber dados puros;
2. retornar resultado calculado;
3. não acessar React;
4. não acessar `localStorage`;
5. não formatar moeda;
6. não modificar o objeto original;
7. retornar erros quando houver inconsistência.

### 6.2 Área

Arquivo:

```text
lib/calculos/area.ts
```

Funções:

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

### 6.3 BDI

Arquivo:

```text
lib/calculos/bdi.ts
```

Funções:

```ts
export function calcularBdi(subtotal: number, bdiPercentual: number, usaBdi: boolean): number {
  if (!usaBdi) return 0
  return subtotal * (bdiPercentual / 100)
}

export function calcularTotal(subtotal: number, valorBdi: number): number {
  return subtotal + valorBdi
}
```

### 6.4 Validações

Arquivo:

```text
lib/calculos/validacoes.ts
```

Funções sugeridas:

```ts
export function validarNumeroNaoNegativo(valor: number | undefined, campo: string): string[] {
  if (valor === undefined || valor === null) return []
  if (Number.isNaN(valor)) return [`${campo} inválido.`]
  if (valor < 0) return [`${campo} não pode ser negativo.`]
  return []
}
```

Regras obrigatórias:

1. `comprimento >= 0`
2. `largura >= 0`
3. `altura >= 0`
4. `quantidade >= 0`
5. `valorUnitario >= 0`
6. `bdiPercentual >= 0`
7. `valorManual >= 0`
8. `areaDescontada <= areaBruta` quando o tipo exigir área líquida.

### 6.5 Cálculo completo do levantamento

Arquivo:

```text
lib/calculos/levantamento.ts
```

Assinatura:

```ts
import type { Servico } from '@/lib/tipos/servico'
import type {
  LevantamentoServico,
  ResultadoCalculoLevantamento,
} from '@/lib/tipos/levantamento'

export function calcularLevantamento(
  levantamento: LevantamentoServico,
  servico: Servico,
): ResultadoCalculoLevantamento
```

Comportamento por tipo:

#### Tipo `parede`

Campos mínimos:

* `comprimento`
* `altura`
* `valorUnitario`

Cálculo:

```text
areaBruta = comprimento × altura
areaDescontada = soma dos vãos
saldo = areaBruta - areaDescontada
subtotal = saldo × valorUnitario
valorBdi = subtotal × bdiPercentual / 100, se usaBdi = true
total = subtotal + valorBdi
```

#### Tipo `piso`

Campos mínimos:

* `comprimento`
* `largura`
* `valorUnitario`

Cálculo:

```text
areaBruta = comprimento × largura
areaDescontada = 0
saldo = areaBruta
subtotal = saldo × valorUnitario
valorBdi = subtotal × bdiPercentual / 100, se usaBdi = true
total = subtotal + valorBdi
```

#### Tipo `item_unitario`

Campos mínimos:

* `quantidade`
* `valorUnitario`

Cálculo:

```text
areaBruta = 0
areaDescontada = 0
saldo = quantidade
subtotal = quantidade × valorUnitario
valorBdi = subtotal × bdiPercentual / 100, se usaBdi = true
total = subtotal + valorBdi
```

#### Tipo `valor_manual`

Campos mínimos:

* `valorManual`

Cálculo:

```text
areaBruta = 0
areaDescontada = 0
saldo = 1
subtotal = valorManual
valorBdi = subtotal × bdiPercentual / 100, se usaBdi = true
total = subtotal + valorBdi
```

#### Tipo `comprimento_linear`

Campos mínimos:

* `comprimento`
* `valorUnitario`

Cálculo:

```text
areaBruta = 0
areaDescontada = 0
saldo = comprimento
subtotal = comprimento × valorUnitario
valorBdi = subtotal × bdiPercentual / 100, se usaBdi = true
total = subtotal + valorBdi
```

### 6.6 Resumo por categoria

Arquivo:

```text
lib/calculos/resumo.ts
```

Assinatura:

```ts
import type { Servico } from '@/lib/tipos/servico'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { ResumoObra } from '@/lib/tipos/resumo'

export function calcularResumoObra(
  levantamentos: LevantamentoServico[],
  servicos: Servico[],
): ResumoObra
```

Regras:

1. Calcular cada levantamento com seu serviço correspondente.
2. Ignorar levantamentos com erro crítico no total final, mas retornar indicação visual na interface.
3. Agrupar por categoria do serviço.
4. Somar subtotal, BDI e total.
5. Contar quantidade de itens válidos por categoria.

---

## 7. Persistência local

### 7.1 Chaves do localStorage

Arquivo:

```text
lib/storage/storageKeys.ts
```

```ts
export const STORAGE_KEYS = {
  OBRAS: 'lsv_obras_v1',
  AMBIENTES: 'lsv_ambientes_v1',
  SERVICOS: 'lsv_servicos_v1',
  LEVANTAMENTOS: 'lsv_levantamentos_v1',
} as const
```

### 7.2 Estratégia de salvamento

No MVP, salvar as entidades separadas por chave:

```text
lsv_obras_v1
lsv_ambientes_v1
lsv_servicos_v1
lsv_levantamentos_v1
```

Vantagem:

* facilita migrar depois para banco de dados;
* evita um JSON gigante único;
* mantém o modelo parecido com tabelas futuras.

### 7.3 Funções de storage

Arquivo:

```text
lib/storage/projetoStorage.ts
```

Funções:

```ts
export function carregarLista<T>(key: string): T[]
export function salvarLista<T>(key: string, itens: T[]): void
export function inserirItem<T extends { id: string }>(key: string, item: T): void
export function atualizarItem<T extends { id: string }>(key: string, itemAtualizado: T): void
export function removerItem(key: string, id: string): void
```

### 7.4 Cuidados obrigatórios

1. Verificar se `window` existe antes de acessar `localStorage`.
2. Tratar JSON inválido.
3. Retornar lista vazia em caso de erro de leitura.
4. Nunca quebrar a tela por dados corrompidos.

Exemplo de regra:

```text
se localStorage estiver corrompido, o sistema deve exibir erro controlado e permitir limpar os dados locais.
```

---

## 8. Dados padrão

### 8.1 Serviços padrão

Arquivo:

```text
lib/dados/servicosPadrao.ts
```

Serviços iniciais:

```ts
export const servicosPadrao = [
  {
    nome: 'Reboco interno',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Reboco externo',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Contrapiso',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Regularização',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Piso',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Rodapé',
    categoria: 'pisos',
    unidade: 'm',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'comprimento_linear',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Revestimento parede',
    categoria: 'revestimentos',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Pintura parede',
    categoria: 'pintura',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Elevação de muro',
    categoria: 'muros',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Porta',
    categoria: 'acabamentos',
    unidade: 'un',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'item_unitario',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Janela',
    categoria: 'acabamentos',
    unidade: 'un',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'item_unitario',
    usaBdi: true,
    ativo: true,
  },
  {
    nome: 'Instalações elétricas',
    categoria: 'instalacoes',
    unidade: 'verba',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'valor_manual',
    usaBdi: true,
    ativo: true,
  },
]
```

Observação importante: os valores unitários padrão começam como `0` para evitar falsa referência comercial. O usuário deve informar seus próprios valores.

---

## 9. Fluxo de telas

### 9.1 Fluxo principal

```text
Dashboard
  ↓
Criar obra
  ↓
Abrir obra
  ↓
Cadastrar ambientes
  ↓
Conferir serviços padrão / editar valores
  ↓
Lançar levantamento
  ↓
Cadastrar vãos quando necessário
  ↓
Ver resumo
  ↓
Exportar JSON
```

### 9.2 Navegação interna da obra

Dentro de uma obra, usar abas ou menu lateral:

```text
Dados da obra
Ambientes
Serviços
Levantamento
Resumo
Exportar
```

Para o MVP, a melhor opção é usar abas simples na página da obra.

---

## 10. Componentes principais

### 10.1 `ObraForm`

Responsável por:

* criar obra;
* editar obra;
* validar campos básicos.

Campos obrigatórios:

* nome;
* cliente;
* data do orçamento;
* BDI padrão.

### 10.2 `AmbienteForm`

Responsável por:

* criar ambiente;
* editar ambiente.

Campos obrigatórios:

* nome.

Campos opcionais:

* pavimento;
* descrição.

### 10.3 `ServicoForm`

Responsável por:

* criar serviço;
* editar serviço;
* definir tipo de cálculo;
* definir unidade;
* definir valor unitário padrão.

Campos obrigatórios:

* nome;
* categoria;
* unidade;
* tipo de cálculo;
* valor unitário padrão.

### 10.4 `LevantamentoForm`

Responsável por lançar item de levantamento.

Comportamento dinâmico:

* se serviço for `parede`, exibir comprimento e altura;
* se serviço for `piso`, exibir comprimento e largura;
* se serviço for `item_unitario`, exibir quantidade;
* se serviço for `valor_manual`, exibir valor manual;
* se serviço for `comprimento_linear`, exibir comprimento.

Campos comuns:

* ambiente;
* serviço;
* descrição;
* valor unitário;
* BDI percentual;
* observações.

### 10.5 `VaosModal`

Responsável por:

* listar vãos do levantamento;
* adicionar vão;
* editar vão;
* remover vão;
* exibir total de área descontada.

Só deve aparecer para serviços compatíveis com desconto de área, principalmente:

* parede;
* pintura;
* reboco;
* muro;
* revestimento de parede.

### 10.6 `LevantamentosTable`

Responsável por exibir:

* ambiente;
* serviço;
* dimensões;
* área bruta;
* área descontada;
* saldo;
* valor unitário;
* subtotal;
* BDI;
* total;
* alertas de erro.

A tabela deve permitir:

* editar;
* duplicar;
* excluir;
* abrir vãos.

### 10.7 `ResumoCategoriasTable`

Responsável por agrupar totais por categoria.

Colunas:

* categoria;
* quantidade de itens;
* subtotal;
* BDI;
* total.

### 10.8 `ResumoGeralCard`

Responsável por exibir:

* subtotal geral;
* BDI total;
* total geral;
* quantidade total de itens;
* quantidade de itens com erro.

---

## 11. Estados e carregamento

### 11.1 Estado principal da página da obra

A página da obra deve carregar:

```ts
const [obra, setObra] = useState<Obra | null>(null)
const [ambientes, setAmbientes] = useState<Ambiente[]>([])
const [servicos, setServicos] = useState<Servico[]>([])
const [levantamentos, setLevantamentos] = useState<LevantamentoServico[]>([])
```

### 11.2 Carregamento inicial

Ao abrir a página da obra:

1. carregar todas as obras;
2. localizar a obra pelo `obraId`;
3. carregar ambientes da obra;
4. carregar serviços;
5. se não houver serviços, inicializar serviços padrão;
6. carregar levantamentos da obra.

### 11.3 Atualização

Cada alteração deve:

1. atualizar estado React;
2. persistir no `localStorage`;
3. recalcular resumo automaticamente.

---

## 12. Exportação e importação JSON

### 12.1 Exportação

Arquivo:

```text
lib/storage/exportacaoJson.ts
```

Formato sugerido:

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

### 12.2 Nome do arquivo exportado

Formato:

```text
levantamento-servicos-valores-{nome-da-obra}-{yyyy-mm-dd}.json
```

### 12.3 Importação

A importação deve:

1. validar se o JSON tem estrutura compatível;
2. verificar versão;
3. impedir sobrescrever obra sem aviso;
4. permitir importar como nova obra;
5. regenerar IDs se necessário.

No MVP, a importação pode ser simples, mas deve evitar apagar dados existentes sem confirmação.

---

## 13. Regras de interface

### 13.1 Campos numéricos

Todos os campos numéricos devem:

1. aceitar vírgula ou ponto na digitação;
2. converter para number internamente;
3. impedir número negativo;
4. exibir erro quando inválido.

### 13.2 Valores monetários

Exibir como:

```text
R$ 1.234,56
```

Função sugerida:

```ts
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}
```

### 13.3 Medidas

Exibir números com até duas casas decimais no resumo.

Exemplo:

```text
12,35 m²
8,00 m
3 un
```

### 13.4 Alertas

Alertas críticos:

* área descontada maior que área bruta;
* serviço sem valor unitário;
* item sem ambiente;
* item sem serviço;
* campo obrigatório ausente.

Alertas não críticos:

* valor unitário zerado;
* BDI zerado;
* ambiente sem levantamento.

---

## 14. Testes mínimos do motor de cálculo

### 14.1 `area.test.ts`

Casos mínimos:

1. parede 4 m × 2,8 m = 11,2 m²;
2. piso 5 m × 3 m = 15 m²;
3. vão 0,8 m × 2,1 m × 1 = 1,68 m²;
4. vão 1,5 m × 1,2 m × 2 = 3,6 m².

### 14.2 `bdi.test.ts`

Casos mínimos:

1. subtotal 1000 com BDI 35% = 350;
2. subtotal 1000 sem BDI = 0;
3. total 1000 + 350 = 1350.

### 14.3 `levantamento.test.ts`

Casos mínimos:

1. serviço parede sem vão;
2. serviço parede com vão;
3. serviço piso;
4. serviço item unitário;
5. serviço valor manual;
6. serviço comprimento linear;
7. erro quando área descontada for maior que área bruta;
8. erro quando valor unitário for negativo.

### 14.4 `resumo.test.ts`

Casos mínimos:

1. agrupar dois itens da mesma categoria;
2. agrupar itens de categorias diferentes;
3. somar subtotal, BDI e total;
4. ignorar item com erro crítico;
5. retornar quantidade correta de itens válidos.

---

## 15. Massa de dados para teste manual

### 15.1 Obra exemplo

```text
Nome: Residência Modelo
Cliente: Cliente Teste
Endereço: Rua Exemplo, 123
BDI padrão: 35%
Status: rascunho
```

### 15.2 Ambientes exemplo

```text
Térreo / Sala
Térreo / Cozinha
Térreo / Banheiro
Térreo / Garagem
Superior / Suíte
Superior / Quarto 1
```

### 15.3 Lançamentos exemplo

#### Reboco sala

```text
Ambiente: Sala
Serviço: Reboco interno
Comprimento: 5,00 m
Altura: 2,80 m
Valor unitário: R$ 35,00/m²
BDI: 35%

Vãos:
- Porta: 0,80 × 2,10 × 1 = 1,68 m²
- Janela: 1,50 × 1,20 × 1 = 1,80 m²

Área bruta: 14,00 m²
Área descontada: 3,48 m²
Saldo: 10,52 m²
Subtotal: R$ 368,20
BDI: R$ 128,87
Total: R$ 497,07
```

#### Piso cozinha

```text
Ambiente: Cozinha
Serviço: Piso
Comprimento: 4,00 m
Largura: 3,00 m
Valor unitário: R$ 60,00/m²
BDI: 35%

Área bruta: 12,00 m²
Subtotal: R$ 720,00
BDI: R$ 252,00
Total: R$ 972,00
```

#### Porta banheiro

```text
Ambiente: Banheiro
Serviço: Porta
Quantidade: 1
Valor unitário: R$ 250,00/un
BDI: 35%

Subtotal: R$ 250,00
BDI: R$ 87,50
Total: R$ 337,50
```

---

## 16. Critérios de aceite do MVP

O MVP será aceito quando:

1. for possível criar uma obra;
2. for possível editar dados da obra;
3. for possível criar ambientes;
4. for possível editar serviços padrão;
5. for possível adicionar levantamento por ambiente;
6. o formulário mudar conforme tipo de cálculo do serviço;
7. for possível adicionar vãos a um item de parede;
8. o sistema calcular área bruta, desconto, saldo, subtotal, BDI e total;
9. o sistema impedir saldo negativo;
10. o resumo por categoria estiver correto;
11. o total geral estiver correto;
12. os dados persistirem ao recarregar a página;
13. for possível exportar JSON da obra;
14. os testes do motor de cálculo passarem.

---

## 17. Ordem recomendada de implementação

### Etapa 1 — Base do projeto

1. Criar projeto Next.js.
2. Configurar TypeScript.
3. Configurar Tailwind.
4. Criar estrutura de pastas.
5. Criar tipos TypeScript.

### Etapa 2 — Motor de cálculo

1. Criar funções de área.
2. Criar funções de BDI.
3. Criar cálculo de levantamento.
4. Criar cálculo de resumo.
5. Criar testes mínimos.

### Etapa 3 — Storage local

1. Criar chaves do localStorage.
2. Criar funções genéricas de salvar/carregar.
3. Criar inicialização dos serviços padrão.
4. Criar exportação JSON.

### Etapa 4 — Interface básica

1. Criar dashboard.
2. Criar cadastro de obra.
3. Criar página da obra.
4. Criar abas internas.
5. Criar cadastro de ambientes.
6. Criar cadastro de serviços.

### Etapa 5 — Levantamento

1. Criar formulário dinâmico.
2. Criar tabela de levantamentos.
3. Criar modal de vãos.
4. Exibir cálculos por item.
5. Exibir erros por item.

### Etapa 6 — Resumo

1. Criar resumo por categoria.
2. Criar card de total geral.
3. Criar aviso de itens com erro.
4. Conferir massa de teste manual.

### Etapa 7 — Exportação

1. Exportar JSON.
2. Importar JSON.
3. Validar estrutura importada.
4. Permitir importar como nova obra.

---

## 18. Decisões técnicas registradas

1. O MVP será local.
2. O cálculo ficará isolado em `lib/calculos`.
3. O localStorage será dividido por entidade.
4. Os serviços padrão terão valor unitário inicial igual a zero.
5. O usuário poderá editar valores unitários.
6. O BDI será armazenado como percentual humano, por exemplo `35`.
7. Vãos serão objetos vinculados ao levantamento.
8. O sistema não aceitará saldo negativo.
9. PDF fica fora do MVP.
10. Supabase fica fora do MVP.
11. Cronograma físico-financeiro fica para fase posterior, salvo se a base do levantamento ficar pronta antes do previsto.

---

## 19. Itens propositalmente adiados

1. PDF profissional.
2. DOCX.
3. XLSX.
4. Supabase.
5. Login.
6. Plano pago.
7. Controle de equipe.
8. Medição por funcionário.
9. Controle de material.
10. Composição SINAPI.
11. Importação de planta.
12. Integração com Revit.
13. Integração com AutoCAD.
14. Cronograma avançado.
15. Relatório com assinatura.

---

## 20. Observações finais

Esta especificação deve orientar a primeira implementação funcional do sistema. O objetivo não é criar um produto completo de gestão de obras, mas validar o núcleo técnico:

```text
medida → quantidade calculada → desconto → saldo → valor unitário → BDI → total → resumo
```

Se esse fluxo estiver confiável, o projeto pode evoluir para um SaaS. Se esse fluxo ficar confuso, qualquer camada posterior — PDF, banco, login ou assinatura — apenas aumentará o problema.
