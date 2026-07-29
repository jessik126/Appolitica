import type { Acao, TipoAcao } from '@appolitica/types'

const VOTO_LABELS: Record<string, string> = {
  Sim: 'a favor',
  Não: 'contra',
  Abstenção: 'com abstenção',
  Obstrução: 'com obstrução',
  'Art. 17': 'conforme orientação do partido',
}

export function formatVotacaoAcao(
  data: string,
  voto: string,
  descricao: string,
  fonteUrl?: string,
): Acao {
  const posicao = VOTO_LABELS[voto] ?? voto.toLowerCase()
  const resumo = truncate(descricao, 120)
  return {
    data: data.slice(0, 10),
    tipo: 'votacao',
    titulo: `Votou ${posicao}`,
    descricao: resumo || 'Participou de votação no plenário da Câmara.',
    fonte: fonteUrl,
  }
}

export function formatProjetoAcao(
  data: string,
  siglaTipo: string,
  numero: number,
  ano: number,
  ementa: string,
  fonteUrl?: string,
): Acao {
  const ident = `${siglaTipo} ${numero}/${ano}`
  return {
    data: data.slice(0, 10),
    tipo: 'projeto',
    titulo: `Autoria de ${ident}`,
    descricao: truncate(ementa, 200) || `Proposição ${ident} registrada na Câmara.`,
    fonte: fonteUrl,
  }
}

export function formatSenadoVotacaoAcao(
  data: string,
  voto: string,
  materia: string,
  fonteUrl?: string,
): Acao {
  return {
    data: data.slice(0, 10),
    tipo: 'votacao',
    titulo: `Votou ${voto.toLowerCase()} no Senado`,
    descricao: truncate(materia, 200) || 'Participou de votação no Senado Federal.',
    fonte: fonteUrl,
  }
}

export function formatSenadoProcessoAcao(
  data: string,
  tipo: TipoAcao,
  titulo: string,
  descricao: string,
  fonteUrl?: string,
): Acao {
  return {
    data: data.slice(0, 10),
    tipo,
    titulo,
    descricao: truncate(descricao, 200),
    fonte: fonteUrl,
  }
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1)}…`
}
