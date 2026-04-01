/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react';

  const MDXComponent: ComponentType;
  export default MDXComponent;
}

declare module '*.glsl' {
  const source: string;
  export default source;
}

declare module '*.fs' {
  const source: string;
  export default source;
}

declare module '*.vs' {
  const source: string;
  export default source;
}
