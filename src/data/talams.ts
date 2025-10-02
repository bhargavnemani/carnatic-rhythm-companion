// Carnatic Music Talam Definitions

export interface Talam {
  name: string;
  aksharas: number; // Total number of beats
  pattern: string[]; // Beat pattern (laghu, dhrutham, anudhrutham)
  emphasis: number[]; // Which beats to emphasize (0-indexed)
  silentBeats?: number[]; // Which beats are silent (0-indexed)
  description: string;
  structure: {
    component: string;
    beats: number;
    symbol: string;
  }[];
  category: 'traditional' | 'common';
  jaathi?: string;
}

// Jaathis (5 types)
export const JAATHIS = [
  { name: "Tisra", beats: 3 },
  { name: "Chatusra", beats: 4 },
  { name: "Khanda", beats: 5 },
  { name: "Misra", beats: 7 },
  { name: "Sankeerna", beats: 9 }
];

// Traditional 7 Talams
export const TRADITIONAL_TALAMS = [
  "Dhruva",
  "Matya", 
  "Rupaka",
  "Jhampa",
  "Triputa",
  "Ata",
  "Eka"
];

// All Talams Data
export const TALAMS: Talam[] = [
  // Common Talams (used today)
  {
    name: "Adi Talam",
    aksharas: 8,
    pattern: ["1", "2", "3", "4", "|", "1", "|", "1"],
    emphasis: [0, 4, 6],
    description: "Most common talam in Carnatic music (Chatusra Jati Triputa)",
    structure: [
      { component: "Laghu", beats: 4, symbol: "|" },
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Dhrutam", beats: 2, symbol: "O" }
    ],
    category: 'common',
    jaathi: 'Chatusra'
  },
  {
    name: "Simplified Rupaka Talam",
    aksharas: 3,
    pattern: ["1", "2", "3"],
    emphasis: [0],
    description: "Simple 3-beat talam",
    structure: [
      { component: "Laghu", beats: 3, symbol: "|" }
    ],
    category: 'common'
  },
  {
    name: "Misra Chapu",
    aksharas: 7,
    pattern: ["1", "2", "3", "4", "5", "6", "7"],
    emphasis: [0, 1, 3, 5],
    silentBeats: [2, 4, 6],
    description: "7-beat irregular talam, very popular in film music",
    structure: [
      { component: "Laghu", beats: 3, symbol: "|" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ],
    category: 'common'
  },
  {
    name: "Khanda Chapu",
    aksharas: 5,
    pattern: ["1", "2", "3", "4", "5"],
    emphasis: [0, 2, 3],
    silentBeats: [1, 4],
    description: "5-beat irregular talam",
    structure: [
      { component: "Laghu", beats: 2, symbol: "|" },
      { component: "Laghu", beats: 3, symbol: "|" }
    ],
    category: 'common'
  },
  {
    name: "Sankeerna Chapu",
    aksharas: 9,
    pattern: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    emphasis: [0, 2, 4, 6, 7],
    silentBeats: [1, 3, 5, 8],
    description: "9-beat irregular talam",
    structure: [
      { component: "Laghu", beats: 5, symbol: "|" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ],
    category: 'common'
  },
  
  // Traditional Talams
  {
    name: "Dhruva",
    aksharas: 14,
    pattern: ["1", "2", "3", "4", "|", "1", "2", "|", "1", "2", "3", "4", "|", "1"],
    emphasis: [0, 4, 6, 10, 13],
    description: "Traditional 14-beat talam",
    structure: [
      { component: "Laghu", beats: 4, symbol: "|" },
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Laghu", beats: 4, symbol: "|" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ],
    category: 'traditional'
  },
  {
    name: "Matya",
    aksharas: 10,
    pattern: ["1", "2", "3", "4", "|", "1", "2", "|", "1", "2"],
    emphasis: [0, 4, 6],
    description: "Traditional 10-beat talam",
    structure: [
      { component: "Laghu", beats: 4, symbol: "|" },
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ],
    category: 'traditional'
  },
  {
    name: "Rupaka",
    aksharas: 6,
    pattern: ["|", "1", "1", "|", "1", "2"],
    emphasis: [0, 3],
    description: "Traditional 6-beat talam",
    structure: [
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ],
    category: 'traditional'
  },
  {
    name: "Jhampa",
    aksharas: 10,
    pattern: ["1", "|", "1", "2", "|", "1", "2", "3", "4", "|"],
    emphasis: [0, 1, 3, 5, 9],
    description: "Traditional 10-beat talam",
    structure: [
      { component: "Laghu", beats: 7, symbol: "|" },
      { component: "Anudhrutam", beats: 1, symbol: "U" },
      { component: "Dhrutam", beats: 2, symbol: "O" }
    ],
    category: 'traditional'
  },
  {
    name: "Triputa",
    aksharas: 8,
    pattern: ["1", "2", "3", "4", "|", "1", "|", "1"],
    emphasis: [0, 4, 6],
    description: "Traditional 8-beat talam (same as Adi)",
    structure: [
      { component: "Laghu", beats: 4, symbol: "|" },
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Dhrutam", beats: 2, symbol: "O" }
    ],
    category: 'traditional'
  },
  {
    name: "Ata",
    aksharas: 14,
    pattern: ["1", "2", "|", "1", "2", "|", "1", "2", "3", "4", "|", "1", "2", "3"],
    emphasis: [0, 2, 4, 6, 10],
    description: "Traditional 14-beat talam",
    structure: [
      { component: "Laghu", beats: 5, symbol: "|" },
      { component: "Laghu", beats: 5, symbol: "|" },
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Dhrutam", beats: 2, symbol: "O" }
    ],
    category: 'traditional'
  },
  {
    name: "Eka",
    aksharas: 4,
    pattern: ["1", "2", "3", "4"],
    emphasis: [0],
    description: "Simple 4-beat talam",
    structure: [
      { component: "Laghu", beats: 4, symbol: "|" }
    ],
    category: 'traditional'
  }
];

export const DEFAULT_TALAM = TALAMS[0]; // Adi Talam as default

export const getCommonTalams = () => TALAMS.filter(t => t.category === 'common');
export const getTraditionalTalams = () => TALAMS.filter(t => t.category === 'traditional');

// Function to create custom talam based on jaathi and traditional talam
export const createCustomTalam = (jaathi: string, traditionalTalam: string): Talam => {
  const jaathiInfo = JAATHIS.find(j => j.name === jaathi);
  const baseTalam = getTraditionalTalams().find(t => t.name === traditionalTalam);
  
  if (!jaathiInfo || !baseTalam) {
    return baseTalam || getTraditionalTalams()[0];
  }

  // Create new structure with jaathi beats for laghu components
  const newStructure = baseTalam.structure.map(component => ({
    ...component,
    beats: component.component === 'Laghu' ? jaathiInfo.beats : component.beats
  }));

  // Calculate total aksharas
  const totalAksharas = newStructure.reduce((sum, comp) => sum + comp.beats, 0);

  // Generate pattern and emphasis based on structure
  const pattern: string[] = [];
  const emphasis: number[] = [0]; // Always emphasize samam
  let beatIndex = 0;

  newStructure.forEach((component, structIndex) => {
    if (structIndex > 0) {
      emphasis.push(beatIndex); // Emphasize start of each component after first
    }
    
    for (let i = 0; i < component.beats; i++) {
      if (component.component === 'Laghu') {
        pattern.push((i + 1).toString());
      } else if (component.component === 'Dhrutam') {
        pattern.push(i === 0 ? "|" : (i + 1).toString());
      } else if (component.component === 'Anudhrutam') {
        pattern.push("|");
      }
      beatIndex++;
    }
  });

  return {
    name: `${jaathi} ${traditionalTalam}`,
    aksharas: totalAksharas,
    pattern,
    emphasis,
    description: `${jaathi} Jaathi ${traditionalTalam} Talam`,
    structure: newStructure,
    category: 'traditional',
    jaathi: jaathi
  };
};