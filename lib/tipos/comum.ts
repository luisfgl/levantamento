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
