export type CasaLegislativa = 'CD' | 'SF'

export type CargoEleicao2026 =
  | 'presidente'
  | 'governador'
  | 'senador'
  | 'deputado_federal'
  | 'deputado_estadual'

export type TipoAcao = 'votacao' | 'projeto' | 'discurso' | 'evento' | 'outro'

export type FontePolitico = 'camara' | 'senado' | 'mock'

export interface ContatosPolitico {
  email?: string
  site?: string
  instagram?: string
  twitter?: string
}

export interface Despesa {
  data: string
  tipo: string
  descricao: string
  valor: number
  fornecedor?: string
  fonte?: string
}

export interface DespesasResumo {
  ano: number
  total: number
  fonte: 'camara' | 'portal'
  label: string
  itens: Despesa[]
}

export interface PortalStatus {
  configured: boolean
  ok: boolean
  message: string
}

export interface Acao {
  data: string
  tipo: TipoAcao
  titulo: string
  descricao: string
  fonte?: string
}

export interface Mandatario {
  id: string
  casa?: CasaLegislativa
  externalId?: string
  nome: string
  nomeUrna: string
  cargo: CargoEleicao2026
  partido: string
  uf: string
  foto?: string
  contatos: ContatosPolitico
  resumo: string
  fonte: FontePolitico
}

/** Unified catalog item for the web UI (mandatário + optional cached actions). */
export interface Politico extends Mandatario {
  acoes: Acao[]
}

export interface MeuAcompanhamento {
  politicoId: string
  seguidoEm: string
  nota?: string
}

/** @deprecated Use MeuAcompanhamento — kept for localStorage migration. */
export interface MeuRepresentante {
  politicoId: string
  votadoEm: string
  nota?: string
}

export interface CandidatoCola {
  cargo: CargoEleicao2026
  politicoId: string
  nome: string
  nomeUrna: string
  partido: string
  uf: string
}

export type MinhaCola = Partial<Record<CargoEleicao2026, CandidatoCola>>

export interface PoliticosMetadata {
  eleicao: number
  ultimaAtualizacao: string
  fonte: string
}

export interface PoliticosDataset {
  metadata: PoliticosMetadata
  politicos: Politico[]
}

export interface PoliticosListResponse {
  metadata: PoliticosMetadata
  politicos: Politico[]
  total: number
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
  evento: 'Evento',
  outro: 'Outro',
}

export const COLA_CARGOS: CargoEleicao2026[] = [
  'presidente',
  'governador',
  'senador',
  'deputado_federal',
  'deputado_estadual',
]

export const STORAGE_KEY_ACOMPANHAMENTO = 'appolitica_acompanhamento_v2'
export const STORAGE_KEY_COLA = 'appolitica_cola_v1'
export const STORAGE_KEY_UF = 'appolitica_uf_v1'
/** @deprecated migrated to STORAGE_KEY_ACOMPANHAMENTO */
export const STORAGE_KEY = 'appolitica_meus_representantes_v1'

export function buildPoliticoId(casa: CasaLegislativa, externalId: string): string {
  return `${casa}:${externalId}`
}

export function parsePoliticoId(id: string): { casa: CasaLegislativa; externalId: string } | null {
  const match = id.match(/^(CD|SF):(.+)$/)
  if (!match) return null
  return { casa: match[1] as CasaLegislativa, externalId: match[2] }
}
