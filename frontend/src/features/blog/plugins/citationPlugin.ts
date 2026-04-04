import type MarkdownIt from 'markdown-it';
import { ensureRenderEnv } from './types';
import { escapeHtml, findUnescapedChar } from './utils';

export function citationPlugin(md: MarkdownIt): void {
  md.inline.ruler.before('emphasis', 'citation', (state: any, silent: boolean) => {
    const start = state.pos;
    const source = state.src as string;

    if (source[start] !== '[' || source[start + 1] !== '@') {
      return false;
    }

    const end = findUnescapedChar(source, ']', start + 2);
    if (end < 0) {
      return false;
    }

    const content = source.slice(start + 2, end).trim();
    if (!content) {
      return false;
    }

    const env = ensureRenderEnv(state.env);
    const index = env.references.length + 1;
    env.references.push({ index, content });

    if (!silent) {
      const token = state.push('html_inline', '', 0);
      token.content =
        `<sup class="md-citation" id="ref-link-${index}">` +
        `<a href="#ref-${index}">[${index}]</a>` +
        '</sup>';
    }

    state.pos = end + 1;
    return true;
  });

  md.core.ruler.push('citation_block', (state: any) => {
    const env = ensureRenderEnv(state.env);
    if (env.references.length === 0) {
      return;
    }

    const items = env.references
      .map(
        (item) =>
          `<li id="ref-${item.index}">${escapeHtml(item.content)} ` +
          `<a href="#ref-link-${item.index}" aria-label="回到引用 ${item.index}">↩</a></li>`,
      )
      .join('');

    const token = new state.Token('html_block', '', 0);
    token.content =
      '<section class="md-references">' +
      '<h3 id="references">References</h3>' +
      `<ol>${items}</ol>` +
      '</section>';
    state.tokens.push(token);
  });
}
