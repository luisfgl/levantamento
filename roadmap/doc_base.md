# Documento-base do Sistema — Levantamento de Serviços e Valores

## 1. Visão do Produto

O sistema tem como objetivo transformar uma planilha de levantamento de serviços e valores em uma aplicação técnica para orçamento, medição e acompanhamento físico-financeiro de obras.

O foco inicial não é substituir um ERP de construção civil. O foco é resolver uma dor objetiva: permitir que o profissional lance medidas, aplique valores unitários, desconte vãos, calcule BDI e gere um resumo confiável de mão de obra/serviços.

## 2. Nome provisório

Nome técnico provisório:

**Levantamento de Serviços e Valores**

Possíveis nomes comerciais:

* **ObraCalc Técnico**
* **MediçãoPro**
* **Levantare**
* **OrçaObra Técnico**
* **Franklin Obras** — somente se no futuro fizer sentido integrar ao ecossistema Franklin

Recomendação inicial: manter como projeto separado do Franklin.

## 3. Problema que o sistema resolve

Atualmente, o processo está concentrado em planilha. Isso gera riscos operacionais:

* fórmulas podem ser apagadas;
* células podem ser preenchidas no lugar errado;
* cada orçamento depende muito do modelo anterior;
* desconto de vãos é manual;
* cronograma físico-financeiro fica acoplado à planilha;
* difícil reaproveitar serviços e valores unitários;
* difícil gerar relatórios padronizados;
* difícil controlar versões de orçamento.

O software deve transformar esse processo em um fluxo controlado, com cálculo padronizado e menor risco de erro.

## 4. Público-alvo

### Usuário principal

Profissional técnico que precisa levantar, orçar e acompanhar serviços de obra:

* engenheiro eletricista;
* engenheiro civil;
* técnico de edificações;
* mestre de obras;
* construtor;
* empreiteiro;
* prestador de serviço especializado.

### Usuário secundário

Cliente ou contratante que receberá:

* proposta comercial;
* resumo financeiro;
* cronograma físico-financeiro;
* relatório de medição.

## 5. Escopo do MVP

O MVP deve ser simples, funcional e focado em cálculo.

### Incluído no MVP

1. Cadastro de obra.
2. Cadastro de ambientes.
3. Cadastro de serviços.
4. Lançamento de medidas por ambiente.
5. Cálculo automático de área, saldo, subtotal, BDI e total.
6. Desconto de vãos.
7. Resumo por categoria.
8. Resumo geral da obra.
9. Salvamento local no navegador.
10. Exportação simples dos dados em JSON ou CSV.

### Fora do MVP

1. Login.
2. Supabase.
3. PDF profissional.
4. Assinatura digital.
5. Controle financeiro completo.
6. Controle de estoque.
7. Cadastro de equipe.
8. Integração com AutoCAD/Revit/BIM.
9. Importação automática de planta.
10. Multiusuário.
11. Marketplace.

Esses itens entram somente depois de validar o motor de cálculo.

## 6. Referência da planilha original

A planilha de origem possui as seguintes abas principais:

| Aba                   | Função                                                              |
| --------------------- | ------------------------------------------------------------------- |
| GERAL                 | Cronograma físico-financeiro de mão de obra                         |
| REBOCO                | Levantamento de paredes, vãos, saldo, BDI e subtotal                |
| PISOS E REVESTIMENTOS | Cálculo de áreas de piso, contrapiso, regularização e piso          |
| ACABAMENTOS EM GERAL  | Itens unitários como portas, janelas e vasos                        |
| MUROS                 | Levantamento de muros, reboco de muro e valores por tipo de serviço |
| PINTURA               | Levantamento de pintura por paredes horizontais e verticais         |

A planilha deve servir como referência de regra de negócio, não como referência obrigatória de interface.

## 7. Entidades principais do sistema

### 7.1 Obra

Representa o orçamento ou levantamento de uma obra.

Campos sugeridos:

* ID;
* nome da obra;
* cliente;
* endereço;
* contrato;
* modalidade;
* responsável técnico;
* CPF/CNPJ do responsável, se aplicável;
* CREA/CAU/CFT, se aplicável;
* data do orçamento;
* BDI padrão;
* observações;
* status.

Status sugeridos:

* rascunho;
* em orçamento;
* enviado ao cliente;
* aprovado;
* recusado;
* em execução;
* finalizado.

### 7.2 Ambiente

Representa uma área física da obra.

Campos sugeridos:

* ID;
* obra ID;
* pavimento;
* nome do ambiente;
* descrição;
* ordem de exibição.

Exemplos:

* WC Piscina;
* Área Gourmet;
* Lavanderia;
* Living;
* Garagem;
* Suíte;
* Quarto 1;
* Quarto 2.

### 7.3 Serviço

Representa o tipo de serviço orçado.

Campos sugeridos:

* ID;
* nome;
* categoria;
* unidade;
* valor unitário padrão;
* tipo de cálculo;
* usa BDI;
* ativo/inativo.

Categorias iniciais:

* paredes e painéis;
* revestimentos;
* pisos;
* pintura;
* muros;
* acabamentos;
* instalações;
* complementação da obra.

Unidades possíveis:

* m²;
* m;
* unidade;
* verba;
* ponto;
* conjunto.

Tipos de cálculo:

* parede;
* piso;
* item unitário;
* muro;
* valor manual;
* comprimento linear.

### 7.4 Levantamento

Representa um lançamento de quantidade e valor.

Campos sugeridos:

* ID;
* obra ID;
* ambiente ID;
* serviço ID;
* descrição;
* comprimento;
* largura;
* altura;
* espessura;
* quantidade;
* área bruta;
* área descontada;
* saldo;
* unidade;
* valor unitário;
* subtotal;
* percentual BDI;
* valor BDI;
* total;
* observações.

### 7.5 Vão

Representa portas, janelas, portões ou qualquer abertura descontada de uma área.

Campos sugeridos:

* ID;
* levantamento ID;
* tipo;
* descrição;
* largura;
* altura;
* quantidade;
* área unitária;
* área total.

Tipos sugeridos:

* porta;
* janela;
* portão;
* vão livre;
* outro.

### 7.6 Cronograma de etapa

Representa as etapas de pagamento ou execução.

Campos sugeridos:

* ID;
* obra ID;
* nome;
* ordem;
* data prevista;
* descrição.

Exemplos:

* 1ª etapa;
* 2ª etapa;
* 3ª etapa;
* 4ª etapa;
* 5ª etapa.

### 7.7 Cronograma de item

Representa a distribuição de valores de um serviço entre etapas.

Campos sugeridos:

* ID;
* obra ID;
* levantamento ID;
* etapa ID;
* valor previsto;
* percentual previsto;
* valor executado;
* percentual executado.

## 8. Regras de cálculo

### 8.1 Área de parede

Usada para reboco, pintura, muros e serviços verticais.

```text
área_bruta = comprimento × altura
```

### 8.2 Área de piso

Usada para contrapiso, regularização, piso e revestimento horizontal.

```text
área_bruta = comprimento × largura
```

### 8.3 Área de item unitário

Usada para portas, janelas, vasos e acabamentos unitários.

```text
subtotal = quantidade × valor_unitário
```

### 8.4 Área de vão

```text
área_unitária_vão = largura × altura
área_total_vão = área_unitária_vão × quantidade
```

### 8.5 Área descontada

```text
área_descontada = soma de todos os vãos vinculados ao levantamento
```

### 8.6 Saldo

```text
saldo = área_bruta - área_descontada
```

Regra de segurança:

```text
se saldo < 0, bloquear cálculo e exibir erro
```

O sistema não deve aceitar saldo negativo silenciosamente.

### 8.7 Subtotal

Para serviços medidos por área:

```text
subtotal = saldo × valor_unitário
```

Para serviços unitários:

```text
subtotal = quantidade × valor_unitário
```

Para valor manual:

```text
subtotal = valor_informado
```

### 8.8 BDI

```text
valor_bdi = subtotal × percentual_bdi
```

Exemplo:

```text
subtotal = R$ 1.000,00
BDI = 35%
valor_bdi = R$ 350,00
total = R$ 1.350,00
```

### 8.9 Total

```text
total = subtotal + valor_bdi
```

### 8.10 Peso do serviço na obra

```text
peso_item = total_item / total_obra
```

### 8.11 Percentual executado do item

```text
percentual_executado_item = valor_executado_item / total_item
```

### 8.12 Percentual executado da obra

```text
percentual_executado_obra = valor_executado_total / total_obra
```

## 9. Validações obrigatórias

O sistema deve validar:

1. Comprimento não pode ser negativo.
2. Largura não pode ser negativa.
3. Altura não pode ser negativa.
4. Valor unitário não pode ser negativo.
5. BDI não pode ser negativo.
6. Área descontada não pode ser maior que área bruta.
7. Serviço precisa ter unidade definida.
8. Levantamento precisa estar vinculado a uma obra.
9. Levantamento precisa estar vinculado a um serviço.
10. Serviço por ambiente precisa ter pelo menos uma base de cálculo válida.

## 10. Telas do MVP

### 10.1 Dashboard

Objetivo: mostrar visão geral dos orçamentos.

Componentes:

* botão “Nova obra”;
* lista de obras recentes;
* valor total orçado;
* quantidade de obras em rascunho;
* quantidade de obras aprovadas.

No MVP local, essa tela pode ser simples.

### 10.2 Cadastro da obra

Campos:

* nome da obra;
* cliente;
* endereço;
* contrato;
* modalidade;
* responsável técnico;
* CREA;
* BDI padrão;
* observações.

Ações:

* salvar;
* duplicar obra;
* excluir obra;
* voltar para dashboard.

### 10.3 Ambientes

Campos:

* pavimento;
* nome do ambiente;
* observações.

Ações:

* adicionar ambiente;
* editar ambiente;
* excluir ambiente;
* ordenar ambientes.

### 10.4 Serviços

Campos:

* nome do serviço;
* categoria;
* unidade;
* valor unitário padrão;
* tipo de cálculo;
* usa BDI.

Ações:

* adicionar serviço;
* editar serviço;
* desativar serviço;
* restaurar serviço padrão.

### 10.5 Levantamento

Tela principal do sistema.

Colunas sugeridas:

| Campo          | Descrição                     |
| -------------- | ----------------------------- |
| Ambiente       | Onde o serviço será executado |
| Serviço        | Tipo de serviço               |
| C              | Comprimento                   |
| L              | Largura                       |
| H              | Altura                        |
| Qtd            | Quantidade manual             |
| Área bruta     | Calculada automaticamente     |
| Vãos           | Soma dos descontos            |
| Saldo          | Área líquida                  |
| Valor unitário | Valor por unidade             |
| Subtotal       | Antes do BDI                  |
| BDI            | Valor do BDI                  |
| Total          | Subtotal + BDI                |

Ações:

* adicionar item;
* editar item;
* excluir item;
* adicionar vãos;
* duplicar item;
* filtrar por ambiente;
* filtrar por categoria.

### 10.6 Vãos

Pode ser modal ou seção dentro do item de levantamento.

Campos:

* tipo;
* descrição;
* largura;
* altura;
* quantidade;
* área calculada.

Ação importante:

* atualizar automaticamente o saldo do levantamento.

### 10.7 Resumo

Resumo por categoria:

| Categoria   | Subtotal | BDI | Total |
| ----------- | -------: | --: | ----: |
| Reboco      |       R$ |  R$ |    R$ |
| Pisos       |       R$ |  R$ |    R$ |
| Pintura     |       R$ |  R$ |    R$ |
| Muros       |       R$ |  R$ |    R$ |
| Acabamentos |       R$ |  R$ |    R$ |
| Total geral |       R$ |  R$ |    R$ |

### 10.8 Cronograma físico-financeiro

Não precisa entrar na primeira versão se isso atrasar o MVP.

Quando entrar, deve permitir distribuir valores por etapa.

Colunas sugeridas:

| Serviço | Valor total | Peso | 1ª etapa | 2ª etapa | 3ª etapa | 4ª etapa | 5ª etapa | % executado |
| ------- | ----------: | ---: | -------: | -------: | -------: | -------: | -------: | ----------: |

## 11. Estrutura técnica sugerida

### 11.1 Primeira versão local

Stack sugerida:

* Next.js;
* TypeScript;
* Tailwind CSS;
* localStorage;
* motor de cálculo em TypeScript puro.

Sem banco de dados no início.

### 11.2 Estrutura de pastas sugerida

```text
app/
  page.tsx
  obras/
    page.tsx
  obras/[id]/
    page.tsx
components/
  obras/
  ambientes/
  servicos/
  levantamento/
  resumo/
lib/
  calculos/
    area.ts
    bdi.ts
    cronograma.ts
    levantamento.ts
  storage/
    obrasStorage.ts
  tipos/
    obra.ts
    ambiente.ts
    servico.ts
    levantamento.ts
```

### 11.3 Motor de cálculo

O motor de cálculo deve ficar fora dos componentes visuais.

Funções sugeridas:

```text
calcularAreaParede(comprimento, altura)
calcularAreaPiso(comprimento, largura)
calcularAreaVao(largura, altura, quantidade)
calcularAreaDescontada(vaos)
calcularSaldo(areaBruta, areaDescontada)
calcularSubtotal(saldo, valorUnitario)
calcularBDI(subtotal, percentualBDI)
calcularTotal(subtotal, valorBDI)
calcularResumoPorCategoria(levantamentos)
calcularTotalObra(levantamentos)
calcularPesoItem(totalItem, totalObra)
```

## 12. Tipos de cálculo

### 12.1 Parede

Campos necessários:

* comprimento;
* altura;
* vãos opcionais;
* valor unitário.

Cálculo:

```text
área = comprimento × altura
saldo = área - vãos
total = saldo × valor_unitário + BDI
```

### 12.2 Piso

Campos necessários:

* comprimento;
* largura;
* valor unitário.

Cálculo:

```text
área = comprimento × largura
total = área × valor_unitário + BDI
```

### 12.3 Item unitário

Campos necessários:

* quantidade;
* valor unitário.

Cálculo:

```text
total = quantidade × valor_unitário + BDI
```

### 12.4 Valor manual

Campos necessários:

* valor informado;
* BDI opcional.

Cálculo:

```text
total = valor_informado + BDI
```

### 12.5 Comprimento linear

Campos necessários:

* comprimento;
* valor por metro.

Cálculo:

```text
total = comprimento × valor_unitário + BDI
```

## 13. Dados padrão iniciais

Serviços padrão sugeridos:

| Categoria      | Serviço               | Unidade | Tipo de cálculo    |
| -------------- | --------------------- | ------: | ------------------ |
| Reboco         | Reboco interno        |      m² | parede             |
| Reboco         | Reboco externo        |      m² | parede             |
| Pisos          | Contrapiso            |      m² | piso               |
| Pisos          | Regularização         |      m² | piso               |
| Pisos          | Piso                  |      m² | piso               |
| Pisos          | Rodapé                |       m | comprimento linear |
| Revestimentos  | Revestimento parede   |      m² | parede             |
| Pintura        | Pintura parede        |      m² | parede             |
| Muros          | Elevação de muro      |      m² | parede             |
| Muros          | Reboco de muro        |      m² | parede             |
| Acabamentos    | Porta                 |      un | item unitário      |
| Acabamentos    | Janela                |      un | item unitário      |
| Acabamentos    | Vaso sanitário        |      un | item unitário      |
| Instalações    | Instalações elétricas |   verba | valor manual       |
| Instalações    | Hidrossanitárias      |   verba | valor manual       |
| Complementação | Limpeza final         |   verba | valor manual       |

## 14. Relatórios futuros

Relatórios previstos após o MVP:

1. Proposta comercial.
2. Levantamento detalhado.
3. Resumo financeiro.
4. Cronograma físico-financeiro.
5. Medição por etapa.
6. Relatório para assinatura do cliente.
7. Exportação em PDF.
8. Exportação em XLSX.

## 15. Roadmap

### Fase 1 — MVP local

Objetivo: validar cálculo e fluxo.

Entregas:

* cadastro de obra;
* cadastro de ambientes;
* cadastro de serviços;
* levantamento;
* vãos;
* resumo;
* localStorage.

### Fase 2 — Persistência real

Objetivo: transformar em SaaS básico.

Entregas:

* Supabase;
* autenticação;
* salvar obras por usuário;
* histórico de obras;
* duplicar orçamento.

### Fase 3 — Relatórios

Objetivo: gerar entrega profissional.

Entregas:

* PDF;
* proposta comercial;
* cronograma físico-financeiro;
* relatório de medição.

### Fase 4 — Produto comercial

Objetivo: vender como ferramenta.

Entregas:

* planos;
* limite de obras por plano;
* marca do usuário;
* exportações;
* modelos de orçamento;
* backup.

## 16. Premissas do projeto

1. O cálculo precisa ser mais confiável que a planilha.
2. O sistema deve impedir lançamentos incoerentes.
3. O usuário deve conseguir revisar tudo antes de gerar relatório.
4. Os valores unitários devem ser editáveis.
5. O BDI deve ser configurável por obra e, se necessário, por item.
6. A planilha original é referência, não prisão.
7. O MVP deve ser pequeno.
8. O motor de cálculo deve ser separado da interface.
9. O projeto deve nascer separado do Franklin.
10. O cronograma físico-financeiro deve entrar depois da base de levantamento estar sólida.

## 17. Riscos

### Risco 1 — Tentar fazer um ERP completo

Mitigação: manter foco em levantamento e orçamento.

### Risco 2 — Copiar a planilha literalmente

Mitigação: transformar a lógica em entidades e regras.

### Risco 3 — Fórmulas espalhadas na interface

Mitigação: criar motor de cálculo separado.

### Risco 4 — Banco de dados cedo demais

Mitigação: validar primeiro com localStorage.

### Risco 5 — PDF antes do cálculo estar confiável

Mitigação: PDF somente depois do resumo estar correto.

## 18. Critério de sucesso do MVP

O MVP será considerado válido quando o usuário conseguir:

1. cadastrar uma obra;
2. cadastrar ambientes;
3. lançar serviços com medidas;
4. descontar vãos;
5. calcular totais automaticamente;
6. visualizar resumo por categoria;
7. visualizar total geral da obra;
8. fechar um orçamento básico sem usar a planilha.

## 19. Próximo documento recomendado

Após este documento-base, o próximo documento deve ser:

**Especificação Técnica do MVP**

Esse documento deve detalhar:

* tipos TypeScript;
* funções do motor de cálculo;
* estrutura dos componentes;
* formato do localStorage;
* layout das telas;
* massa de dados inicial;
* testes mínimos do motor de cálculo.
