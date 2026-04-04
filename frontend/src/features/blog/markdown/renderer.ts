import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import blogConfig from '../../../../blog.config.json';
import type { BlogMarkdownConfig } from './configTypes';
import { applyCustomPlugins } from '../plugins';
import { ensureRenderEnv, type MarkdownRenderEnv } from '../plugins/types';
import { escapeHtml } from '../plugins/utils';

const blogMarkdownConfig = blogConfig.markdown as BlogMarkdownConfig;

function createHighlightRenderer() {
  const { highlight } = blogMarkdownConfig;

  if (!highlight.enabled) {
    return undefined;
  }

  return (code: string, language: string) => {
    if (language && hljs.getLanguage(language)) {
      const rendered = hljs.highlight(code, {
        language,
        ignoreIllegals: true,
      }).value;
      return `<pre class="${highlight.codeBlockClassName}"><code class="language-${escapeHtml(language)}">${rendered}</code></pre>`;
    }

    return `<pre class="${highlight.codeBlockClassName}"><code>${escapeHtml(code)}</code></pre>`;
  };
}

function createMarkdownRenderer(): MarkdownIt {
  const markdown = new MarkdownIt({
    ...blogMarkdownConfig.markdownIt,
    highlight: createHighlightRenderer(),
  });

  if (blogMarkdownConfig.texmath.enabled) {
    markdown.use(texmath, {
      engine: katex,
      delimiters: blogMarkdownConfig.texmath.delimiters,
      katexOptions: blogMarkdownConfig.texmath.katexOptions,
    });
  }

  applyCustomPlugins(markdown, blogMarkdownConfig);
  return markdown;
}

const markdown = createMarkdownRenderer();

export interface RenderResult {
  html: string;
  env: MarkdownRenderEnv;
}

export function renderMarkdown(content: string): RenderResult {
  const env = ensureRenderEnv({});
  const html = markdown.render(content, env);
  return { html, env };
}
