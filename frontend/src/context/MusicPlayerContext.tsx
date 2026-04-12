import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { musicHighlights } from '../content/music/highlights';
import type { MusicHighlight } from '../content/music/types';

interface MusicPlayerContextValue {
  activeHighlightId: string;
  activeHighlight: MusicHighlight | null;
  playableHighlight: MusicHighlight | null;
  playableHighlights: MusicHighlight[];
  activeHighlightIndex: number;
  hasSelectedPlayableHighlight: boolean;
  isPlayingPreview: boolean;
  tonearmTracking: boolean;
  previewCurrentTime: number;
  previewDuration: number;
  armWobble: 'play' | 'pause' | null;
  loadHighlight: (highlight: MusicHighlight) => void;
  startPlayback: (highlight: MusicHighlight) => Promise<void>;
  togglePlayback: () => Promise<void>;
  playAdjacentHighlight: (direction: 1 | -1) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

function findHighlight(id: string) {
  return musicHighlights.find((item) => item.id === id) ?? null;
}

export function MusicPlayerProvider({ children }: PropsWithChildren) {
  const [activeHighlightId, setActiveHighlightId] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [tonearmTracking, setTonearmTracking] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [armWobble, setArmWobble] = useState<'play' | 'pause' | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const wobbleTimeoutRef = useRef<number | null>(null);
  const playStartTimeoutRef = useRef<number | null>(null);
  const tonearmDelayTimeoutRef = useRef<number | null>(null);
  const tonearmSettleDelayMs = 500;
  const playStartDelayMs = 860;

  const playableHighlights = useMemo(() => musicHighlights.filter((item) => item.track), []);

  const activeHighlight = useMemo<MusicHighlight | null>(() => {
    return findHighlight(activeHighlightId);
  }, [activeHighlightId]);

  const playableHighlight = activeHighlight?.track ? activeHighlight : null;
  const activeHighlightIndex = playableHighlight
    ? playableHighlights.findIndex((item) => item.id === playableHighlight.id)
    : -1;
  const hasSelectedPlayableHighlight = Boolean(playableHighlight?.track);

  const triggerArmWobble = (type: 'play' | 'pause') => {
    if (wobbleTimeoutRef.current) {
      window.clearTimeout(wobbleTimeoutRef.current);
    }
    setArmWobble(null);
    window.requestAnimationFrame(() => {
      setArmWobble(type);
      wobbleTimeoutRef.current = window.setTimeout(() => {
        setArmWobble(null);
        wobbleTimeoutRef.current = null;
      }, 720);
    });
  };

  const queueAudioPlayback = (audio: HTMLAudioElement) => {
    if (playStartTimeoutRef.current) {
      window.clearTimeout(playStartTimeoutRef.current);
    }
    if (tonearmDelayTimeoutRef.current) {
      window.clearTimeout(tonearmDelayTimeoutRef.current);
      tonearmDelayTimeoutRef.current = null;
    }

    setIsPlayingPreview(false);
    setTonearmTracking(false);

    tonearmDelayTimeoutRef.current = window.setTimeout(() => {
      setTonearmTracking(true);
      triggerArmWobble('play');
      tonearmDelayTimeoutRef.current = null;
    }, tonearmSettleDelayMs);

    playStartTimeoutRef.current = window.setTimeout(() => {
      void audio.play().catch(() => {
        setIsPlayingPreview(false);
        setTonearmTracking(false);
      });
      playStartTimeoutRef.current = null;
    }, playStartDelayMs);
  };

  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio) {
      return;
    }

    const handlePlay = () => {
      setIsPlayingPreview(true);
    };
    const handlePause = () => {
      setIsPlayingPreview(false);
      setTonearmTracking(false);
      if (playStartTimeoutRef.current) {
        window.clearTimeout(playStartTimeoutRef.current);
        playStartTimeoutRef.current = null;
      }
      if (tonearmDelayTimeoutRef.current) {
        window.clearTimeout(tonearmDelayTimeoutRef.current);
        tonearmDelayTimeoutRef.current = null;
      }
      triggerArmWobble('pause');
    };
    const handleEnded = () => {
      setIsPlayingPreview(false);
      setTonearmTracking(false);
      setPreviewCurrentTime(0);
      if (tonearmDelayTimeoutRef.current) {
        window.clearTimeout(tonearmDelayTimeoutRef.current);
        tonearmDelayTimeoutRef.current = null;
      }
      triggerArmWobble('pause');
    };
    const handleTimeUpdate = () => setPreviewCurrentTime(audio.currentTime || 0);
    const handleLoadedMetadata = () => {
      setPreviewDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setPreviewCurrentTime(audio.currentTime || 0);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (wobbleTimeoutRef.current) {
        window.clearTimeout(wobbleTimeoutRef.current);
      }
      if (playStartTimeoutRef.current) {
        window.clearTimeout(playStartTimeoutRef.current);
      }
      if (tonearmDelayTimeoutRef.current) {
        window.clearTimeout(tonearmDelayTimeoutRef.current);
      }
    };
  }, []);

  const loadHighlight = (highlight: MusicHighlight) => {
    if (!highlight.track || !previewAudioRef.current) {
      return;
    }

    const audio = previewAudioRef.current;
    if (!audio.paused) {
      audio.pause();
    }
    setActiveHighlightId(highlight.id);
    if (audio.src !== highlight.track.previewUrl) {
      audio.src = highlight.track.previewUrl;
      audio.load();
    }
    audio.currentTime = 0;
    setPreviewCurrentTime(0);
    setPreviewDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    setIsPlayingPreview(false);
    setTonearmTracking(false);
  };

  const startPlayback = async (highlight: MusicHighlight) => {
    if (!highlight.track || !previewAudioRef.current) {
      return;
    }

    const audio = previewAudioRef.current;
    setActiveHighlightId(highlight.id);
    if (audio.src !== highlight.track.previewUrl) {
      audio.src = highlight.track.previewUrl;
    }
    audio.currentTime = 0;
    setPreviewCurrentTime(0);
    setPreviewDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    queueAudioPlayback(audio);
  };

  const togglePlayback = async () => {
    if (!previewAudioRef.current || !playableHighlight?.track) {
      return;
    }

    const audio = previewAudioRef.current;
    if (audio.paused) {
      queueAudioPlayback(audio);
      return;
    }

    audio.pause();
  };

  const playAdjacentHighlight = (direction: 1 | -1) => {
    if (!playableHighlights.length) {
      return;
    }

    const fallbackIndex = 0;
    const nextIndex =
      activeHighlightIndex >= 0
        ? (activeHighlightIndex + direction + playableHighlights.length) % playableHighlights.length
        : fallbackIndex;
    const nextHighlight = playableHighlights[nextIndex];
    if (nextHighlight) {
      void startPlayback(nextHighlight);
    }
  };

  const value = useMemo<MusicPlayerContextValue>(() => ({
    activeHighlightId,
    activeHighlight,
    playableHighlight,
    playableHighlights,
    activeHighlightIndex,
    hasSelectedPlayableHighlight,
    isPlayingPreview,
    tonearmTracking,
    previewCurrentTime,
    previewDuration,
    armWobble,
    loadHighlight,
    startPlayback,
    togglePlayback,
    playAdjacentHighlight,
  }), [
    activeHighlightId,
    activeHighlight,
    playableHighlight,
    playableHighlights,
    activeHighlightIndex,
    hasSelectedPlayableHighlight,
    isPlayingPreview,
    tonearmTracking,
    previewCurrentTime,
    previewDuration,
    armWobble,
    loadHighlight,
  ]);

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio ref={previewAudioRef} preload="none" />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}
