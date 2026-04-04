import type MarkdownIt from 'markdown-it';
import { escapeHtml, findUnescapedChar } from './utils';

export function annotationPlugin(md: MarkdownIt): void {
  md.inline.ruler.before('emphasis', 'annotation', (state: any, silent: boolean) => {
    const start = state.pos;
    const source = state.src as string;

    if (source[start] !== '{') {
      return false;
    }

    const textEnd = findUnescapedChar(source, '}', start + 1);
    if (textEnd < 0 || source.slice(textEnd + 1, textEnd + 3) !== '^[') {
      return false;
    }

    const noteEnd = findUnescapedChar(source, ']', textEnd + 3);
    if (noteEnd < 0) {
      return false;
    }

    const label = source.slice(start + 1, textEnd).trim();
    const note = source.slice(textEnd + 3, noteEnd).trim();
    if (!label || !note) {
      return false;
    }

    if (!silent) {
      const token = state.push('html_inline', '', 0);
      token.content =
        `<span class="md-annotation" tabindex="0">` +
        `<mark>${escapeHtml(label)}</mark>` +
        `<span class="md-tooltip">${escapeHtml(note)}</span>` +
        '</span>';
    }

    state.pos = noteEnd + 1;
    return true;
  });
}
