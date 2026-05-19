import { MemoryCategory } from "../schema/customer-memory";

export const customerMemoriesFixture = [
  // テスト太郎さん (00000000-0000-0000-0000-000000000001)
  {
    category: MemoryCategory.Personal,
    content: "会社員、IT企業勤務",
    customerId: "00000000-0000-0000-0000-000000000001",
    id: "30000000-0000-0000-0000-000000000001",
    importance: 5,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Preference,
    content: "清潔感のあるショートスタイルを好む",
    customerId: "00000000-0000-0000-0000-000000000001",
    id: "30000000-0000-0000-0000-000000000002",
    importance: 7,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Conversion,
    content: "新商品の提案に前向き、試してみたいタイプ",
    customerId: "00000000-0000-0000-0000-000000000001",
    id: "30000000-0000-0000-0000-000000000003",
    importance: 8,
    sourceNoteId: null,
  },

  // 山田花子さん (00000000-0000-0000-0000-000000000002)
  {
    category: MemoryCategory.Personal,
    content: "転職して新しい職場に慣れてきた",
    customerId: "00000000-0000-0000-0000-000000000002",
    id: "30000000-0000-0000-0000-000000000004",
    importance: 5,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Preference,
    content: "ハイライトカラーがお気に入り",
    customerId: "00000000-0000-0000-0000-000000000002",
    id: "30000000-0000-0000-0000-000000000005",
    importance: 7,
    sourceNoteId: null,
  },

  // 中村美香さん (00000000-0000-0000-0000-000000000011)
  {
    category: MemoryCategory.Communication,
    content: "施術中は静かに過ごしたい、話しかけすぎに注意",
    customerId: "00000000-0000-0000-0000-000000000011",
    id: "30000000-0000-0000-0000-000000000006",
    importance: 9,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Event,
    content: "9月に結婚式出席予定",
    customerId: "00000000-0000-0000-0000-000000000011",
    id: "30000000-0000-0000-0000-000000000007",
    importance: 8,
    sourceNoteId: null,
  },

  // 渡辺美咲さん (00000000-0000-0000-0000-000000000007)
  {
    category: MemoryCategory.Personal,
    content: "育児中のママ、復職準備中",
    customerId: "00000000-0000-0000-0000-000000000007",
    id: "30000000-0000-0000-0000-000000000008",
    importance: 6,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Preference,
    content: "時短でセットできるスタイルを希望",
    customerId: "00000000-0000-0000-0000-000000000007",
    id: "30000000-0000-0000-0000-000000000009",
    importance: 8,
    sourceNoteId: null,
  },

  // 田中一郎さん (00000000-0000-0000-0000-000000000005)
  {
    category: MemoryCategory.Health,
    content: "頭皮の乾燥が気になる",
    customerId: "00000000-0000-0000-0000-000000000005",
    id: "30000000-0000-0000-0000-000000000010",
    importance: 8,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Personal,
    content: "孫がいる、孫の話題で和む",
    customerId: "00000000-0000-0000-0000-000000000005",
    id: "30000000-0000-0000-0000-000000000011",
    importance: 5,
    sourceNoteId: null,
  },

  // 加藤さくらさん (00000000-0000-0000-0000-000000000009)
  {
    category: MemoryCategory.Personal,
    content: "大学生、新入生",
    customerId: "00000000-0000-0000-0000-000000000009",
    id: "30000000-0000-0000-0000-000000000012",
    importance: 5,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Preference,
    content: "インナーカラーに興味あり、SNS映えを意識",
    customerId: "00000000-0000-0000-0000-000000000009",
    id: "30000000-0000-0000-0000-000000000013",
    importance: 7,
    sourceNoteId: null,
  },
  {
    category: MemoryCategory.Conversion,
    content: "押し売りNG、選択肢を提示すると決めやすい",
    customerId: "00000000-0000-0000-0000-000000000009",
    id: "30000000-0000-0000-0000-000000000014",
    importance: 9,
    sourceNoteId: null,
  },
];
