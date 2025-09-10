// Carnatic Music Talam Definitions
export interface Talam {
  name: string;
  aksharas: number; // Total number of beats
  pattern: string[]; // Beat pattern (laghu, dhrutham, anudhrutham)
  emphasis: number[]; // Which beats to emphasize (0-indexed)
  description: string;
  structure: {
    component: string;
    beats: number;
    symbol: string;
  }[];
}

export const TALAMS: Talam[] = [
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
    ]
  },
  {
    name: "Rupaka Talam",
    aksharas: 6,
    pattern: ["|", "1", "1", "|", "1", "2"],
    emphasis: [0, 3],
    description: "Popular 6-beat talam (Chatusra Jati Rupaka)",
    structure: [
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ]
  },
  {
    name: "Misra Chapu",
    aksharas: 7,
    pattern: ["1", "2", "3", "|", "1", "2", "3"],
    emphasis: [0, 3],
    description: "7-beat irregular talam, very popular in film music",
    structure: [
      { component: "Laghu", beats: 3, symbol: "|" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ]
  },
  {
    name: "Khanda Chapu",
    aksharas: 5,
    pattern: ["1", "2", "|", "1", "2"],
    emphasis: [0, 2],
    description: "5-beat irregular talam",
    structure: [
      { component: "Laghu", beats: 2, symbol: "|" },
      { component: "Laghu", beats: 3, symbol: "|" }
    ]
  },
  {
    name: "Tisra Triputa (Tisra Adi)",
    aksharas: 7,  
    pattern: ["1", "2", "3", "|", "1", "|", "1"],
    emphasis: [0, 3, 5],
    description: "7-beat version of Adi Talam (Tisra Jati Triputa)",
    structure: [
      { component: "Laghu", beats: 3, symbol: "|" },
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Dhrutam", beats: 2, symbol: "O" }
    ]
  },
  {
    name: "Sankirna Chapu",
    aksharas: 9,
    pattern: ["1", "2", "3", "4", "5", "|", "1", "2", "3"],
    emphasis: [0, 5],
    description: "9-beat irregular talam",
    structure: [
      { component: "Laghu", beats: 5, symbol: "|" },
      { component: "Laghu", beats: 4, symbol: "|" }
    ]
  },
  {
    name: "Khanda Triputa",
    aksharas: 11,
    pattern: ["1", "2", "3", "4", "5", "|", "1", "2", "|", "1", "2"],
    emphasis: [0, 5, 7],
    description: "11-beat talam (Khanda Jati Triputa)",
    structure: [
      { component: "Laghu", beats: 5, symbol: "|" },
      { component: "Dhrutam", beats: 2, symbol: "O" },
      { component: "Dhrutam", beats: 2, symbol: "O" }
    ]
  }
];

export const DEFAULT_TALAM = TALAMS[0]; // Adi Talam as default