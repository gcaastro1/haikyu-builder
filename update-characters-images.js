import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const charactersJsonPath = path.join(__dirname, 'public', 'mock', 'characters.json');
const imagesDir = path.join(__dirname, 'public', 'images', 'characters');

const characters = JSON.parse(fs.readFileSync(charactersJsonPath, 'utf-8'));

const availableFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
const availableFilesSet = new Set(availableFiles);

console.log(`📁 Encontrados ${availableFiles.length} arquivos PNG\n`);

let updated = 0;
let notFound = 0;
let unchanged = 0;

characters.forEach((char, index) => {
  if (!char.image_url) {
    console.log(`⚠️  Character ${index + 1} (ID ${char.id}) - sem image_url`);
    return;
  }

  const urlParts = char.image_url.split('/');
  const imageName = urlParts[urlParts.length - 1];

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

fs.writeFileSync(charactersJsonPath, JSON.stringify(characters, null, 2), 'utf-8');

console.log(`\n📊 Resumo:`);
console.log(`   ✅ Atualizados: ${updated}`);
console.log(`   ⚠️  Já estavam corretos: ${unchanged}`);
console.log(`   ❌ Não encontrados: ${notFound}`);
console.log(`   📝 Total de characters: ${characters.length}`);
console.log(`\n✨ Arquivo atualizado em: ${charactersJsonPath}`);
