import { useCallback, useEffect, useRef, useState } from 'react';
import { BlogArticlePage } from '../pages/BlogArticlePage';
import { BlogHomePage } from '../pages/BlogHomePage';
import { buildArticleUrl, buildHomeUrl, parseRoute, type BlogRoute } from './routes';
import styles from './BlogApp.module.css';

function navigateTo(next: BlogRoute, replace = false) {
  const url = next.name === 'home' ? buildHomeUrl(next.tag) : buildArticleUrl(next.slug);
  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

export function BlogApp() {
  const initialRoute = parseRoute(window.location);
  const [route, setRoute] = useState<BlogRoute>(initialRoute);
  const lastHomeTagRef = useRef(initialRoute.name === 'home' ? initialRoute.tag : '');

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseRoute(window.location);
      if (parsed.name === 'home') {
        lastHomeTagRef.current = parsed.tag;
      }
      setRoute(parsed);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    if (route.name !== 'article') {
      return;
    }

    if (!window.location.pathname.startsWith('/posts/')) {
      navigateTo(route, true);
    }
  }, [route]);

  const openArticle = useCallback((slug: string) => {
    const nextRoute: BlogRoute = { name: 'article', slug };
    navigateTo(nextRoute);
    setRoute(nextRoute);
  }, []);

  const openHome = useCallback((tag: string) => {
    lastHomeTagRef.current = tag;
    const nextRoute: BlogRoute = { name: 'home', tag };
    navigateTo(nextRoute);
    setRoute(nextRoute);
  }, []);

  return (
    <div className={styles.app}>
      {route.name === 'home' ? (
        <BlogHomePage selectedTag={route.tag} onSelectTag={openHome} onOpenArticle={openArticle} />
      ) : (
        <BlogArticlePage
          key={route.slug}
          slug={route.slug}
          onBackHome={() => openHome(lastHomeTagRef.current)}
          onSelectTag={(tag) => openHome(tag)}
        />
      )}
    </div>
  );
}
