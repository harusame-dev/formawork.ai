// React 19 / @types/react v19 ではグローバル `JSX` 名前空間が廃止され、
// `import type { JSX } from "react"` が必須となった。
// 既存コードベースの `JSX.Element` 表記を保持するため、`react` の `JSX` を
// グローバルに再公開する ambient declaration を提供する。

declare namespace JSX {
  type Element = import("react").JSX.Element;
  type ElementType = import("react").JSX.ElementType;
  type ElementClass = import("react").JSX.ElementClass;
  type ElementAttributesProperty =
    import("react").JSX.ElementAttributesProperty;
  type ElementChildrenAttribute = import("react").JSX.ElementChildrenAttribute;
  type LibraryManagedAttributes<C, P> = import(
    "react"
  ).JSX.LibraryManagedAttributes<C, P>;
  type IntrinsicAttributes = import("react").JSX.IntrinsicAttributes;
  type IntrinsicClassAttributes<T> = import(
    "react"
  ).JSX.IntrinsicClassAttributes<T>;
  type IntrinsicElements = import("react").JSX.IntrinsicElements;
}
