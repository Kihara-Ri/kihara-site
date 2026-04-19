// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";
type ThemeToggleOrigin = { x: number; y: number };

interface ViewTransitionLike {
  ready: Promise<void>;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (origin?: ThemeToggleOrigin) => void;
}

const THEME_ANIMATION_CLASS = 'theme-animating';
const THEME_ANIMATION_MS = 720;

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const themeAnimationTimeoutRef = useRef<number | null>(null);
  const revealAnimationRef = useRef<Animation | null>(null);

  const runThemeAnimation = () => {
    const root = document.documentElement;
    if (themeAnimationTimeoutRef.current !== null) {
      window.clearTimeout(themeAnimationTimeoutRef.current);
    }
    root.classList.add(THEME_ANIMATION_CLASS);
    themeAnimationTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove(THEME_ANIMATION_CLASS);
      themeAnimationTimeoutRef.current = null;
    }, THEME_ANIMATION_MS);
  };

  useEffect(() => {
    return () => {
      if (themeAnimationTimeoutRef.current !== null) {
        window.clearTimeout(themeAnimationTimeoutRef.current);
      }
      revealAnimationRef.current?.cancel();
      revealAnimationRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applySystemTheme = () => {
      const nextTheme: Theme = mediaQuery.matches ? 'dark' : 'light';
      setTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    };

    applySystemTheme();
    mediaQuery.addEventListener('change', applySystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', applySystemTheme);
    };
  }, []);

  const toggleTheme = (origin?: ThemeToggleOrigin) => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";

      const applyTheme = () => {
        document.documentElement.setAttribute("data-theme", next);
      };

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const doc = document as Document & {
        startViewTransition?: (callback: () => void) => ViewTransitionLike;
      };

      if (!origin || prefersReducedMotion || typeof doc.startViewTransition !== 'function') {
        runThemeAnimation();
        applyTheme();
        return next;
      }

      const maxRadius = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y),
      );

      const transition = doc.startViewTransition(() => {
        runThemeAnimation();
        applyTheme();
      });

      transition.ready
        .then(() => {
          revealAnimationRef.current?.cancel();
          revealAnimationRef.current = document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${origin.x}px ${origin.y}px)`,
                `circle(${maxRadius}px at ${origin.x}px ${origin.y}px)`,
              ],
            },
            {
              duration: THEME_ANIMATION_MS,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            } as KeyframeAnimationOptions,
          );
          revealAnimationRef.current.finished
            .catch(() => undefined)
            .finally(() => {
              if (revealAnimationRef.current?.playState === 'finished') {
                revealAnimationRef.current = null;
              }
            });
        })
        .catch(() => {
          applyTheme();
        });

      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
