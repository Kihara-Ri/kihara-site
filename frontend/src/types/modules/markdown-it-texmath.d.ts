declare module 'markdown-it-texmath' {
  import type MarkdownIt from 'markdown-it';

  type TexMathOptions = {
    engine: {
      renderToString: (
        expression: string,
        options?: Record<string, unknown>,
      ) => string;
    };
    delimiters?: 'dollars';
    katexOptions?: Record<string, unknown>;
  };

  const texmath: (md: MarkdownIt, options?: TexMathOptions) => void;
  export default texmath;
}
