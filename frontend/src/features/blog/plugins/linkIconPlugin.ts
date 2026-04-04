import type MarkdownIt from 'markdown-it';

type SiteIconRule = {
  iconPath: string;
  hostnames?: string[];
  keywords: string[];
};

const DEFAULT_LINK_ICON_PATH = '/site-icons/link.svg';

const SITE_ICON_RULES: SiteIconRule[] = [
  {
    iconPath: '/site-icons/bilibili.svg',
    keywords: ['bilibili', 'b23.tv'],
  },
  {
    iconPath: '/site-icons/youtube.svg',
    hostnames: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
    keywords: ['youtube', 'youtu.be'],
  },
  {
    iconPath: '/site-icons/github.svg',
    hostnames: ['github.com', 'www.github.com', 'gist.github.com'],
    keywords: ['github', 'githubusercontent', 'gist'],
  },
  {
    iconPath: '/site-icons/leetcode.svg',
    hostnames: ['leetcode.com', 'www.leetcode.com', 'leetcode.cn', 'www.leetcode.cn'],
    keywords: ['leetcode', '力扣'],
  },
  {
    iconPath: '/site-icons/wikipedia.svg',
    hostnames: ['wikipedia.org', 'www.wikipedia.org'],
    keywords: ['wikipedia', 'wiki'],
  },
  {
    iconPath: '/site-icons/zhihu.svg',
    hostnames: ['zhihu.com', 'www.zhihu.com', 'zhuanlan.zhihu.com'],
    keywords: ['zhihu', '知乎'],
  },
  {
    iconPath: '/site-icons/red-note.svg',
    hostnames: ['xiaohongshu.com', 'www.xiaohongshu.com', 'xhslink.com'],
    keywords: ['xiaohongshu', 'xhslink', '小红书', 'red note'],
  },
];

function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('//');
}

function extractLinkText(tokens: any[], linkOpenIndex: number): string {
  let depth = 0;
  const pieces: string[] = [];

  for (let idx = linkOpenIndex + 1; idx < tokens.length; idx += 1) {
    const token = tokens[idx];

    if (token.type === 'link_open') {
      depth += 1;
      continue;
    }

    if (token.type === 'link_close') {
      if (depth === 0) {
        break;
      }
      depth -= 1;
      continue;
    }

    if (depth === 0 && typeof token.content === 'string' && token.content.trim().length > 0) {
      pieces.push(token.content);
    }
  }

  return pieces.join(' ').trim();
}

function extractHostname(href: string): string {
  if (!href) {
    return '';
  }

  try {
    const normalizedHref = href.startsWith('//') ? `https:${href}` : href;
    return new URL(normalizedHref).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function resolveSiteIcon(href: string, linkText: string): string | null {
  if (!href) {
    return null;
  }

  const hostname = extractHostname(href);
  if (hostname) {
    const hostnameMatched = SITE_ICON_RULES.find((rule) =>
      (rule.hostnames ?? []).some(
        (candidate) => hostname === candidate || hostname.endsWith(`.${candidate}`),
      ),
    );
    if (hostnameMatched) {
      return hostnameMatched.iconPath;
    }
  }

  const haystack = `${href} ${linkText}`.toLowerCase();
  const matched = SITE_ICON_RULES.find((rule) =>
    rule.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())),
  );

  return matched?.iconPath ?? DEFAULT_LINK_ICON_PATH;
}

export function linkIconPlugin(md: MarkdownIt): void {
  const baseRenderer =
    md.renderer.rules.link_open ??
    ((tokens: any[], idx: number, options: any, _env: any, self: any) =>
      self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = (
    tokens: any[],
    idx: number,
    options: any,
    env: any,
    self: any,
  ) => {
    const token = tokens[idx];
    const href = (token.attrGet('href') ?? '').trim();
    const linkText = extractLinkText(tokens, idx);
    const iconPath = resolveSiteIcon(href, linkText);

    const classes = token.attrGet('class');
    token.attrSet('class', classes ? `${classes} md-link` : 'md-link');

    if (isExternalLink(href)) {
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
    }

    const openTag = baseRenderer(tokens, idx, options, env, self);
    if (!iconPath) {
      return openTag;
    }

    return (
      `${openTag}<span class="md-link-icon" aria-hidden="true">` +
      `<img class="md-link-icon-image" src="${iconPath}" alt="" loading="lazy" decoding="async" />` +
      '</span>'
    );
  };
}
