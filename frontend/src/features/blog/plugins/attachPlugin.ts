import type MarkdownIt from 'markdown-it';
import { escapeHtml, findUnescapedChar } from './utils';

export function attachPlugin(md: MarkdownIt): void {
  md.inline.ruler.before('emphasis', 'attach', (state: any, silent: boolean) => {
    const start = state.pos;
    const source = state.src as string;

    if (source[start] !== '+' || source[start + 1] !== '{') {
      return false;
    }

    const contentEnd = findUnescapedChar(source, '}', start + 2);
    if (contentEnd < 0) {
      return false;
    }

    const content = source.slice(start + 2, contentEnd).trim();
    if (!content) {
      return false;
    }

    if (!silent) {
      const token = state.push('html_inline', '', 0);
      token.content =
        `<span class="md-attach" tabindex="0">` +
        '<button type="button" class="md-attach-button" aria-label="展开附注">⊕</button>' +
        `<span class="md-tooltip">${escapeHtml(content)}</span>` +
        '</span>';
    }

    state.pos = contentEnd + 1;
    return true;
  });
}
