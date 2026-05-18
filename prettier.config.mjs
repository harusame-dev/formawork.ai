/** @type {import("prettier").Config} */
const config = {
  // prettier-plugin-sh: shell / Dockerfile / .env / .gitignore / hosts / jvmoptions / properties
  // prettier-plugin-toml: TOML (.toml)
  // prettier-plugin-sql: SQL (.sql)
  // prettier-plugin-packagejson: package.json のフィールド順序を整形
  plugins: [
    "prettier-plugin-sh",
    "prettier-plugin-toml",
    "prettier-plugin-sql",
    "prettier-plugin-packagejson",
  ],
};

export default config;
