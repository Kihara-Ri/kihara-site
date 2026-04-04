import type MarkdownIt from 'markdown-it';
import { escapeHtml, findUnescapedChar } from './utils';

const HAN_CHAR = /[\p{Script=Han}々〆ヶ]/u;
const KANA_READING = /^[\p{Script=Hiragana}\p{Script=Katakana}ー・\s]+$/u;

function findSingleUnescapedPipe(content: string): number {
  let pipeIndex = -1;

  for (let idx = 0; idx < content.length; idx += 1) {
    if (content[idx] !== '|') {
      continue;
    }

    if (idx > 0 && content[idx - 1] === '\\') {
      continue;
    }

    if (pipeIndex >= 0) {
      return -1;
    }

    pipeIndex = idx;
  }

  return pipeIndex;
}

export function furiganaPlugin(md: MarkdownIt): void {
  md.inline.ruler.before('emphasis', 'furigana', (state: any, silent: boolean) => {
    const source = state.src as string;
    const start = state.pos;

    if (source[start] !== '{') {
      return false;
    }

    const end = findUnescapedChar(source, '}', start + 1);
    if (end < 0) {
      return false;
    }

    const content = source.slice(start + 1, end);
    if (!content || content.includes('\n') || content.includes('{') || content.includes('}')) {
      return false;
    }

    const pipe = findSingleUnescapedPipe(content);
    if (pipe <= 0 || pipe >= content.length - 1) {
      return false;
    }

    const base = content.slice(0, pipe).trim();
    const reading = content.slice(pipe + 1).trim();
    if (!base || !reading) {
      return false;
    }

    if (!HAN_CHAR.test(base)) {
      return false;
    }

    if (!KANA_READING.test(reading)) {
      return false;
    }

    if (!silent) {
      const token = state.push('html_inline', '', 0);
      token.content = `<ruby class="md-ruby">${escapeHtml(base)}<rt>${escapeHtml(reading)}</rt></ruby>`;
    }

    state.pos = end + 1;
    return true;
  });
}
