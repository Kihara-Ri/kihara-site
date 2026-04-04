export type BlogRoute =
  | { name: 'home'; tag: string }
  | { name: 'article'; slug: string };

const POSTS_PREFIX = '/posts/';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseRoute(location: Location): BlogRoute {
  const path = location.pathname.replace(/\/+$/, '') || '/';

  if (path.startsWith(POSTS_PREFIX)) {
    const slug = safeDecode(path.slice(POSTS_PREFIX.length)).trim();
    if (slug) {
      return { name: 'article', slug };
    }
  }

  const search = new URLSearchParams(location.search);
  const legacySlug = search.get('slug');
  if (legacySlug && legacySlug.trim()) {
    return { name: 'article', slug: legacySlug.trim() };
  }

  return {
    name: 'home',
    tag: (search.get('tag') ?? '').trim(),
  };
}

export function buildHomeUrl(tag = ''): string {
  if (!tag) {
    return '/';
  }

  const query = new URLSearchParams();
  query.set('tag', tag);
  return `/?${query.toString()}`;
}

export function buildArticleUrl(slug: string): string {
  return `/posts/${encodeURIComponent(slug)}`;
}
