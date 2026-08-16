import { getDb } from '../db/client.ts';
import { mandatarios } from '../db/schema.ts';
import { parseTseCsvFolder, analyzeStats, type CandidatoNormalizado } from '../services/tse-parser.ts';

async function main() {
  const folderPath = process.argv[2];
  
  if (!folderPath) {
    console.error('❌ Usage: tsx ingest-tse.ts <folder-path>');
    console.error('Example: tsx ingest-tse.ts docs/consulta_cand_2026');
    process.exit(1);
  }

  console.log('🗳️  TSE Ingestion started...');
  console.log(`📂 Folder: ${folderPath}\n`);

  let candidatos: CandidatoNormalizado[] = [];
  try {
    candidatos = await parseTseCsvFolder(folderPath);
  } catch (error) {
    console.error('❌ Parse error:', error);
    process.exit(1);
  }

  if (candidatos.length === 0) {
    console.error('❌ No candidates found in folder');
    process.exit(1);
  }

  console.log('📊 Parse stats:');
  const fileStats = new Map<string, number>();
  candidatos.forEach(c => {
    fileStats.set(c._arquivo || 'unknown', (fileStats.get(c._arquivo || 'unknown') || 0) + 1);
  });
  for (const [file, count] of Array.from(fileStats).sort()) {
    console.log(`  ${file}: ${count}`);
  }

  console.log('\n📈 Analysis:');
  analyzeStats(candidatos);

  const db = getDb();

  console.log('\n💾 Upserting ' + candidatos.length + ' records...');
  const batchSize = 100;
  let upserted = 0;

  try {
    for (let i = 0; i < candidatos.length; i += batchSize) {
      const batch = candidatos.slice(i, i + batchSize);
      
      try {
        for (const c of batch) {
          await db
            .insert(mandatarios)
            .values({
              externa_id: c.externa_id,
              casa: c.casa,
              nome: c.nome,
              nome_urna: c.nome_urna,
              cargo: c.cargo,
              uf: c.uf,
              partido: c.partido,
              genero: c.genero,
              fonte: c.fonte,
              updated_at: new Date(),
              ...(c.ocupacao && { ocupacao: c.ocupacao }),
              ...(c.grau_instrucao && { grau_instrucao: c.grau_instrucao }),
              ...(c.cor_raca && { cor_raca: c.cor_raca }),
              ...(c.data_nascimento && { data_nascimento: c.data_nascimento }),
              ...(c.status_candidatura && { status_candidatura: c.status_candidatura }),
            } as any)
            .onConflictDoUpdate({
              target: [mandatarios.externa_id],
              set: {
                nome: c.nome,
                nome_urna: c.nome_urna,
                cargo: c.cargo,
                uf: c.uf,
                partido: c.partido,
                genero: c.genero,
                fonte: c.fonte,
                updated_at: new Date(),
              },
            });
        }
      } catch (innerError: any) {
        if (innerError.message?.includes('column') && innerError.message?.includes('does not exist')) {
          for (const c of batch) {
            await db
              .insert(mandatarios)
              .values({
                externa_id: c.externa_id,
                casa: c.casa,
                nome: c.nome,
                nome_urna: c.nome_urna,
                cargo: c.cargo,
                uf: c.uf,
                partido: c.partido,
                genero: c.genero,
                fonte: c.fonte,
                updated_at: new Date(),
              })
              .onConflictDoUpdate({
                target: [mandatarios.externa_id],
                set: {
                  nome: c.nome,
                  nome_urna: c.nome_urna,
                  cargo: c.cargo,
                  uf: c.uf,
                  partido: c.partido,
                  genero: c.genero,
                  fonte: c.fonte,
                  updated_at: new Date(),
                },
              });
          }
        } else {
          throw innerError;
        }
      }

      upserted += batch.length;
      if (upserted % (batchSize * 5) === 0 || upserted === candidatos.length) {
        console.log(`  ✓ ${upserted}/${candidatos.length}`);
      }
    }

    console.log('\n✅ TSE Ingestion complete!');
    console.log(`📊 Total upserted: ${candidatos.length} candidates`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Upsert error:', error);
    process.exit(1);
  }
}

main();
