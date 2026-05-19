/** @type {import("prettier").Config} */
const config = {
  // prettier-plugin-sh: shell / Dockerfile / .env / .gitignore / hosts / jvmoptions / properties
  // prettier-plugin-toml: TOML (.toml)
  // prettier-plugin-sql: SQL (.sql)
  // prettier-plugin-packagejson: package.json のフィールド順序を整形
  // prettier-plugin-tailwindcss: Tailwind CSS クラスのソート (他プラグインとの併用で最後に置く必要あり)
  tailwindStylesheet: "./packages/ui/src/styles/globals.css",
  plugins: [
    "prettier-plugin-sh",
    "prettier-plugin-toml",
    "prettier-plugin-sql",
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
  ],
  overrides: [
    {
      // PL/pgSQL の DO $$ ... $$ ブロックを含む SQL を扱うため PostgreSQL dialect を指定
      files: "*.sql",
      options: { language: "postgresql" },
    },
  ],
};

export default config;
