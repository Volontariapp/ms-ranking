export interface RankedRow {
  id: string;
  rank: number;
  score: number;
  structuralScore: number;
  semanticScore: number | null;
  reasons: readonly string[];
}
