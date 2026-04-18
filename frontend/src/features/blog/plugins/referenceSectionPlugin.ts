import type MarkdownIt from 'markdown-it';

import { extractInlineText } from './utils';

function isReferenceMarker(text: string) {
  return text.trim().toLowerCase() === '@reference';
}

export function referenceSectionPlugin(md: MarkdownIt): void {
  md.core.ruler.push('reference_section', (state: any) => {
    for (let index = 0; index < state.tokens.length - 2; index += 1) {
      const open = state.tokens[index];
      const inline = state.tokens[index + 1];
      const close = state.tokens[index + 2];

      if (open.type !== 'heading_open' || open.tag !== 'h2') {
        continue;
      }

      if (!inline || inline.type !== 'inline' || !isReferenceMarker(extractInlineText(inline))) {
        continue;
      }

      if (!close || close.type !== 'heading_close' || close.tag !== 'h2') {
        continue;
      }

      inline.content = '参考内容';
      if (Array.isArray(inline.children)) {
        inline.children = inline.children.map((token: any) => {
          if (token.type === 'text') {
            token.content = '参考内容';
          }
          return token;
        });
      }

      open.attrJoin('class', 'md-reference-heading');

      const sectionOpen = new state.Token('html_block', '', 0);
      sectionOpen.content = '<section class="md-reference-section">\n';

      let endIndex = state.tokens.length;
      for (let nextIndex = index + 3; nextIndex < state.tokens.length; nextIndex += 1) {
        const next = state.tokens[nextIndex];
        if (next.type === 'heading_open' && (next.tag === 'h1' || next.tag === 'h2')) {
          endIndex = nextIndex;
          break;
        }
      }

      const sectionClose = new state.Token('html_block', '', 0);
      sectionClose.content = '</section>\n';

      state.tokens.splice(index + 3, 0, sectionOpen);
      state.tokens.splice(endIndex + 1, 0, sectionClose);
      index = endIndex + 1;
    }
  });
}
