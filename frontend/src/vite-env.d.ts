/// <reference types="vite/client" />

// MDX 类型声明
declare module '*.mdx' {
  import { ComponentType } from 'react';
  // 默认导出就是编译后的 React 组件
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}