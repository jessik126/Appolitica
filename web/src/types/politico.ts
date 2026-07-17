export type CargoEleicao2026 =
  | 'presidente'
  | 'governador'
  | 'senador'
  | 'deputado_federal'
  | 'deputado_estadual'

export type TipoAcao = 'votacao' | 'projeto' | 'discurso' | 'outro'

export interface ContatosPolitico {
  email?: string
  site?: string
  instagram?: string
  twitter?: string
}

export interface AcaoPolitico {
  data: string
  tipo: TipoAcao
  titulo: string
  descricao: string
  fonte?: string
}

export interface Politico {
  id: string
  nome: string
  nomeUrna: string
  cargo: CargoEleicao2026
  partido: string
  uf: string
  foto?: string
  contatos: ContatosPolitico
  resumo: string
  acoes: AcaoPolitico[]
}

export interface PoliticosMetadata {
  eleicao: number
  ultimaAtualizacao: string
  fonte: string
}

export interface PoliticosDataset {
  metadata: PoliticosMetadata
  politicos: Politico[]
}

export interface MeuRepresentante {
  politicoId: string
  votadoEm: string
  nota?: string
}

export const CARGO_LABELS: Record<CargoEleicao2026, string> = {
  presidente: 'Presidente',
  governador: 'Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual',
}

export const TIPO_ACAO_LABELS: Record<TipoAcao, string> = {
  votacao: 'Votação',
  projeto: 'Projeto de lei',
  discurso: 'Discurso',
  outro: 'Outro',
}

export const STORAGE_KEY = 'appolitica_meus_representantes_v1'
