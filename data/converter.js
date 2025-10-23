// converter.js
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Caminho para o arquivo original
const inputPath = path.resolve("characters.ts");
const outputPath = path.resolve("characters_converted.json");
const abilitiesPath = path.resolve("abilities.json");
const bondsPath = path.resolve("bonds.json");

// Importa dinamicamente (ajuste conforme o formato do seu arquivo)
import charactersModule from "./characters.ts";
const characters = charactersModule.default || charactersModule.characters || [];

const parseRarity = (name) => {
  const rarities = ["UR", "SSR", "SR", "SP"];
  const found = rarities.find((r) => name.includes(r));
  return found || null;
};

const parseStyles = (symbols = []) => {
  return symbols.map((sym) => {
    const base = sym.split("/").pop().replace(".png", "");
    return base.charAt(0).toUpperCase() + base.slice(1);
  });
};

const result = [];
const abilities = [];
const bonds = [];

for (const c of characters) {
  const id = uuidv4();

  const rarity = parseRarity(c.nome);
  const cleanName = c.nome.replace(/\s?(UR|SSR|SR|SP)/, "").trim();

  const character = {
    id,
    name: cleanName,
    position: c.funcao,
    rarity,
    school: c.School,
    styles: parseStyles(c.symbols),
    serve: c.Stats?.Serve || 0,
    attack: c.Stats?.Spike || 0,
    set: c.Stats?.Set || 0,
    receive: c.Stats?.Receive || 0,
    block: c.Stats?.Block || 0,
    defense: c.Stats?.Save || 0,
    image_url: null, // você adiciona manualmente depois
  };

  result.push(character);

  // Vínculos
  if (Array.isArray(c.vinculo)) {
    for (const v of c.vinculo) {
      bonds.push({
        id: uuidv4(),
        character_id: id,
        name: v,
      });
    }
  }

  // Habilidades
  if (Array.isArray(c.habilidades)) {
    for (const h of c.habilidades) {
      abilities.push({
        id: uuidv4(),
        character_id: id,
        name: h.nome,
        description: h.descricao,
      });
    }
  }
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
fs.writeFileSync(abilitiesPath, JSON.stringify(abilities, null, 2));
fs.writeFileSync(bondsPath, JSON.stringify(bonds, null, 2));

console.log("✅ Conversão concluída!");
console.log(`- Personagens: ${result.length}`);
console.log(`- Habilidades: ${abilities.length}`);
console.log(`- Vínculos: ${bonds.length}`);
