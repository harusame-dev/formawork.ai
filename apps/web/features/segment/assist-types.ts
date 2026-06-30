export interface TmMatch {
  id: string;
  projectName: string;
  /** コサイン類似度（0〜1） */
  score: number;
  sourceText: string;
  targetText: string;
}

export interface GlossaryMatch {
  isCommon: boolean;
  sourceTerm: string;
  targetTerm: string;
}

export interface SegmentAssist {
  glossaryMatches: GlossaryMatch[];
  tmMatches: TmMatch[];
}
