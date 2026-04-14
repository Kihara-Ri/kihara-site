import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

type ToastTone = 'success' | 'error';

interface ToastState {
  message: string;
  tone: ToastTone;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    tone: 'success',
    visible: false,
  });
  const timeoutRef = useRef<number | null>(null);

  const showToast = (message: string, tone: ToastTone = 'success') => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast({ message, tone, visible: true });

    timeoutRef.current = window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
      timeoutRef.current = null;
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={[
          'global-toast',
          toast.visible ? 'is-visible' : '',
          toast.tone === 'error' ? 'is-error' : 'is-success',
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        <span className="global-toast__dot" aria-hidden="true" />
        <span>{toast.message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
