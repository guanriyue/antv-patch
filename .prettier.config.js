/** @type {import("prettier").Config} */
export default {
  trailingComma: "es5", // 尾逗号：在对象/数组多行时添加
  semi: true, // 语句末尾加分号
  singleQuote: false, // 使用双引号（Biome 默认）
  tabWidth: 2, // 缩进宽度为 2 空格
  useTabs: false, // 不使用 tab
  arrowParens: "always", // 始终加括号（Biome 不支持 avoid）
  printWidth: 120, // 最大行宽
  endOfLine: "lf",
};
