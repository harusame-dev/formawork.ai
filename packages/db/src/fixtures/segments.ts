import type { InsertSegment } from "../schema/segment";
import { SegmentStatus } from "../schema/segment";
import { WORK_OVERVIEW_ID } from "./works";

export const segmentsFixture: InsertSegment[] = [
  {
    seq: 1,
    sourceText: "弊社は、お客様一人ひとりに最適なソリューションを提供します。",
    status: SegmentStatus.Confirmed,
    targetText: "We provide the optimal solution for each and every customer.",
    workId: WORK_OVERVIEW_ID,
  },
  {
    seq: 2,
    sourceText:
      "本カタログは、新製品ラインの主要な機能と仕様をまとめたものです。",
    status: SegmentStatus.Draft,
    targetText:
      "This catalog summarizes the key features and specifications of the new product line.",
    workId: WORK_OVERVIEW_ID,
  },
  {
    seq: 3,
    sourceText: "製品の仕様は予告なく変更される場合がございます。",
    status: SegmentStatus.Untranslated,
    targetText: null,
    workId: WORK_OVERVIEW_ID,
  },
  {
    seq: 4,
    sourceText: "個人情報の取り扱いには細心の注意を払っております。",
    status: SegmentStatus.Untranslated,
    targetText: null,
    workId: WORK_OVERVIEW_ID,
  },
  {
    seq: 5,
    sourceText:
      "ご不明な点がございましたら、担当者までお気軽にお問い合わせください。",
    status: SegmentStatus.Untranslated,
    targetText: null,
    workId: WORK_OVERVIEW_ID,
  },
];
