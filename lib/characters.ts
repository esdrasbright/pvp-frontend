 // Configuration des personnages Wuthering Waves
// Pour ajouter des images, modifiez le champ "image" avec l'URL de l'image
// Format d'image recommandé: PNG ou WebP, taille: 256x256px ou 512x512px

export type Element = "Glacio" | "Fusion" | "Electro" | "Aero" | "Spectro" | "Havoc";
export type Rarity = 4 | 5;

export interface Character {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  maxSequence: number;
  // URL de l'image du personnage - remplacez par vos propres URLs
  // Laissez vide pour utiliser l'affichage par défaut (initiales)
  image: string;
  // Points par mode de jeu
  points: {
    whiwa: number[];    // Points par séquence [S0, S1, S2, S3, S4, S5, S6]
    toa: number[];      // Points par séquence [S0, S1, S2, S3, S4, S5, S6]
  };
}

// ============================================================
// CONFIGURATION DES IMAGES DES PERSONNAGES
// ============================================================
// Instructions:
// 1. Placez vos images dans le dossier /public/characters/
// 2. Nommez les fichiers avec l'ID du personnage (ex: rover-spectro.png)
// 3. Format recommandé: PNG avec fond transparent
// 4. Taille recommandée: 256x256px minimum
// 5. Ou utilisez des URLs externes directes
// ============================================================

export const characters: Character[] = [
  // 5 étoiles - Spectro
  {
    id: "rover",
    name: "Rover",
    element: "Spectro",
    rarity: 5,
    maxSequence: 6,
    image: "MC_Female.png", // Exemple: "/characters/rover-spectro.png" ou URL externe
    points: { whiwa: [10, 12, 14, 16, 18, 20, 22], toa: [12, 14, 16, 18, 20, 22, 24] }
  },
  // 5 étoiles - Glacio
  {
    id: "lingyang",
    name: "Lingyang",
    element: "Glacio",
    rarity: 5,
    maxSequence: 6,
    image: "Wuthering-Waves-Lingyang.png",
    points: { whiwa: [8, 10, 12, 14, 16, 18, 20], toa: [10, 12, 14, 16, 18, 20, 22] }
  },
  {
    id: "zhezhi",
    name: "Zhezhi",
    element: "Glacio",
    rarity: 5,
    maxSequence: 6,
    image: "Zhezhi_icon.png",
    points: { whiwa: [12, 14, 16, 18, 20, 22, 24], toa: [14, 16, 18, 20, 22, 24, 26] }
  },
  {
    id: "carlotta",
    name: "Carlotta",
    element: "Glacio",
    rarity: 5,
    maxSequence: 6,
    image: "Carlotta_icon.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  // 5 étoiles - Fusion
  {
    id: "changli",
    name: "Changli",
    element: "Fusion",
    rarity: 5,
    maxSequence: 6,
    image: "Changli_icon.png",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "encore",
    name: "Encore",
    element: "Fusion",
    rarity: 5,
    maxSequence: 6,
    image: "Wuthering-Waves-Anke.png",
    points: { whiwa: [12, 14, 16, 18, 20, 22, 24], toa: [14, 16, 18, 20, 22, 24, 26] }
  },
  // 5 étoiles - Electro
  {
    id: "calcharo",
    name: "Calcharo",
    element: "Electro",
    rarity: 5,
    maxSequence: 6,
    image: "Wuthering-Waves-Calcharo.png",
    points: { whiwa: [10, 12, 14, 16, 18, 20, 22], toa: [12, 14, 16, 18, 20, 22, 24] }
  },
  {
    id: "yinlin",
    name: "Yinlin",
    element: "Electro",
    rarity: 5,
    maxSequence: 6,
    image: "yinlin-1.png",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "xiangli-yao",
    name: "Xiangli Yao",
    element: "Electro",
    rarity: 5,
    maxSequence: 6,
    image: "Xiangli-Yao-icon.png",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  // 5 étoiles - Aero
  {
    id: "jiyan",
    name: "Jiyan",
    element: "Aero",
    rarity: 5,
    maxSequence: 6,
    image: "Wuthering-Waves-Jiyan.png",
    points: { whiwa: [12, 14, 16, 18, 20, 22, 24], toa: [14, 16, 18, 20, 22, 24, 26] }
  },
  {
    id: "jinhsi",
    name: "Jinhsi",
    element: "Spectro",
    rarity: 5,
    maxSequence: 6,
    image: "Jinshi_icon.png",
    points: { whiwa: [16, 18, 20, 22, 24, 26, 28], toa: [18, 20, 22, 24, 26, 28, 30] }
  },
  {
    id: "shorekeeper",
    name: "Shorekeeper",
    element: "Spectro",
    rarity: 5,
    maxSequence: 6,
    image: "Shorekeeper-icon.webp",
    points: { whiwa: [16, 18, 20, 22, 24, 26, 28], toa: [18, 20, 22, 24, 26, 28, 30] }
  },
  // 5 étoiles - Havoc
  {
    id: "danjin",
    name: "Danjin",
    element: "Havoc",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Waves-Danjin.png",
    points: { whiwa: [4, 5, 6, 7, 8, 9, 10], toa: [5, 6, 7, 8, 9, 10, 11] }
  },
  {
    id: "camellya",
    name: "Camellya",
    element: "Havoc",
    rarity: 5,
    maxSequence: 6,
    image: "Camellya_icon.webp",
    points: { whiwa: [16, 18, 20, 22, 24, 26, 28], toa: [18, 20, 22, 24, 26, 28, 30] }
  },
  // 4 étoiles - Glacio
  {
    id: "sanhua",
    name: "Sanhua",
    element: "Glacio",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Waves-Sanhua.png",
    points: { whiwa: [4, 5, 6, 7, 8, 9, 10], toa: [5, 6, 7, 8, 9, 10, 11] }
  },
  {
    id: "baizhi",
    name: "Baizhi",
    element: "Glacio",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Waves-Bailian.png",
    points: { whiwa: [4, 5, 6, 7, 8, 9, 10], toa: [5, 6, 7, 8, 9, 10, 11] }
  },
  {
    id: "youhu",
    name: "Youhu",
    element: "Glacio",
    rarity: 4,
    maxSequence: 6,
    image: "Youhu-icon.webp",
    points: { whiwa: [5, 6, 7, 8, 9, 10, 11], toa: [6, 7, 8, 9, 10, 11, 12] }
  },
  // 4 étoiles - Fusion
  {
    id: "chixia",
    name: "Chixia",
    element: "Fusion",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Waves-Chixia.png",
    points: { whiwa: [3, 4, 5, 6, 7, 8, 9], toa: [4, 5, 6, 7, 8, 9, 10] }
  },
  {
    id: "mortefi",
    name: "Mortefi",
    element: "Fusion",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Waves-Mortefi.png",
    points: { whiwa: [5, 6, 7, 8, 9, 10, 11], toa: [6, 7, 8, 9, 10, 11, 12] }
  },
  // 4 étoiles - Electro
  {
    id: "yuanwu",
    name: "Yuanwu",
    element: "Electro",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Waves-Yuanwu.png",
    points: { whiwa: [4, 5, 6, 7, 8, 9, 10], toa: [5, 6, 7, 8, 9, 10, 11] }
  },
  {
    id: "lumi",
    name: "Lumi",
    element: "Electro",
    rarity: 4,
    maxSequence: 6,
    image: "Lumi_icon.webp",
    points: { whiwa: [3, 4, 5, 6, 7, 8, 9], toa: [4, 5, 6, 7, 8, 9, 10] }
  },
  // 4 étoiles - Aero
  {
    id: "yangyang",
    name: "Yangyang",
    element: "Aero",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Wave-YangYang.png",
    points: { whiwa: [3, 4, 5, 6, 7, 8, 9], toa: [4, 5, 6, 7, 8, 9, 10] }
  },
  {
    id: "aalto",
    name: "Aalto",
    element: "Aero",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Wave-Aalto.png",
    points: { whiwa: [3, 4, 5, 6, 7, 8, 9], toa: [4, 5, 6, 7, 8, 9, 10] }
  },
  {
    id: "jianxin",
    name: "Jianxin",
    element: "Aero",
    rarity: 5,
    maxSequence: 6,
    image: "Wuthering-Waves-Jianxin.png",
    points: { whiwa: [10, 12, 14, 16, 18, 20, 22], toa: [12, 14, 16, 18, 20, 22, 24] }
  },
  // 4 étoiles - Spectro
  {
    id: "verina",
    name: "Verina",
    element: "Spectro",
    rarity: 5,
    maxSequence: 6,
    image: "Wuthering-Waves-Verina.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
    // 4 étoiles - Havoc
  {
    id: "taoqi",
    name: "Taoqi",
    element: "Havoc",
    rarity: 4,
    maxSequence: 6,
    image: "Wuthering-Waves-Taoqi.png",
    points: { whiwa: [4, 5, 6, 7, 8, 9, 10], toa: [5, 6, 7, 8, 9, 10, 11] }
  },
  // Nouveaux personnages
  {
    id: "roccia",
    name: "Roccia",
    element: "Havoc",
    rarity: 5,
    maxSequence: 6,
    image: "Roccia_icon.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "phoebe",
    name: "Phoebe",
    element: "Spectro",
    rarity: 5,
    maxSequence: 6,
    image: "Phoebe.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "brant",
    name: "Brant",
    element: "Fusion",
    rarity: 5,
    maxSequence: 6,
    image: "Brant.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "cantarella",
    name: "Cantarella",
    element: "Havoc",
    rarity: 5,
    maxSequence: 6,
    image: "Cantarella.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "augusta",
    name: "Augusta",
    element: "Electro",
    rarity: 5,
    maxSequence: 6,
    image: "Augusta-icon.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "buling",
    name: "Buling",
    element: "Electro",
    rarity: 4,
    maxSequence: 6,
    image: "Buling.webp",
    points: { whiwa: [4, 5, 6, 7, 8, 9, 10], toa: [5, 6, 7, 8, 9, 10, 11] }
  },
  {
    id: "iuno",
    name: "Iuno",
    element: "Aero",
    rarity: 5,
    maxSequence: 6,
    image: "Iuno.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "phrolova",
    name: "Phrolova",
    element: "Havoc",
    rarity: 5,
    maxSequence: 6,
    image: "Phrolova-icon.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "qiuyuan",
    name: "Qiuyuan",
    element: "Aero",
    rarity: 5,
    maxSequence: 6,
    image: "Qiuyuan.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "galbrena",
    name: "Galbrena",
    element: "Fusion",
    rarity: 5,
    maxSequence: 6,
    image: "Galbrena.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "lynae",
    name: "Lynae",
    element: "Spectro",
    rarity: 5,
    maxSequence: 6,
    image: "Lynae.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },
  {
    id: "mornye",
    name: "Mornye",
    element: "Fusion",
    rarity: 5,
    maxSequence: 6,
    image: "Mornye.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  },

  {
    id: "zani",
    name: "Zani",
    element: "Spectro",
    rarity: 5,
    maxSequence: 6,
    image: "Zani_Icon.webp",
    points: { whiwa: [14, 16, 18, 20, 22, 24, 26], toa: [16, 18, 20, 22, 24, 26, 28] }
  }
];

// Couleurs des éléments
export const elementColors: Record<Element, { bg: string; text: string; border: string }> = {
  Glacio: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500" },
  Fusion: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500" },
  Electro: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500" },
  Aero: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500" },
  Spectro: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500" },
  Havoc: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500" }
};

// Icônes des éléments (SVG paths)
export const elementIcons: Record<Element, string> = {
  Glacio: "M12 2L8 8H4l4 6-4 6h4l4 6 4-6h4l-4-6 4-6h-4L12 2z",
  Fusion: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
  Electro: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Aero: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
  Spectro: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  Havoc: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
};

// Fonction utilitaire pour obtenir les points d'un personnage
export function getCharacterPoints(
  characterId: string,
  sequence: number,
  gameMode: "whiwa" | "toa"
): number {
  const character = characters.find((c) => c.id === characterId);
  if (!character) return 0;
  return character.points[gameMode][Math.min(sequence, character.maxSequence)] || 0;
}

// Fonction pour calculer les bans d'équilibrage
export function calculateBalanceBans(player1Points: number, player2Points: number): { player: 1 | 2; bans: number } {
  const diff = Math.abs(player1Points - player2Points);
  const playerWithLessPoints = player1Points < player2Points ? 1 : 2;
  
  let bans = 0;
  if (diff >= 50) bans = 4;
  else if (diff >= 35) bans = 3;
  else if (diff >= 20) bans = 2;
  else if (diff >= 10) bans = 1;
  
  return { player: playerWithLessPoints, bans };
}
