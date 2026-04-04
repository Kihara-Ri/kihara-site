// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeToggleOrigin = { x: number; y: number };

interface ViewTransitionLike {
  ready: Promise<void>;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (origin?: ThemeToggleOrigin) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

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
        applyTheme();
        return next;
      }

      const maxRadius = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y),
      );

      const transition = doc.startViewTransition(() => {
        applyTheme();
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${origin.x}px ${origin.y}px)`,
                `circle(${maxRadius}px at ${origin.x}px ${origin.y}px)`,
              ],
            },
            {
              duration: 650,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            } as KeyframeAnimationOptions,
          );
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
