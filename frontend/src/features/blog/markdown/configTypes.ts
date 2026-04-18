export type CustomPluginName =
  | 'annotation'
  | 'attach'
  | 'citation'
  | 'furigana'
  | 'referenceSection'
  | 'headingAnchor'
  | 'linkIcon';

export interface MarkdownPluginConfig {
  name: CustomPluginName;
  enabled: boolean;
}

export interface MarkdownItOptions {
  html?: boolean;
  xhtmlOut?: boolean;
  breaks?: boolean;
  langPrefix?: string;
  linkify?: boolean;
  typographer?: boolean;
  quotes?: string | string[];
}

export interface MarkdownTexmathConfig {
  enabled: boolean;
  delimiters: 'dollars';
  katexOptions: {
    throwOnError?: boolean;
    strict?: 'ignore' | boolean | string;
  };
}

export interface MarkdownHighlightConfig {
  enabled: boolean;
  codeBlockClassName: string;
}

export interface BlogMarkdownConfig {
  markdownIt: MarkdownItOptions;
  highlight: MarkdownHighlightConfig;
  texmath: MarkdownTexmathConfig;
  plugins: MarkdownPluginConfig[];
}
