import vitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import * as importX from "eslint-plugin-import-x";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import reactHooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import neostandard from "neostandard";

const eslintConfig = defineConfig([
  // Next.js ルール
  ...nextVitals,
  ...nextTs,

  // ベース: neostandard（フォーマットは Prettier に委ねるため noStyle: true）
  ...neostandard({ noStyle: true, ts: true }),

  // React hooks
  reactHooks.configs.flat.recommended,

  // Tailwind CSS v4 対応の品質ルール + クラスソート
  // entryPoint は packages/ui の CSS-first 設定ファイル（apps/web からの相対パス）
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: "../../packages/ui/src/styles/globals.css",
      },
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      // 改行整形は prettier に委ねる（クラス順序のみ better-tailwindcss が担当）
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
    },
  },

  // インポート順序・循環依存検出
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,

  // カスタムルール
  {
    plugins: {
      "unused-imports": unusedImports,
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      // [unused-imports] 未使用インポートを自動削除可能な形で検出する
      // @typescript-eslint/no-unused-vars と競合するため無効化して代替させる
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",

      // [no-redeclare] const オブジェクト enum パターン (`const X = {...} as const` + `type X = ...`)
      // を許容するため OFF。TypeScript 自体が真の値再宣言は検出するため安全
      "@typescript-eslint/no-redeclare": "off",
      "no-redeclare": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // [no-relative-import-paths] @/ エイリアスによる絶対インポートを強制（同一フォルダは許可）
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        { allowSameFolder: true, rootDir: ".", prefix: "@" },
      ],

      // [import-x] TypeScript コンパイラが解決するため未解決チェックを無効化
      "import-x/no-unresolved": "off",

      // [no-restricted-syntax] enum の代わりに union 型か const オブジェクトを使う
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message:
            "enum は禁止です。union 型か const オブジェクトを使ってください。",
        },
      ],

      // [@typescript-eslint] import 文には必ず type を付ける
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // [@typescript-eslint] 型定義は interface に統一する
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      // [@typescript-eslint] 関数の戻り値型を明示する
      "@typescript-eslint/explicit-function-return-type": "error",
      // [@typescript-eslint] 命名規則: camelCase 基本、関数は PascalCase も許可（React コンポーネント用）
      // objectLiteralProperty は外部 API レスポンスなどの snake_case キーに対応するため無効化
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "default", format: ["camelCase"] },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
        },
        // const オブジェクト enum パターン (`const AuthMode = {...} as const`) のため
        // const 変数のみ PascalCase も許可する
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "objectLiteralProperty", format: null },
        // 外部スキーマ (pgmq の msg_id / read_ct など) に対応するため type property は format チェックを行わない
        { selector: "typeProperty", format: null },
        // キャッシュタグなど PascalCase キーで名前空間として機能する object literal method を許可
        {
          selector: "objectLiteralMethod",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "import",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
      ],
    },
  },

  // Unicorn: モダン JS のベストプラクティスとファイル命名
  {
    plugins: { unicorn },
    rules: {
      ...unicorn.configs["flat/recommended"].rules,
      // ファイル名は kebab-case に統一する
      "unicorn/filename-case": ["error", { cases: { kebabCase: true } }],
      // 略語の展開（props/Props は React の規約として許可）
      // Params/params は React/Next.js の慣習として許可
      // e2e はテスト種別の慣習として許可
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            props: true,
            Props: true,
            e2e: true,
          },
          // React/Next.js の慣習・外部ライブラリ命名と衝突するためデフォルト変換を無効化
          replacements: {
            params: false,
            args: false,
            ref: false,
            props: false,
            db: false,
            env: false,
            e: false,
            i: false,
            j: false,
            param: false,
            prop: false,
          },
        },
      ],
      // null を使う外部 API・ライブラリとの互換性のため無効化
      "unicorn/no-null": "off",
    },
  },

  // Prettier: 競合するスタイルルールを無効化するため必ず最後に配置
  prettierConfig,

  // テストファイル: Vitest プラグイン導入 + テスト向けのルール調整
  // lib/test 配下はテスト用の fixture / ヘルパーで test.extend を使うためテスト扱いにする
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "lib/test/**/*.ts"],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      // vitest の test.extend fixture は空のオブジェクト分割パターン `({}, provide)` を要求する
      "no-empty-pattern": "off",
      // テストでは戻り値型の明示を不要とする
      "@typescript-eslint/explicit-function-return-type": "off",
      // 別ファイルから re-export した test を使ったケースで誤検知するため OFF
      "vitest/no-standalone-expect": "off",
      // Result 型の判別ユニオンに対する type guard で `if (!result.success) expect(...)` パターンを
      // 多用するため無効化
      "vitest/no-conditional-expect": "off",
      // テストでは any 型のキャストが必要になるケースが多いため緩める
      "@typescript-eslint/no-explicit-any": "off",
      // Vitest の動的 import で `const module = await import(...)` を使うため無効化
      "@next/next/no-assign-module-variable": "off",
      // テストでは PascalCase の object literal method (React component を返すヘルパー) を許可
      "@typescript-eslint/naming-convention": "off",
      // 動的 import の型取得で `typeof import(...)` を多用するため無効化
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },

  // Vitest / Playwright fixture 内の `({}, use)` パターンに対する no-empty-pattern を無効化
  {
    files: ["e2e/**/*.ts", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-empty-pattern": "off",
    },
  },

  // 本番コードからテスト用ユーティリティの import を禁止する
  // lib/test 自体・テストファイル・スクリプトのみが lib/test を import 可能
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "lib/test/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/test", "@/lib/test/*"],
              message:
                "@/lib/test 配下は Service Role キーを使うテスト専用ユーティリティです。本番コードからは import できません。",
            },
          ],
        },
      ],
    },
  },

  // shadcn/ui コンポーネントは shadcn CLI が生成するためアップストリームの規約に従う
  {
    files: ["components/ui/**"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/naming-convention": "off",
    },
  },

  // Playwright E2E テスト: Playwright fixture の use() callback が
  // react-hooks/rules-of-hooks に誤検知されるためここで無効化
  // また e2e は Vitest ではなく Playwright で実行するため vitest 系も無効化
  {
    files: ["e2e/**/*.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "vitest/no-conditional-expect": "off",
      "vitest/expect-expect": "off",
      "vitest/valid-title": "off",
    },
  },

  // Vitest の test.extend fixture も use() callback を使うため誤検知を抑制
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "node_modules/**",
    // MSW が自動生成する Service Worker スクリプトのため除外
    "public/mockServiceWorker.js",
    // MSW のテスト用ファイル
    "mocks/**",
  ]),
]);

export default eslintConfig;
