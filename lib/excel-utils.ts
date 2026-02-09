// Utilitaires pour l'import/export Excel
import type { PlayerBox } from "./game-state";
import { characters } from "./characters";

// Export box vers Excel (CSV format compatible Excel)
export function exportBoxToExcel(playerName: string, box: PlayerBox[]): void {
  // En-têtes
  const headers = ["Nom du personnage", "ID", "Possédé", "Séquences"];
  
  // Données
  const rows = box.map((item) => {
    const char = characters.find((c) => c.id === item.characterId);
    return [
      char?.name || item.characterId,
      item.characterId,
      item.owned ? "Oui" : "Non",
      item.sequence.toString()
    ];
  });
  
  // Créer le contenu CSV
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";"))
  ].join("\n");
  
  // Créer le blob avec BOM pour Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Télécharger
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `box_${playerName.replace(/\s+/g, "_")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import box depuis Excel/CSV
export function importBoxFromExcel(file: File): Promise<PlayerBox[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        
        // Ignorer l'en-tête
        const dataLines = lines.slice(1);
        
        const box: PlayerBox[] = dataLines.map((line) => {
          const cells = line.split(/[;,\t]/);
          const characterId = cells[1]?.trim() || "";
          const owned = cells[2]?.trim().toLowerCase() === "oui" || cells[2]?.trim() === "1" || cells[2]?.trim().toLowerCase() === "yes";
          const sequence = parseInt(cells[3]?.trim() || "0", 10);
          
          return {
            characterId,
            owned,
            sequence: isNaN(sequence) ? 0 : sequence
          };
        }).filter((item) => {
          // Vérifier que le personnage existe
          return characters.some((c) => c.id === item.characterId);
        });
        
        resolve(box);
      } catch (error) {
        reject(new Error("Erreur lors de la lecture du fichier"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };
    
    reader.readAsText(file);
  });
}

// Exporter en XLSX (format natif Excel) - nécessite une bibliothèque externe
// Pour une solution simple, on utilise CSV qui est compatible Excel
export function downloadTemplate(): void {
  const headers = ["Nom du personnage", "ID", "Possédé", "Séquences"];
  
  const rows = characters.map((char) => [
    char.name,
    char.id,
    "Non",
    "0"
  ]);
  
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";"))
  ].join("\n");
  
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "template_box.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
