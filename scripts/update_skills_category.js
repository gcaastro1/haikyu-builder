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
    let category = "Passive"; 

    const desc = (skill.description || "").toLowerCase().trim();
    const type = skill.type || "Normal";

  if (type === "Special") {
      category = "Active";
    } else {
   
      if (
        desc.includes("realiza") || 
        desc.includes("executa") || 
        desc.startsWith("consome") ||
        desc.includes("saque em suspensão")  
      ) {
        category = "Active";
      }
      
   
      if (
        desc.startsWith("aumenta") ||
        desc.startsWith("quando") ||
        desc.startsWith("enquanto") ||
        desc.startsWith("se ") ||
        desc.startsWith("no encerramento") ||
        desc.startsWith("no estado") ||
        desc.startsWith("o [") 
      ) {
        category = "Passive";
      }
      
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
