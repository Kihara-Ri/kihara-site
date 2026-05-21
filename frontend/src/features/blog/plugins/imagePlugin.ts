import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import { escapeHtml } from './utils';

function getAttr(token: Token, name: string): string {
  return token.attrGet(name) ?? '';
}

function renderImageFigure(token: Token): string {
  const src = getAttr(token, 'src').trim();
  if (!src) {
    return '';
  }

  const alt = token.content.trim();
  const title = getAttr(token, 'title').trim();
  const caption = title || alt;
  const escapedSrc = escapeHtml(src);
  const escapedAlt = escapeHtml(alt);
  const escapedCaption = escapeHtml(caption);
  const escapedLabel = escapeHtml(caption || alt || '查看大图');

  return [
    '<figure class="md-image-figure">',
    '<button',
    ' type="button"',
    ' class="md-image-button"',
    ` data-src="${escapedSrc}"`,
    ` data-alt="${escapedAlt}"`,
    ` data-caption="${escapedCaption}"`,
    ` aria-label="查看大图：${escapedLabel}"`,
    '>',
    `<img src="${escapedSrc}" alt="${escapedAlt}" loading="lazy" decoding="async" />`,
    '</button>',
    caption ? `<figcaption>${escapedCaption}</figcaption>` : '',
    '</figure>',
  ].join('');
}

function isStandaloneImage(tokens: Token[], index: number): boolean {
  const previous = tokens[index - 1];
  const current = tokens[index];
  const next = tokens[index + 1];

  if (!previous || !current || !next) {
    return false;
  }

  if (previous.type !== 'paragraph_open' || current.type !== 'inline' || next.type !== 'paragraph_close') {
    return false;
  }

  const children = current.children ?? [];
  return children.length === 1 && children[0].type === 'image';
}

export function imagePlugin(md: MarkdownIt): void {
  md.core.ruler.after('inline', 'standalone_image_figure', (state) => {
    const tokens = state.tokens;

    for (let index = 1; index < tokens.length - 1; index += 1) {
      if (!isStandaloneImage(tokens, index)) {
        continue;
      }

      const imageToken = tokens[index].children?.[0];
      if (!imageToken) {
        continue;
      }

      const figureToken = new state.Token('html_block', '', 0);
      figureToken.content = renderImageFigure(imageToken);

      tokens.splice(index - 1, 3, figureToken);
    }
  });

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    token.attrSet('loading', 'lazy');
    token.attrSet('decoding', 'async');
    token.attrJoin('class', 'md-inline-image');
    return self.renderToken(tokens, idx, options);
  };
}
