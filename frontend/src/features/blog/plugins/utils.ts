type InlineChildToken = {
  type: string;
  content: string;
};

type InlineToken = {
  content: string;
  children: InlineChildToken[] | null;
};

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function slugify(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-');

  return cleaned.length > 0 ? cleaned : 'section';
}

export function extractInlineText(token: InlineToken): string {
  if (!token.children || token.children.length === 0) {
    return token.content;
  }

  return token.children
    .filter((child: InlineChildToken) => child.type !== 'html_inline')
    .map((child: InlineChildToken) => child.content)
    .join('')
    .trim();
}

export function findUnescapedChar(source: string, char: string, from: number): number {
  let idx = from;
  while (idx < source.length) {
    idx = source.indexOf(char, idx);
    if (idx < 0) {
      return -1;
    }

    if (idx === 0 || source[idx - 1] !== '\\') {
      return idx;
    }

    idx += 1;
  }

  return -1;
}
