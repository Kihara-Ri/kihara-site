import type MarkdownIt from 'markdown-it';
import { ensureRenderEnv } from './types';
import { escapeHtml, extractInlineText, slugify } from './utils';

export function headingAnchorPlugin(md: MarkdownIt): void {
  md.core.ruler.push('heading_anchor', (state: any) => {
    const env = ensureRenderEnv(state.env);
    env.headings.length = 0;

    const slugCounter = new Map<string, number>();

    for (let idx = 0; idx < state.tokens.length - 2; idx += 1) {
      const open = state.tokens[idx];
      if (open.type !== 'heading_open' || (open.tag !== 'h2' && open.tag !== 'h3')) {
        continue;
      }

      const inline = state.tokens[idx + 1];
      if (!inline || inline.type !== 'inline') {
        continue;
      }

      const text = extractInlineText(inline);
      if (!text) {
        continue;
      }

      const baseSlug = slugify(text);
      const count = slugCounter.get(baseSlug) ?? 0;
      slugCounter.set(baseSlug, count + 1);
      const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

      open.attrSet('id', slug);
      env.headings.push({ id: slug, level: Number(open.tag[1]) as 2 | 3, text });

      if (!inline.children) {
        inline.children = [];
      }

      const anchorToken = new state.Token('html_inline', '', 0);
      anchorToken.content =
        ` <a class="md-heading-anchor" href="#${slug}" ` +
        `aria-label="跳转到 ${escapeHtml(text)}">#</a>`;
      inline.children.push(anchorToken);
    }
  });
}
