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

function resolveLanguage(info: string): string {
  return info.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
}

function formatLanguageLabel(language: string): string {
  if (!language) {
    return 'Plain Text';
  }

  const normalized = language.toLowerCase();
  const languageLabels: Record<string, string> = {
    ts: 'TypeScript',
    typescript: 'TypeScript',
    js: 'JavaScript',
    javascript: 'JavaScript',
    jsx: 'JSX',
    tsx: 'TSX',
    sh: 'Shell',
    bash: 'Bash',
    zsh: 'Zsh',
    py: 'Python',
    golang: 'Go',
    md: 'Markdown',
    yml: 'YAML',
  };

  if (languageLabels[normalized]) {
    return languageLabels[normalized];
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function highlightCodeLine(line: string, language: string): string {
  if (!language || !hljs.getLanguage(language)) {
    return escapeHtml(line);
  }

  return hljs.highlight(line, {
    language,
    ignoreIllegals: true,
  }).value;
}

function renderCodeBlock(code: string, info: string): string {
  const { highlight } = blogMarkdownConfig;
  const language = resolveLanguage(info);
  const languageClassName = language ? ` language-${escapeHtml(language)}` : '';
  const languageLabel = formatLanguageLabel(language);
  const lines = code.replace(/\n$/, '').split('\n');
  const resolvedLines = lines.length > 0 ? lines : [''];

  const renderedLines = resolvedLines
    .map((line, index) => {
      const lineContent = highlight.enabled
        ? highlightCodeLine(line, language)
        : escapeHtml(line);

      return [
        '<span class="md-code-line">',
        `<span class="md-code-line-number" aria-hidden="true">${index + 1}</span>`,
        `<span class="md-code-line-content">${lineContent || '&nbsp;'}</span>`,
        '</span>',
      ].join('');
    })
    .join('');

  return [
    '<div class="md-code-block">',
    '<div class="md-code-toolbar">',
    `<span class="md-code-language">${escapeHtml(languageLabel)}</span>`,
    [
      '<button',
      ' type="button"',
      ' class="md-code-copy"',
      ` data-code="${escapeHtml(code)}"`,
      ' aria-label="复制代码"',
      '>',
      '<span class="md-code-copy-icon" aria-hidden="true"></span>',
      '</button>',
    ].join(''),
    '</div>',
    `<pre class="${highlight.codeBlockClassName} md-code-pre"><code class="md-code${languageClassName}">`,
    renderedLines,
    '</code></pre>',
    '</div>',
  ].join('');
}

function createMarkdownRenderer(): MarkdownIt {
  const markdown = new MarkdownIt({
    ...blogMarkdownConfig.markdownIt,
  });

  markdown.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    return renderCodeBlock(token.content, token.info);
  };

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
