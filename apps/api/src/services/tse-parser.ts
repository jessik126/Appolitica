import { createReadStream } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { parse } from 'csv-parse';

export interface CandidatoNormalizado {
  externa_id: string;
  casa: 'TSE_2026';
  nome: string;
  nome_urna: string;
  cargo: string;
  uf: string;
  partido: string;
  genero: 'feminino' | 'masculino' | 'nao_binario' | 'outro';
  fonte: string;
  ocupacao?: string;
}

const GENERO_MAP: Record<string, string> = {
  'MASCULINO': 'masculino',
  'FEMININO': 'feminino',
};

export function normalizeGenero(value?: string): string {
  return GENERO_MAP[value?.toUpperCase()] || 'outro';
}

export function normalizeCandidatoTSE(row: any): CandidatoNormalizado {
  return {
    externa_id: `tse:${row.uf_candidatura}:${row.sequencial_candidato}`,
    casa: 'TSE_2026',
    nome: row.nome_candidato || '',
    nome_urna: row.nome_urna_candidato || '',
    cargo: row.descricao_cargo?.toLowerCase() || '',
    uf: row.uf_candidatura || '',
    partido: row.sigla_partido || '',
    genero: normalizeGenero(row.descricao_sexo),
    fonte: 'tse_2026',
    ocupacao: row.descricao_ocupacao,
  };
}

export async function parseTseCsvFolder(folderPath: string): Promise<CandidatoNormalizado[]> {
  const files = await readdir(folderPath);
  const csvFiles = files.filter(f => f.endsWith('.csv')).sort();
  let allCandidatos: CandidatoNormalizado[] = [];

  for (const file of csvFiles) {
    console.log(`  📄 ${file}`);
    const filePath = join(folderPath, file);
    const candidatos = await new Promise<CandidatoNormalizado[]>((resolve, reject) => {
      const stream = createReadStream(filePath, { encoding: 'latin1' });
      const results: CandidatoNormalizado[] = [];
      const parser = stream.pipe(parse({ delimiter: ';', columns: true }));

      parser.on('data', (row) => {
        try {
          results.push(normalizeCandidatoTSE(row));
        } catch (e) {}
      });
      parser.on('end', () => resolve(results));
      parser.on('error', reject);
      stream.on('error', reject);
    });
    
    console.log(`    ✓ ${candidatos.length}`);
    allCandidatos = allCandidatos.concat(candidatos);
  }

  return allCandidatos;
}

export function analyzeStats(candidatos: CandidatoNormalizado[]): void {
  console.log(`  Total: ${candidatos.length}`);
  const generoMap = new Map();
  candidatos.forEach(c => {
    generoMap.set(c.genero, (generoMap.get(c.genero) || 0) + 1);
  });
  console.log(`  Gênero:`);
  Array.from(generoMap).forEach(([g, c]) => console.log(`    ${g}: ${c}`));
}
