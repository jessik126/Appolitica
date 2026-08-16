import { readFile, writeFile } from 'fs/promises';

const METADATA_FILE = 'docs/tse-metadata.json';

interface Metadata {
  lastCheckDate: string;
  lastVersionDate: string;
}

async function readLocalMetadata(): Promise<Metadata> {
  try {
    const content = await readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      lastCheckDate: new Date(0).toISOString(),
      lastVersionDate: '01/01/2000',
    };
  }
}

async function writeLocalMetadata(metadata: Metadata): Promise<void> {
  await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

async function fetchTseDateInfo(): Promise<string | null> {
  try {
    const response = await fetch('https://dadosabertos.tse.jus.br/dataset/candidatos-2026');
    const html = await response.text();
    const dateMatch = html.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    return dateMatch ? dateMatch[1] : null;
  } catch (error) {
    console.error('❌ Failed to fetch TSE page:', error);
    return null;
  }
}

async function main() {
  console.log('🔍 Checking TSE for updates...');
  console.log('📍 Dataset: https://dadosabertos.tse.jus.br/dataset/candidatos-2026\n');

  const remoteDate = await fetchTseDateInfo();
  if (!remoteDate) {
    console.error('❌ Could not fetch TSE date');
    process.exit(1);
  }

  const metadata = await readLocalMetadata();
  console.log(`📅 Remote: ${remoteDate}`);
  console.log(`📅 Local:  ${metadata.lastVersionDate}\n`);

  if (remoteDate === metadata.lastVersionDate) {
    console.log('✅ No updates. Dataset is current.');
    process.exit(0);
  }

  console.log('🆕 Dataset has been updated!');
  metadata.lastCheckDate = new Date().toISOString();
  metadata.lastVersionDate = remoteDate;
  await writeLocalMetadata(metadata);

  console.log(`🔔 Update available: ${remoteDate}`);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
