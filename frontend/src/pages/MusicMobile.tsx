import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type TouchEvent,
} from 'react';
import { flushSync } from 'react-dom';
import layout from '../components/layout/PageLayout.module.css';
import albumData from '../content/music/albums.json';
import { musicHighlights } from '../content/music/highlights';
import type { MusicAlbum, MusicHighlight } from '../content/music/types';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import styles from './MusicMobile.module.css';

const albums = albumData as MusicAlbum[];

type MobileTab = 'collection' | 'recommend';
type PlaybackMode = 'repeat-one' | 'sequence' | 'shuffle';

const playbackModeOrder: PlaybackMode[] = ['sequence', 'repeat-one', 'shuffle'];
const playbackModeLabels: Record<PlaybackMode, string> = {
  'repeat-one': '单曲循环',
  sequence: '顺序播放',
  shuffle: '随机播放',
};
const playbackModeIconSrc: Record<PlaybackMode, string> = {
  'repeat-one': '/icons/UI/repeat.svg',
  sequence: '/icons/UI/sequence.svg',
  shuffle: '/icons/UI/random.svg',
};

const ALBUM_SWIPE_THRESHOLD = 44;

function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return;
  }

  navigator.vibrate(pattern);
}

function getAlbumSortValue(album: MusicAlbum) {
  return new Date(album.purchase.date).getTime();
}

function sortAlbums(albumList: MusicAlbum[]) {
  return albumList
    .map((album, index) => ({ album, index }))
    .sort((left, right) => {
      const sortDiff = getAlbumSortValue(right.album) - getAlbumSortValue(left.album);
      if (sortDiff !== 0) {
        return sortDiff;
      }

      return left.index - right.index;
    })
    .map(({ album }) => album);
}

function buildPalette(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  const hue = hash % 360;
  return {
    start: `hsl(${(hue + 14) % 360} 72% 32%)`,
    end: `hsl(${(hue + 78) % 360} 76% 64%)`,
  };
}

function formatTime(time: number) {
  const safe = Math.max(0, Math.floor(time));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatAlbumNote(note: string | null) {
  if (!note) {
    return [];
  }

  return note
    .split(/\n{2,}/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean).join('\n'))
    .filter(Boolean);
}

function MobileAlbumArt({ album }: { album: MusicAlbum }) {
  const palette = buildPalette(`${album.artist}-${album.title}`);

  return (
    <div
      className={styles.albumArt}
      style={
        {
          '--album-start': palette.start,
          '--album-end': palette.end,
        } as CSSProperties
      }
    >
      {album.cover.file ? (
        <img className={styles.albumArtImage} src={album.cover.file} alt={`${album.title} cover`} />
      ) : (
        <div className={styles.albumArtFallback}>
          <strong>{album.title}</strong>
          <span>{album.artist}</span>
        </div>
      )}
    </div>
  );
}

function MobileHighlightArt({ highlight }: { highlight: MusicHighlight }) {
  const tones = highlight.tones ?? {
    start: '#cbc4b8',
    end: '#6a6258',
    accent: '#27211d',
  };

  return (
    <div
      className={styles.highlightArt}
      style={
        {
          '--highlight-start': tones.start,
          '--highlight-end': tones.end,
          '--highlight-accent': tones.accent,
        } as CSSProperties
      }
    >
      {highlight.cover ? (
        <img className={styles.highlightArtImage} src={highlight.cover.src} alt={highlight.cover.alt} />
      ) : (
        <div className={styles.highlightArtFallback}>
          <strong>{highlight.value}</strong>
          <span>{highlight.meta ?? highlight.label}</span>
        </div>
      )}
    </div>
  );
}

function MusicMobile() {
  const PLAYLIST_ANIMATION_MS = 300;
  const COLLECTION_DETAIL_ANIMATION_MS = 420;
  const [tab, setTab] = useState<MobileTab>('collection');
  const sortedAlbums = useMemo(() => sortAlbums(albums), []);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(sortedAlbums[0]?.id ?? '');
  const [collectionDetailAlbumId, setCollectionDetailAlbumId] = useState<string | null>(null);
  const [collectionDetailVisible, setCollectionDetailVisible] = useState(false);
  const [pendingAlbumId, setPendingAlbumId] = useState<string | null>(null);
  const [albumDragOffset, setAlbumDragOffset] = useState(0);
  const [albumTrackAnimating, setAlbumTrackAnimating] = useState(false);
  const [albumViewerWidth, setAlbumViewerWidth] = useState(0);
  const playableHighlights = useMemo(() => musicHighlights.filter((item) => item.track), []);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string>(playableHighlights[0]?.id ?? '');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('sequence');
  const [playbackModeMenuOpen, setPlaybackModeMenuOpen] = useState(false);
  const [playbackModeHover, setPlaybackModeHover] = useState<PlaybackMode>('sequence');
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [playlistVisible, setPlaylistVisible] = useState(false);
  const albumRailRef = useRef<HTMLDivElement | null>(null);
  const albumThumbRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const albumViewerRef = useRef<HTMLDivElement | null>(null);
  const albumTouchStartXRef = useRef<number | null>(null);
  const albumTouchMovedRef = useRef(false);
  const collectionDetailCloseTimeoutRef = useRef<number | null>(null);
  const preloadedAlbumCoversRef = useRef<Set<string>>(new Set());
  const playbackModeHoldTimeoutRef = useRef<number | null>(null);
  const playbackModePointerDownRef = useRef(false);
  const playlistCloseTimeoutRef = useRef<number | null>(null);
  const {
    activeHighlightId,
    hasSelectedPlayableHighlight,
    isPlayingPreview,
    previewCurrentTime,
    previewDuration,
    loadHighlight,
    togglePlayback,
    startPlayback,
  } = useMusicPlayer();

  const selectedAlbum = sortedAlbums.find((album) => album.id === selectedAlbumId) ?? sortedAlbums[0] ?? null;
  const detailAlbum = collectionDetailAlbumId
    ? sortedAlbums.find((album) => album.id === collectionDetailAlbumId) ?? selectedAlbum
    : null;
  const selectedAlbumIndex = selectedAlbum ? sortedAlbums.findIndex((album) => album.id === selectedAlbum.id) : -1;
  const focusedAlbumId = selectedAlbum?.id ?? '';
  const focusedAlbumIndex = selectedAlbumIndex;
  const previousAlbum = selectedAlbumIndex > 0 ? sortedAlbums[selectedAlbumIndex - 1] : null;
  const nextAlbum = selectedAlbumIndex >= 0 && selectedAlbumIndex < sortedAlbums.length - 1
    ? sortedAlbums[selectedAlbumIndex + 1]
    : null;
  const pendingAlbum = pendingAlbumId
    ? sortedAlbums.find((album) => album.id === pendingAlbumId) ?? null
    : null;
  const pendingAlbumIndex = pendingAlbum ? sortedAlbums.findIndex((album) => album.id === pendingAlbum.id) : -1;
  const albumMoveDirection = pendingAlbumIndex >= 0 && selectedAlbumIndex >= 0
    ? (pendingAlbumIndex > selectedAlbumIndex ? 'next' : 'prev')
    : null;
  const albumViewerOffset = albumViewerWidth || (typeof window !== 'undefined' ? window.innerWidth : 0);
  const selectedHighlight =
    playableHighlights.find((item) => item.id === activeHighlightId)
    ?? playableHighlights.find((item) => item.id === selectedHighlightId)
    ?? playableHighlights[0]
    ?? musicHighlights[0]
    ?? null;
  const progressRatio = previewDuration > 0 ? Math.min(previewCurrentTime / previewDuration, 1) : 0;

  useEffect(() => {
    if (!sortedAlbums.length) {
      return;
    }

    setSelectedAlbumId((current) => (current && sortedAlbums.some((album) => album.id === current) ? current : sortedAlbums[0].id));
    setCollectionDetailAlbumId((current) => {
      if (!current) {
        return current;
      }

      return sortedAlbums.some((album) => album.id === current) ? current : sortedAlbums[0].id;
    });
  }, [sortedAlbums]);

  useEffect(() => {
    if (tab !== 'collection') {
      setCollectionDetailAlbumId(null);
      setCollectionDetailVisible(false);
    }
  }, [tab]);

  useEffect(() => {
    if (!playableHighlights.length) {
      return;
    }

    setSelectedHighlightId((current) => (
      current && playableHighlights.some((item) => item.id === current) ? current : playableHighlights[0].id
    ));
  }, [playableHighlights]);

  useEffect(() => {
    if (!playableHighlights.length || activeHighlightId) {
      return;
    }

    loadHighlight(playableHighlights[0]);
  }, [activeHighlightId, loadHighlight, playableHighlights]);

  useEffect(() => {
    if (tab !== 'collection' || !focusedAlbumId) {
      return;
    }

    const rail = albumRailRef.current;
    const thumb = albumThumbRefs.current[focusedAlbumId];
    if (!rail || !thumb) {
      return;
    }

    const railRect = rail.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const nextLeft = rail.scrollLeft + (thumbRect.left - railRect.left) - (railRect.width - thumbRect.width) / 2;
    rail.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: 'smooth',
    });
  }, [focusedAlbumId, tab]);

  useEffect(() => {
    const viewer = albumViewerRef.current;
    if (!viewer) {
      return;
    }

    const updateWidth = () => {
      setAlbumViewerWidth(viewer.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });
    observer.observe(viewer);
    return () => {
      observer.disconnect();
    };
  }, [tab]);

  useEffect(() => {
    const covers = [selectedAlbum, previousAlbum, nextAlbum]
      .map((album) => album?.cover.file)
      .filter((cover): cover is string => Boolean(cover));

    covers.forEach((cover) => {
      if (preloadedAlbumCoversRef.current.has(cover)) {
        return;
      }

      const image = new Image();
      image.src = cover;
      void image.decode?.().catch(() => undefined);
      preloadedAlbumCoversRef.current.add(cover);
    });
  }, [selectedAlbum, previousAlbum, nextAlbum]);

  useEffect(() => () => {
    if (playbackModeHoldTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeHoldTimeoutRef.current);
    }
  }, []);

  useEffect(() => () => {
    if (playlistCloseTimeoutRef.current !== null) {
      window.clearTimeout(playlistCloseTimeoutRef.current);
    }
  }, []);

  useEffect(() => () => {
    if (collectionDetailCloseTimeoutRef.current !== null) {
      window.clearTimeout(collectionDetailCloseTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (playlistCloseTimeoutRef.current !== null) {
      window.clearTimeout(playlistCloseTimeoutRef.current);
      playlistCloseTimeoutRef.current = null;
    }

    if (playlistOpen) {
      window.requestAnimationFrame(() => {
        setPlaylistVisible(true);
      });
    }
  }, [playlistOpen]);

  useEffect(() => {
    if (!playbackModeMenuOpen) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      event.preventDefault();
      const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const option = target?.closest<HTMLElement>('[data-playback-mode]');
      const value = option?.dataset.playbackMode as PlaybackMode | undefined;
      if (value) {
        setPlaybackModeHover(value);
      }
    };

    const handlePointerUp = () => {
      triggerHaptic(10);
      setPlaybackMode(playbackModeHover);
      playbackModePointerDownRef.current = false;
      closePlaybackModeMenu();
    };

    const handlePointerCancel = () => {
      playbackModePointerDownRef.current = false;
      closePlaybackModeMenu();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    window.addEventListener('pointercancel', handlePointerCancel, { once: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [playbackModeHover, playbackModeMenuOpen]);

  function getPlaybackTarget(direction: 1 | -1) {
    if (!playableHighlights.length) {
      return null;
    }

    const currentIndex = selectedHighlight
      ? playableHighlights.findIndex((item) => item.id === selectedHighlight.id)
      : -1;
    const fallbackIndex = 0;
    const baseIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;

    if (playbackMode === 'repeat-one') {
      return playableHighlights[baseIndex] ?? null;
    }

    if (playbackMode === 'shuffle') {
      if (playableHighlights.length === 1) {
        return playableHighlights[0] ?? null;
      }
      const candidatePool = playableHighlights.filter((item) => item.id !== playableHighlights[baseIndex]?.id);
      return candidatePool[Math.floor(Math.random() * candidatePool.length)] ?? playableHighlights[baseIndex] ?? null;
    }

    const nextIndex = (baseIndex + direction + playableHighlights.length) % playableHighlights.length;
    return playableHighlights[nextIndex] ?? null;
  }

  async function handlePlayToggle() {
    if (!selectedHighlight?.track) {
      return;
    }

    if (!hasSelectedPlayableHighlight) {
      await startPlayback(selectedHighlight);
      return;
    }

    await togglePlayback();
  }

  function handlePlayAdjacent(direction: 1 | -1) {
    const target = getPlaybackTarget(direction);
    if (!target) {
      return;
    }

    triggerHaptic(10);
    setSelectedHighlightId(target.id);
    void startPlayback(target);
  }

  function cyclePlaybackMode() {
    triggerHaptic(10);
    setPlaybackMode((current) => {
      const currentIndex = playbackModeOrder.indexOf(current);
      return playbackModeOrder[(currentIndex + 1) % playbackModeOrder.length] ?? 'sequence';
    });
  }

  function handlePlaybackModePointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    playbackModePointerDownRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (playbackModeHoldTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeHoldTimeoutRef.current);
    }

    playbackModeHoldTimeoutRef.current = window.setTimeout(() => {
      setPlaybackModeHover(playbackMode);
      setPlaybackModeMenuOpen(true);
      playbackModeHoldTimeoutRef.current = null;
    }, 360);
  }

  function closePlaybackModeMenu() {
    setPlaybackModeMenuOpen(false);
    setPlaybackModeHover(playbackMode);
  }

  function openPlaylist() {
    if (playlistCloseTimeoutRef.current !== null) {
      window.clearTimeout(playlistCloseTimeoutRef.current);
      playlistCloseTimeoutRef.current = null;
    }
    triggerHaptic(10);
    setPlaylistOpen(true);
  }

  function closePlaylist() {
    triggerHaptic(8);
    setPlaylistVisible(false);
    if (playlistCloseTimeoutRef.current !== null) {
      window.clearTimeout(playlistCloseTimeoutRef.current);
    }
    playlistCloseTimeoutRef.current = window.setTimeout(() => {
      setPlaylistOpen(false);
      playlistCloseTimeoutRef.current = null;
    }, PLAYLIST_ANIMATION_MS);
  }

  function handlePlaybackModePointerUp() {
    if (playbackModeHoldTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeHoldTimeoutRef.current);
      playbackModeHoldTimeoutRef.current = null;
      playbackModePointerDownRef.current = false;
      cyclePlaybackMode();
      return;
    }

    if (!playbackModeMenuOpen || !playbackModePointerDownRef.current) {
      return;
    }
  }

  function handlePlaybackModePointerCancel() {
    if (playbackModeHoldTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeHoldTimeoutRef.current);
      playbackModeHoldTimeoutRef.current = null;
    }
    playbackModePointerDownRef.current = false;
    closePlaybackModeMenu();
  }

  function resetAlbumInteraction() {
    setPendingAlbumId(null);
    setAlbumDragOffset(0);
    setAlbumTrackAnimating(false);
  }

  function getAlbumViewerWidth() {
    return albumViewerWidth || albumViewerRef.current?.clientWidth || 0;
  }

  function animateAlbumTo(nextAlbumId: string) {
    if (!selectedAlbum || nextAlbumId === selectedAlbum.id) {
      return;
    }

    const nextIndex = sortedAlbums.findIndex((album) => album.id === nextAlbumId);
    if (nextIndex < 0) {
      return;
    }

    const viewerWidth = getAlbumViewerWidth();
    if (viewerWidth <= 0) {
      triggerHaptic(8);
      setSelectedAlbumId(nextAlbumId);
      resetAlbumInteraction();
      return;
    }

    triggerHaptic(8);
    setPendingAlbumId(nextAlbumId);
    setAlbumTrackAnimating(true);
    setAlbumDragOffset(nextIndex > selectedAlbumIndex ? -viewerWidth : viewerWidth);
  }

  function handleAlbumTouchStart(event: TouchEvent<HTMLDivElement>) {
    albumTouchMovedRef.current = false;
    albumTouchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleAlbumTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (albumTouchStartXRef.current === null || !selectedAlbum || albumTrackAnimating) {
      return;
    }

    const currentX = event.changedTouches[0]?.clientX ?? albumTouchStartXRef.current;
    const deltaX = currentX - albumTouchStartXRef.current;

    if (Math.abs(deltaX) < 2) {
      return;
    }

    albumTouchMovedRef.current = true;
    const candidateAlbum = deltaX < 0 ? nextAlbum : previousAlbum;
    if (candidateAlbum) {
      setPendingAlbumId(candidateAlbum.id);
      setAlbumDragOffset(deltaX);
      return;
    }

    setPendingAlbumId(null);
    setAlbumDragOffset(deltaX * 0.22);
  }

  function handleAlbumTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (albumTouchStartXRef.current === null || albumTrackAnimating) {
      albumTouchStartXRef.current = null;
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? albumTouchStartXRef.current;
    const deltaX = endX - albumTouchStartXRef.current;
    albumTouchStartXRef.current = null;
    const candidateAlbum = deltaX < 0 ? nextAlbum : previousAlbum;

    if (Math.abs(deltaX) >= ALBUM_SWIPE_THRESHOLD && candidateAlbum) {
      const viewerWidth = getAlbumViewerWidth();
      if (viewerWidth > 0) {
        triggerHaptic(8);
        setPendingAlbumId(candidateAlbum.id);
        setAlbumTrackAnimating(true);
        setAlbumDragOffset(deltaX < 0 ? -viewerWidth : viewerWidth);
        return;
      }

      triggerHaptic(8);
      setSelectedAlbumId(candidateAlbum.id);
      resetAlbumInteraction();
      return;
    }

    setPendingAlbumId(null);
    setAlbumTrackAnimating(true);
    setAlbumDragOffset(0);
  }

  function openAlbumDetail() {
    if (!selectedAlbum || albumTouchMovedRef.current) {
      albumTouchMovedRef.current = false;
      return;
    }

    if (collectionDetailCloseTimeoutRef.current !== null) {
      window.clearTimeout(collectionDetailCloseTimeoutRef.current);
      collectionDetailCloseTimeoutRef.current = null;
    }
    setCollectionDetailAlbumId(selectedAlbum.id);
    window.requestAnimationFrame(() => {
      setCollectionDetailVisible(true);
    });
  }

  function closeAlbumDetail() {
    setCollectionDetailVisible(false);
    if (collectionDetailCloseTimeoutRef.current !== null) {
      window.clearTimeout(collectionDetailCloseTimeoutRef.current);
    }
    collectionDetailCloseTimeoutRef.current = window.setTimeout(() => {
      setCollectionDetailAlbumId(null);
      collectionDetailCloseTimeoutRef.current = null;
    }, COLLECTION_DETAIL_ANIMATION_MS);
  }

  function handleAlbumTrackTransitionEnd() {
    if (pendingAlbum) {
      flushSync(() => {
        setSelectedAlbumId(pendingAlbum.id);
      });
      window.requestAnimationFrame(() => {
        resetAlbumInteraction();
      });
      return;
    }

    resetAlbumInteraction();
  }

  return (
    <div className={[layout.page, layout.pageWithFooter, styles.page].join(' ')}>
      <main className={styles.shell}>
        <section className={styles.content}>
          <div className={styles.viewStage}>
            <div
              className={styles.viewTrack}
              style={{ transform: `translate3d(${tab === 'collection' ? '0%' : '-50%'}, 0, 0)` }}
            >
              <section className={[styles.viewPane, styles.viewPaneCollection].join(' ')}>
                {selectedAlbum ? (
                  <>
                    <div className={styles.collectionView}>
                      <div className={styles.collectionHero}>
                        <div className={styles.collectionSummaryBar}>
                          <span className={styles.collectionIndexBadge}>
                            {focusedAlbumIndex >= 0 ? `${focusedAlbumIndex + 1} / ${sortedAlbums.length}` : '--'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.collectionViewerButton}
                          onClick={openAlbumDetail}
                          aria-label={`查看 ${selectedAlbum.title} 的详情`}
                        >
                          <div
                            ref={albumViewerRef}
                            className={styles.collectionViewer}
                            onTouchStart={handleAlbumTouchStart}
                            onTouchMove={handleAlbumTouchMove}
                            onTouchEnd={handleAlbumTouchEnd}
                            onTouchCancel={handleAlbumTouchEnd}
                          >
                            <div
                              className={[
                                styles.collectionCardLayer,
                                styles.collectionCardPrev,
                                albumMoveDirection === 'prev' ? styles.collectionCardIncoming : styles.collectionCardBackground,
                                albumTrackAnimating ? styles.collectionCardLayerAnimated : '',
                              ].join(' ').trim()}
                              style={{ transform: `translate3d(${albumDragOffset - albumViewerOffset}px, 0, 0)` }}
                            >
                              <div className={styles.collectionCard}>
                                <MobileAlbumArt album={pendingAlbum && albumDragOffset > 0 ? pendingAlbum : previousAlbum ?? selectedAlbum} />
                              </div>
                            </div>
                            <div
                              className={[
                                styles.collectionCardLayer,
                                styles.collectionCardCurrent,
                                albumMoveDirection ? styles.collectionCardOutgoing : styles.collectionCardForeground,
                                albumTrackAnimating ? styles.collectionCardLayerAnimated : '',
                              ].join(' ').trim()}
                              style={{ transform: `translate3d(${albumDragOffset}px, 0, 0)` }}
                              onTransitionEnd={handleAlbumTrackTransitionEnd}
                            >
                              <div className={styles.collectionCard}>
                                <MobileAlbumArt album={selectedAlbum} />
                              </div>
                            </div>
                            <div
                              className={[
                                styles.collectionCardLayer,
                                styles.collectionCardNext,
                                albumMoveDirection === 'next' ? styles.collectionCardIncoming : styles.collectionCardBackground,
                                albumTrackAnimating ? styles.collectionCardLayerAnimated : '',
                              ].join(' ').trim()}
                              style={{ transform: `translate3d(${albumDragOffset + albumViewerOffset}px, 0, 0)` }}
                            >
                              <div className={styles.collectionCard}>
                                <MobileAlbumArt album={pendingAlbum && albumDragOffset < 0 ? pendingAlbum : nextAlbum ?? selectedAlbum} />
                              </div>
                            </div>
                          </div>
                        </button>
                        <div className={styles.collectionInfo}>
                          <h2 className={styles.collectionTitle}>{selectedAlbum.title}</h2>
                          <p className={styles.collectionArtist}>{selectedAlbum.artist}</p>
                        </div>
                      </div>

                      <div ref={albumRailRef} className={styles.albumRail} aria-label="收藏专辑">
                        {sortedAlbums.map((album) => (
                          <button
                            key={album.id}
                            type="button"
                            ref={(node) => {
                              albumThumbRefs.current[album.id] = node;
                            }}
                            className={[styles.albumThumb, album.id === focusedAlbumId ? styles.albumThumbActive : ''].join(' ').trim()}
                            onClick={() => animateAlbumTo(album.id)}
                            aria-pressed={album.id === focusedAlbumId}
                          >
                            {album.cover.file ? (
                              <img className={styles.albumThumbImage} src={album.cover.file} alt={`${album.title} cover`} loading="lazy" />
                            ) : (
                              <span className={styles.albumThumbFallback}>{album.title.slice(0, 1)}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {detailAlbum ? (
                      <div
                        className={[
                          styles.collectionDetailView,
                          collectionDetailVisible ? styles.collectionDetailViewOpen : styles.collectionDetailViewClosing,
                        ].join(' ').trim()}
                      >
                        <div className={styles.collectionDetailTopbar}>
                          <button
                            type="button"
                            className={styles.collectionDetailBack}
                            onClick={closeAlbumDetail}
                            aria-label="返回收藏页"
                          >
                            <span>返回</span>
                            <span className={styles.collectionDetailBackIcon} aria-hidden="true" />
                          </button>
                          <span className={styles.collectionDetailIndex}>
                            {sortedAlbums.findIndex((album) => album.id === detailAlbum.id) + 1} / {sortedAlbums.length}
                          </span>
                        </div>

                        <div className={styles.collectionDetailBody}>
                          <div className={styles.collectionDetailHero}>
                            <MobileAlbumArt album={detailAlbum} />
                          </div>

                          <section className={styles.collectionDetailHeader}>
                            <h2 className={styles.collectionDetailTitle}>{detailAlbum.title}</h2>
                            <p className={styles.collectionDetailArtist}>{detailAlbum.artist}</p>
                          </section>

                          <section className={styles.collectionDetailMetaSection} aria-label="专辑信息">
                            <div className={styles.collectionDetailMetaGrid}>
                              <div className={styles.collectionDetailMetaCard}>
                                <span className={styles.collectionDetailMetaLabel}>购买时间</span>
                                <strong>{detailAlbum.purchase.display || '未知'}</strong>
                              </div>
                              <div className={styles.collectionDetailMetaCard}>
                                <span className={styles.collectionDetailMetaLabel}>购买地点</span>
                                <strong>{detailAlbum.purchase.location || '未知'}</strong>
                              </div>
                              <div className={styles.collectionDetailMetaCard}>
                                <span className={styles.collectionDetailMetaLabel}>价格</span>
                                <strong>{detailAlbum.purchase.priceText || '未记录'}</strong>
                              </div>
                              <div className={styles.collectionDetailMetaCard}>
                                <span className={styles.collectionDetailMetaLabel}>发行年份</span>
                                <strong>{detailAlbum.releaseYear ?? '未知'}</strong>
                              </div>
                            </div>
                          </section>

                          {detailAlbum.note ? (
                            <section className={styles.collectionDetailNoteSection} aria-label="我的笔记">
                              <div className={styles.collectionDetailSectionHeader}>
                                <p className={styles.collectionDetailSectionEyebrow}>Note</p>
                              </div>

                              <article className={styles.collectionDetailNoteArticle}>
                                {formatAlbumNote(detailAlbum.note).map((paragraph, index) => (
                                  <p key={`${detailAlbum.id}-note-${index}`} className={styles.collectionDetailNoteParagraph}>
                                    {paragraph}
                                  </p>
                                ))}
                              </article>
                            </section>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className={styles.emptyState}>还没有可显示的收藏专辑。</div>
                )}
              </section>

              <section className={[styles.viewPane, styles.viewPaneRecommend].join(' ')}>
                {selectedHighlight ? (
                  <div className={styles.recommendView}>
                    <div className={styles.recommendHero}>
                      <MobileHighlightArt highlight={selectedHighlight} />
                      <div className={styles.recommendInfo}>
                        <p className={styles.recommendLabel}>{selectedHighlight.label}</p>
                        <h2 className={styles.recommendTitle}>{selectedHighlight.value}</h2>
                        <p className={styles.recommendMeta}>{selectedHighlight.meta ?? 'No metadata'}</p>
                      </div>
                    </div>

                    <div className={styles.progressBlock}>
                      <div className={styles.progressHeader}>
                        <span>{formatTime(previewCurrentTime)}</span>
                        <span>{formatTime(previewDuration)}</span>
                      </div>
                      <div className={styles.progressTrack} aria-hidden="true">
                        <span className={styles.progressFill} style={{ transform: `scaleX(${progressRatio})` }} />
                      </div>
                    </div>

                    <div className={styles.transport}>
                      <div
                        className={styles.transportMode}
                        onPointerUp={handlePlaybackModePointerUp}
                        onPointerCancel={handlePlaybackModePointerCancel}
                      >
                        {playbackModeMenuOpen ? (
                          <div className={styles.playbackModeMenu} role="menu" aria-label="播放顺序">
                            {playbackModeOrder.map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                className={[
                                  styles.playbackModeOption,
                                  playbackModeHover === mode ? styles.playbackModeOptionActive : '',
                                ].join(' ').trim()}
                                data-playback-mode={mode}
                                onContextMenu={(event) => event.preventDefault()}
                                onDragStart={(event) => event.preventDefault()}
                              >
                                <img className={styles.playbackModeIcon} src={playbackModeIconSrc[mode]} alt="" aria-hidden="true" />
                                <span>{playbackModeLabels[mode]}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className={[
                            styles.transportButton,
                            playbackModeMenuOpen ? styles.transportButtonToggled : '',
                          ].join(' ').trim()}
                          onPointerDown={handlePlaybackModePointerDown}
                          onContextMenu={(event) => event.preventDefault()}
                          onDragStart={(event) => event.preventDefault()}
                          aria-label={`当前播放顺序：${playbackModeLabels[playbackMode]}`}
                          aria-pressed={playbackModeMenuOpen}
                        >
                          <img className={styles.playbackModeIcon} src={playbackModeIconSrc[playbackMode]} alt="" aria-hidden="true" draggable="false" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className={styles.transportButton}
                        onClick={() => handlePlayAdjacent(-1)}
                        disabled={!selectedHighlight?.track}
                        aria-label="上一首"
                      >
                        <span className={[styles.controlIcon, styles.controlIconPrevious].join(' ')} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={[styles.transportButton, styles.transportButtonPrimary].join(' ')}
                        onClick={() => {
                          triggerHaptic(12);
                          void handlePlayToggle();
                        }}
                        disabled={!selectedHighlight?.track}
                        aria-label={isPlayingPreview ? '暂停' : '播放'}
                      >
                        <span
                          className={[
                            styles.controlIcon,
                            isPlayingPreview ? styles.controlIconPause : styles.controlIconPlay,
                          ].join(' ')}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className={styles.transportButton}
                        onClick={() => handlePlayAdjacent(1)}
                        disabled={!selectedHighlight?.track}
                        aria-label="下一首"
                      >
                        <span className={[styles.controlIcon, styles.controlIconNext].join(' ')} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={[styles.transportButton, playlistOpen ? styles.transportButtonToggled : ''].join(' ').trim()}
                        onClick={() => {
                          if (playlistOpen) {
                            closePlaylist();
                            return;
                          }
                          openPlaylist();
                        }}
                        aria-expanded={playlistOpen}
                        aria-label="播放列表"
                      >
                        <img className={styles.transportListIcon} src="/icons/UI/list.svg" alt="" aria-hidden="true" />
                      </button>
                    </div>
                    {playlistOpen ? (
                      <div
                        className={[
                          styles.mobilePlaylistOverlay,
                          playlistVisible ? styles.mobilePlaylistOverlayVisible : '',
                        ].join(' ').trim()}
                      >
                        <button
                          type="button"
                          className={[
                            styles.mobilePlaylistBackdrop,
                            playlistVisible ? styles.mobilePlaylistBackdropVisible : '',
                          ].join(' ').trim()}
                          onClick={closePlaylist}
                          aria-label="关闭播放列表"
                        />
                        <div
                          className={[
                            styles.mobilePlaylistSheet,
                            playlistVisible ? styles.mobilePlaylistSheetVisible : '',
                          ].join(' ').trim()}
                        >
                          <div className={styles.mobilePlaylistPanel}>
                            <div className={styles.mobilePlaylistHeader}>
                              <p className={styles.mobilePlaylistTitle}>播放列表</p>
                              <button
                                type="button"
                                className={styles.mobilePlaylistClose}
                                onClick={closePlaylist}
                              >
                                收起
                              </button>
                            </div>
                            <div className={styles.mobilePlaylistItems}>
                              {playableHighlights.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  className={[
                                    styles.mobilePlaylistItem,
                                    selectedHighlight?.id === item.id ? styles.mobilePlaylistItemActive : '',
                                  ].join(' ').trim()}
                                  onClick={() => {
                                    triggerHaptic(10);
                                    setSelectedHighlightId(item.id);
                                    void startPlayback(item);
                                    closePlaylist();
                                  }}
                                >
                                  {item.cover ? (
                                    <img
                                      className={styles.mobilePlaylistItemArtwork}
                                      src={item.cover.src}
                                      alt={item.cover.alt}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <span className={styles.mobilePlaylistItemArtworkFallback} aria-hidden="true">
                                      {item.value.slice(0, 1)}
                                    </span>
                                  )}
                                  <span className={styles.mobilePlaylistItemText}>
                                    <strong>{item.track?.title ?? item.value}</strong>
                                    <span>{item.value}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className={styles.emptyState}>还没有可播放的推荐内容。</div>
                )}
              </section>
            </div>
          </div>
        </section>

        <nav className={styles.tabbar} aria-label="音乐页面导航">
          <button
            type="button"
            className={[
              styles.tabButton,
              styles.tabButtonCollection,
              tab === 'collection' ? styles.tabButtonActive : '',
            ].join(' ').trim()}
            onClick={() => setTab('collection')}
            aria-current={tab === 'collection' ? 'page' : undefined}
          >
            <img
              className={[styles.tabIcon, styles.tabIconCollection].join(' ')}
              src="/icons/UI/collection.svg"
              alt=""
              aria-hidden="true"
            />
            <span>收藏</span>
          </button>
          <button
            type="button"
            className={[
              styles.tabButton,
              styles.tabButtonRecommend,
              tab === 'recommend' ? styles.tabButtonActive : '',
            ].join(' ').trim()}
            onClick={() => setTab('recommend')}
            aria-current={tab === 'recommend' ? 'page' : undefined}
          >
            <img
              className={[styles.tabIcon, styles.tabIconRecommend].join(' ')}
              src="/icons/UI/recommendation.svg"
              alt=""
              aria-hidden="true"
            />
            <span>推荐</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

export default MusicMobile;
