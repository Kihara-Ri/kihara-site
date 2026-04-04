export interface HeadingItem {
  id: string;
  level: 2 | 3;
  text: string;
}

export interface ReferenceItem {
  index: number;
  content: string;
}

export interface MarkdownRenderEnv {
  headings: HeadingItem[];
  references: ReferenceItem[];
}

export function ensureRenderEnv(rawEnv: unknown): MarkdownRenderEnv {
  const env = (rawEnv ?? {}) as Partial<MarkdownRenderEnv>;

  if (!Array.isArray(env.headings)) {
    env.headings = [];
  }

  if (!Array.isArray(env.references)) {
    env.references = [];
  }

  return env as MarkdownRenderEnv;
}
