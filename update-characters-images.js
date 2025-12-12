import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho dos arquivos
const charactersJsonPath = path.join(__dirname, 'public', 'mock', 'characters.json');
const imagesDir = path.join(__dirname, 'public', 'images', 'characters');

// Ler o JSON
const characters = JSON.parse(fs.readFileSync(charactersJsonPath, 'utf-8'));

// Ler nomes de arquivos disponíveis
const availableFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
const availableFilesSet = new Set(availableFiles);

console.log(`📁 Encontrados ${availableFiles.length} arquivos PNG\n`);

// Processar cada character
let updated = 0;
let notFound = 0;
let unchanged = 0;

characters.forEach((char, index) => {
  if (!char.image_url) {
    console.log(`⚠️  Character ${index + 1} (ID ${char.id}) - sem image_url`);
    return;
  }

  // Extrair nome do arquivo da URL
  const urlParts = char.image_url.split('/');
  const imageName = urlParts[urlParts.length - 1];

  // Verificar se arquivo existe localmente
  if (availableFilesSet.has(imageName)) {
    const newUrl = `/images/characters/${imageName}`;
    if (char.image_url !== newUrl) {
      console.log(`✅ ID ${char.id} (${char.name}) - Atualizado`);
      console.log(`   De: ${char.image_url}`);
      console.log(`   Para: ${newUrl}\n`);
      char.image_url = newUrl;
      updated++;
    } else {
      unchanged++;
    }
  } else {
    console.log(`❌ ID ${char.id} (${char.name}) - Arquivo não encontrado: ${imageName}`);
    notFound++;
  }
});

// Salvar JSON atualizado
fs.writeFileSync(charactersJsonPath, JSON.stringify(characters, null, 2), 'utf-8');

console.log(`\n📊 Resumo:`);
console.log(`   ✅ Atualizados: ${updated}`);
console.log(`   ⚠️  Já estavam corretos: ${unchanged}`);
console.log(`   ❌ Não encontrados: ${notFound}`);
console.log(`   📝 Total de characters: ${characters.length}`);
console.log(`\n✨ Arquivo atualizado em: ${charactersJsonPath}`);
