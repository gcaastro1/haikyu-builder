import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skillsPath = path.join(__dirname, '../public/mock/skills.json');

try {
  const rawData = fs.readFileSync(skillsPath, 'utf-8');
  const skills = JSON.parse(rawData);

  const updatedSkills = skills.map(skill => {
    let category = "Passive"; // Default to Passive

    const desc = (skill.description || "").toLowerCase().trim();
    const type = skill.type || "Normal";

    // Heuristics
    // 1. Special skills are usually Active (Ultimate moves)
    if (type === "Special") {
      category = "Active";
    } else {
      // 2. Normal skills: check for action verbs
      // "realiza", "executa", "consome", "dispara"
      // Check if the description implies an action the player takes explicitly vs a passive effect
      
      if (
        desc.includes("realiza") || 
        desc.includes("executa") || 
        desc.startsWith("consome") ||
        desc.includes("saque em suspensão") // Often "Realiza um Saque..."
      ) {
        category = "Active";
      }
      
      // Counter-heuristics for Passive (overrides action if context implies condition?)
      // Actually, "Realiza uma recepção com X% de poder" is an active skill in this game context.
      // "Aumenta..." is passive.
      
      if (
        desc.startsWith("aumenta") ||
        desc.startsWith("quando") ||
        desc.startsWith("enquanto") ||
        desc.startsWith("se ") ||
        desc.startsWith("no encerramento") ||
        desc.startsWith("no estado") ||
        desc.startsWith("o [") // "O [Bloqueio] de X aumenta..."
      ) {
        category = "Passive";
      }
      
      // Specific checks for ambiguity
      // "RYUNOSUKE TANAKA realiza uma Recepção..." -> Active?
      // "ESPÍRITO OBSTINADO: RYUNOSUKE TANAKA realiza uma Recepção..." -> This sounds like a skill you activate or that triggers on specific action (Active).
      // "PAIXÃO ARDENTE: Aumenta a potência..." -> Passive.
    }

    return {
      ...skill,
      category: category
    };
  });

  fs.writeFileSync(skillsPath, JSON.stringify(updatedSkills, null, 2), 'utf-8');
  console.log(`Successfully updated ${updatedSkills.length} skills with categories.`);

} catch (error) {
  console.error('Error updating skills:', error);
}
