import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal, flushSync } from 'react-dom';
import RecordPlayer from '../components/music/RecordPlayer';
import layout from '../components/layout/PageLayout.module.css';
import albumData from '../content/music/albums.json';
import { musicHighlights } from '../content/music/highlights';
import type { MusicAlbum, MusicHighlight } from '../content/music/types';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import styles from './Music.module.css';

const albums = albumData as MusicAlbum[];

interface FilterOption {
  value: string;
  label: string;
}

type AlbumSortMode = 'purchase-date' | 'release-year';

interface AlbumSortMove {
  albumId: string;
  fromIndex: number;
  toIndex: number;
  nextOrderIds: string[];
}

function getAlbumSortValue(album: MusicAlbum, mode: AlbumSortMode) {
  if (mode === 'purchase-date') {
    return new Date(album.purchase.date).getTime();
  }

  return album.releaseYear ?? Number.NEGATIVE_INFINITY;
}

function sortAlbums(albumList: MusicAlbum[], mode: AlbumSortMode) {
  return albumList
    .map((album, index) => ({ album, index }))
    .sort((left, right) => {
      const sortDiff = getAlbumSortValue(right.album, mode) - getAlbumSortValue(left.album, mode);
      if (sortDiff !== 0) {
        return sortDiff;
      }

      return left.index - right.index;
    })
    .map(({ album }) => album);
}

function getLongestIncreasingSubsequenceIndices(sequence: number[]) {
  const predecessors = new Array<number>(sequence.length).fill(-1);
  const tails: number[] = [];

  for (let index = 0; index < sequence.length; index += 1) {
    const value = sequence[index];
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const middle = Math.floor((left + right) / 2);
      if (sequence[tails[middle]] < value) {
        left = middle + 1;
      } else {
        right = middle;
      }
    }

    if (left > 0) {
      predecessors[index] = tails[left - 1];
    }

    tails[left] = index;
  }

  const lis: number[] = [];
  let cursor = tails[tails.length - 1];

  while (cursor !== undefined && cursor !== -1) {
    lis.push(cursor);
    cursor = predecessors[cursor];
  }

  return lis.reverse();
}

function buildAlbumSortMoves(currentOrderIds: string[], targetOrderIds: string[]) {
  const targetIndexById = new Map(targetOrderIds.map((id, index) => [id, index]));
  const lisIndices = getLongestIncreasingSubsequenceIndices(
    currentOrderIds.map((id) => targetIndexById.get(id) ?? -1),
  );
  const anchoredIds = new Set(lisIndices.map((index) => currentOrderIds[index]));
  const workingOrderIds = [...currentOrderIds];
  const moves: AlbumSortMove[] = [];

  for (let targetIndex = 0; targetIndex < targetOrderIds.length; targetIndex += 1) {
    const desiredAlbumId = targetOrderIds[targetIndex];
    if (anchoredIds.has(desiredAlbumId)) {
      continue;
    }

    const currentIndex = workingOrderIds.indexOf(desiredAlbumId);
    if (currentIndex === -1 || currentIndex === targetIndex) {
      continue;
    }

    const [movedAlbumId] = workingOrderIds.splice(currentIndex, 1);
    workingOrderIds.splice(targetIndex, 0, movedAlbumId);
    moves.push({
      albumId: desiredAlbumId,
      fromIndex: currentIndex,
      toIndex: targetIndex,
      nextOrderIds: [...workingOrderIds],
    });
  }

  return moves;
}

function buildPalette(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  const hue = hash % 360;
  return {
    spine: `hsl(${hue} 56% 44%)`,
    coverStart: `hsl(${(hue + 16) % 360} 72% 30%)`,
    coverEnd: `hsl(${(hue + 84) % 360} 74% 60%)`,
    accent: `hsl(${(hue + 148) % 360} 82% 70%)`,
  };
}

function AlbumCover({ album, expanded = false }: { album: MusicAlbum; expanded?: boolean }) {
  const palette = buildPalette(`${album.artist}-${album.title}`);
  const titleLength = album.title.length;
  const spineTitleClassName = [
    styles.albumSpineTitle,
    titleLength >= 22 ? styles.albumSpineTitleTiny : '',
    titleLength >= 14 && titleLength < 22 ? styles.albumSpineTitleSmall : '',
  ].join(' ').trim();

  return (
    <div
      className={[styles.albumCase, expanded ? styles.albumCaseExpanded : ''].join(' ').trim()}
      style={
        {
          '--album-spine': palette.spine,
          '--album-cover-start': palette.coverStart,
          '--album-cover-end': palette.coverEnd,
          '--album-accent': palette.accent,
        } as CSSProperties
      }
    >
      <div
        className={styles.albumSpine}
        style={album.cover.file ? ({ '--album-spine-image': `url(${album.cover.file})` } as CSSProperties) : undefined}
      >
        <span className={spineTitleClassName}>{album.title}</span>
        <span className={styles.albumSpineArtist}>{album.artist}</span>
      </div>
      <div className={styles.albumFront}>
        <div className={styles.albumArtwork}>
          {album.cover.file ? (
            <>
              <img className={styles.albumImage} src={album.cover.file} alt={`${album.title} cover`} loading="lazy" />
              <div className={styles.albumImageOverlay} />
            </>
          ) : (
            <>
              <div className={styles.albumHalo} />
              <div className={styles.albumDisc} />
              <div className={styles.albumLabelBlock}>
                <strong>{album.title}</strong>
                <span>{album.artist}</span>
              </div>
              <span className={styles.coverMissingBadge}>封面待补</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalAlbumArtwork({ album }: { album: MusicAlbum }) {
  const palette = buildPalette(`${album.artist}-${album.title}`);

  return (
    <div
      className={styles.modalArtwork}
      style={
        {
          '--album-cover-start': palette.coverStart,
          '--album-cover-end': palette.coverEnd,
          '--album-accent': palette.accent,
        } as CSSProperties
      }
    >
      {album.cover.file ? (
        <>
          <img className={styles.albumImage} src={album.cover.file} alt={`${album.title} cover`} />
          <div className={styles.albumImageOverlay} />
        </>
      ) : (
        <>
          <div className={styles.albumHalo} />
          <div className={styles.albumDisc} />
          <div className={styles.albumLabelBlock}>
            <strong>{album.title}</strong>
            <span>{album.artist}</span>
          </div>
          <span className={styles.coverMissingBadge}>封面待补</span>
        </>
      )}
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  compactTrigger = false,
  compactMenu = false,
  disabled = false,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (nextValue: string) => void;
  compactTrigger?: boolean;
  compactMenu?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.filterField}>
      <span>{label}</span>
      <div className={styles.filterDropdown}>
        <button
          type="button"
          className={[
            styles.filterTrigger,
            compactTrigger ? styles.filterTriggerCompact : '',
            open ? styles.filterTriggerOpen : '',
          ].join(' ').trim()}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{selectedOption?.label ?? label}</span>
        </button>

        {open ? (
          <ul
            className={[
              styles.filterMenu,
              compactMenu ? styles.filterMenuCompact : '',
            ].join(' ').trim()}
            role="listbox"
            aria-label={label}
          >
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={[
                    styles.filterOption,
                    option.value === value ? styles.filterOptionSelected : '',
                  ].join(' ').trim()}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<MusicAlbum | null>(null);
  const [pullingAlbumId, setPullingAlbumId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [artistFilter, setArtistFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortMode, setSortMode] = useState<AlbumSortMode>('purchase-date');
  const [displayedAlbumOrderIds, setDisplayedAlbumOrderIds] = useState<string[]>(() =>
    sortAlbums(albums, 'purchase-date').map((album) => album.id),
  );
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);
  const [expandRightAlbumId, setExpandRightAlbumId] = useState<string | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightLaunchingId, setSpotlightLaunchingId] = useState<string | null>(null);
  const [sortingAlbumId, setSortingAlbumId] = useState<string | null>(null);
  const [sortingInProgress, setSortingInProgress] = useState(false);
  const [turntableOutgoingHighlight, setTurntableOutgoingHighlight] = useState<MusicHighlight | null>(null);
  const [turntableRecordEntering, setTurntableRecordEntering] = useState(false);
  const [turntableRecordExiting, setTurntableRecordExiting] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [playlistPanelStyle, setPlaylistPanelStyle] = useState<CSSProperties | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const albumButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const playlistRef = useRef<HTMLDivElement | null>(null);
  const playlistButtonRef = useRef<HTMLButtonElement | null>(null);
  const spotlightLaunchTimeoutRef = useRef<number | null>(null);
  const turntableSwapTimeoutRef = useRef<number | null>(null);
  const turntableEnterTimeoutRef = useRef<number | null>(null);
  const closeModalTimeoutRef = useRef<number | null>(null);
  const shelfWheelAnimationFrameRef = useRef<number | null>(null);
  const shelfWheelTargetRef = useRef(0);
  const displayedAlbumOrderIdsRef = useRef(displayedAlbumOrderIds);
  const sortAnimationTimeoutsRef = useRef<number[]>([]);
  const {
    activeHighlightId,
    activeHighlight,
    playableHighlight,
    playableHighlights,
    hasSelectedPlayableHighlight,
    isPlayingPreview,
    tonearmTracking,
    previewCurrentTime,
    previewDuration,
    armWobble,
    startPlayback,
    togglePlayback,
    playAdjacentHighlight,
  } = useMusicPlayer();

  const syncShelfWheelTarget = (force = false) => {
    const rail = railRef.current;
    if (!rail) {
      shelfWheelTargetRef.current = 0;
      return;
    }

    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, rail.scrollLeft));
    if (clampedScrollLeft !== rail.scrollLeft) {
      rail.scrollLeft = clampedScrollLeft;
    }

    if (force || shelfWheelAnimationFrameRef.current === null) {
      shelfWheelTargetRef.current = clampedScrollLeft;
    }
  };

  const stopShelfWheelAnimation = (syncToCurrent = false) => {
    if (shelfWheelAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(shelfWheelAnimationFrameRef.current);
      shelfWheelAnimationFrameRef.current = null;
    }

    if (syncToCurrent) {
      syncShelfWheelTarget(true);
    }
  };

  useEffect(() => {
    displayedAlbumOrderIdsRef.current = displayedAlbumOrderIds;
    stopShelfWheelAnimation(true);
  }, [displayedAlbumOrderIds]);

  useEffect(() => {
    if (!selectedAlbum) {
      return;
    }

    if (closeModalTimeoutRef.current !== null) {
      window.clearTimeout(closeModalTimeoutRef.current);
      closeModalTimeoutRef.current = null;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    setModalVisible(false);
    const frameId = window.requestAnimationFrame(() => {
      setModalVisible(true);
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedAlbum(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAlbum]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const normalizeWheelDelta = (event: WheelEvent) => {
      switch (event.deltaMode) {
        case 1:
          return event.deltaY * 18;
        case 2:
          return event.deltaY * rail.clientWidth * 0.92;
        default:
          return event.deltaY;
      }
    };
    const animateWheelScroll = () => {
      const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const clampedTarget = Math.max(0, Math.min(maxScrollLeft, shelfWheelTargetRef.current));
      if (clampedTarget !== shelfWheelTargetRef.current) {
        shelfWheelTargetRef.current = clampedTarget;
      }

      const distance = clampedTarget - rail.scrollLeft;
      if (Math.abs(distance) < 0.5) {
        rail.scrollLeft = clampedTarget;
        shelfWheelAnimationFrameRef.current = null;
        return;
      }

      rail.scrollLeft += distance * 0.16;
      shelfWheelAnimationFrameRef.current = window.requestAnimationFrame(animateWheelScroll);
    };
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        return;
      }

      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        stopShelfWheelAnimation(true);
        return;
      }

      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      if (maxScrollLeft <= 0) {
        return;
      }

      event.preventDefault();

      const baseScrollLeft =
        shelfWheelAnimationFrameRef.current === null ? rail.scrollLeft : shelfWheelTargetRef.current;
      const nextTarget = Math.max(0, Math.min(maxScrollLeft, baseScrollLeft + normalizeWheelDelta(event)));

      if (prefersReducedMotion) {
        rail.scrollLeft = nextTarget;
        shelfWheelTargetRef.current = nextTarget;
        return;
      }

      shelfWheelTargetRef.current = nextTarget;
      if (shelfWheelAnimationFrameRef.current === null) {
        shelfWheelAnimationFrameRef.current = window.requestAnimationFrame(animateWheelScroll);
      }
    };
    const handlePointerDown = () => {
      stopShelfWheelAnimation(true);
    };
    const handleScroll = () => {
      syncShelfWheelTarget();
    };
    const handleViewportChange = () => {
      stopShelfWheelAnimation(true);
    };
    const resizeObserver = new ResizeObserver(() => {
      stopShelfWheelAnimation(true);
    });

    syncShelfWheelTarget(true);
    resizeObserver.observe(rail);
    rail.addEventListener('wheel', handleWheel, { passive: false });
    rail.addEventListener('scroll', handleScroll, { passive: true });
    rail.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('resize', handleViewportChange);
    return () => {
      resizeObserver.disconnect();
      stopShelfWheelAnimation();
      rail.removeEventListener('wheel', handleWheel);
      rail.removeEventListener('scroll', handleScroll);
      rail.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!playlistOpen) {
      setPlaylistPanelStyle(null);
      return;
    }

    const updatePlaylistPosition = () => {
      const button = playlistButtonRef.current;
      if (!button) {
        return;
      }

      const buttonRect = button.getBoundingClientRect();
      const viewportPadding = 16;
      const gap = 12;
      const panelWidth = Math.min(280, window.innerWidth - viewportPadding * 2);
      const panelHeight = playlistRef.current?.offsetHeight ?? 320;
      const left = Math.min(
        window.innerWidth - panelWidth - viewportPadding,
        Math.max(viewportPadding, buttonRect.right - panelWidth),
      );
      const preferredTop = buttonRect.top - panelHeight - gap;
      const fallbackTop = buttonRect.bottom + gap;
      const top = preferredTop >= viewportPadding
        ? preferredTop
        : Math.min(
            window.innerHeight - panelHeight - viewportPadding,
            Math.max(viewportPadding, fallbackTop),
          );

      setPlaylistPanelStyle({
        top,
        left,
        width: panelWidth,
        maxHeight: Math.min(360, window.innerHeight - viewportPadding * 2),
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (playlistRef.current?.contains(target) || playlistButtonRef.current?.contains(target)) {
        return;
      }

      if (!playlistRef.current?.contains(target)) {
        setPlaylistOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPlaylistOpen(false);
      }
    };

    const frameId = window.requestAnimationFrame(updatePlaylistPosition);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePlaylistPosition);
    window.addEventListener('scroll', updatePlaylistPosition, true);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePlaylistPosition);
      window.removeEventListener('scroll', updatePlaylistPosition, true);
    };
  }, [playlistOpen]);

  useEffect(() => {
    return () => {
      sortAnimationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      sortAnimationTimeoutsRef.current = [];
      if (spotlightLaunchTimeoutRef.current) {
        window.clearTimeout(spotlightLaunchTimeoutRef.current);
        spotlightLaunchTimeoutRef.current = null;
      }
      if (turntableSwapTimeoutRef.current) {
        window.clearTimeout(turntableSwapTimeoutRef.current);
        turntableSwapTimeoutRef.current = null;
      }
      if (turntableEnterTimeoutRef.current) {
        window.clearTimeout(turntableEnterTimeoutRef.current);
        turntableEnterTimeoutRef.current = null;
      }
      if (closeModalTimeoutRef.current) {
        window.clearTimeout(closeModalTimeoutRef.current);
        closeModalTimeoutRef.current = null;
      }
    };
  }, []);

  const updateAlbumExpansion = (albumId: string, element: HTMLButtonElement) => {
    const rail = railRef.current;
    if (!rail) {
      setExpandedAlbumId(albumId);
      setExpandRightAlbumId(null);
      return;
    }

    const buttonRect = element.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    const coverWidth = 248;
    const guard = 28;
    const availableLeft = buttonRect.left - railRect.left;
    const shouldExpandRight = availableLeft < coverWidth - buttonRect.width + guard;

    setExpandedAlbumId(albumId);
    setExpandRightAlbumId(shouldExpandRight ? albumId : null);
  };

  const clearAlbumExpansion = (albumId: string) => {
    if (pullingAlbumId === albumId) {
      return;
    }
    setExpandedAlbumId((current) => (current === albumId ? null : current));
    setExpandRightAlbumId((current) => (current === albumId ? null : current));
  };

  const closeModal = () => {
    setModalVisible(false);
    if (closeModalTimeoutRef.current !== null) {
      window.clearTimeout(closeModalTimeoutRef.current);
    }
    closeModalTimeoutRef.current = window.setTimeout(() => {
      setSelectedAlbum(null);
      closeModalTimeoutRef.current = null;
    }, 180);
  };

  const artistOptions = useMemo(() => {
    return Array.from(new Set(albums.map((album) => album.artist))).sort((left, right) =>
      left.localeCompare(right, 'ja'),
    );
  }, []);

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        albums
          .map((album) => album.releaseYear)
          .filter((year): year is number => typeof year === 'number'),
      ),
    ).sort((left, right) => right - left);
  }, []);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const artistMatched = artistFilter === 'all' || album.artist === artistFilter;
      const yearMatched = yearFilter === 'all' || String(album.releaseYear) === yearFilter;
      return artistMatched && yearMatched;
    });
  }, [artistFilter, yearFilter]);
  const hasActiveFilter = artistFilter !== 'all' || yearFilter !== 'all';

  const artistFilterOptions = useMemo<FilterOption[]>(() => {
    return [{ value: 'all', label: '全部' }, ...artistOptions.map((artist) => ({ value: artist, label: artist }))];
  }, [artistOptions]);

  const yearFilterOptions = useMemo<FilterOption[]>(() => {
    return [{ value: 'all', label: '全部' }, ...yearOptions.map((year) => ({ value: String(year), label: String(year) }))];
  }, [yearOptions]);

  const filteredAlbumMap = useMemo(() => {
    return new Map(filteredAlbums.map((album) => [album.id, album]));
  }, [filteredAlbums]);

  const displayedAlbums = useMemo(() => {
    return displayedAlbumOrderIds
      .map((albumId) => filteredAlbumMap.get(albumId))
      .filter((album): album is MusicAlbum => Boolean(album));
  }, [displayedAlbumOrderIds, filteredAlbumMap]);

  const sortModeLabel = sortMode === 'purchase-date' ? '购入时间' : '专辑年份';

  useEffect(() => {
    if (sortingInProgress) {
      return;
    }

    setDisplayedAlbumOrderIds(sortAlbums(filteredAlbums, sortMode).map((album) => album.id));
  }, [filteredAlbums, sortMode, sortingInProgress]);

  const spotlightHighlight = musicHighlights[spotlightIndex] ?? musicHighlights[0] ?? null;
  const displayedTurntableHighlight = turntableRecordExiting ? null : activeHighlight;

  const measureAlbumRects = (albumIds: string[]) => {
    return new Map(
      albumIds
        .map((albumId) => {
          const element = albumButtonRefs.current.get(albumId);
          return element ? ([albumId, element.getBoundingClientRect()] as const) : null;
        })
        .filter((entry): entry is readonly [string, DOMRect] => Boolean(entry)),
    );
  };

  const clearAlbumTransforms = (albumIds: string[]) => {
    albumIds.forEach((albumId) => {
      const element = albumButtonRefs.current.get(albumId);
      if (!element) {
        return;
      }

      element.style.transition = '';
      element.style.transform = '';
      element.style.zIndex = '';
    });
  };

  const waitForSortFrame = (durationMs: number) =>
    new Promise<void>((resolve) => {
      const timeoutId = window.setTimeout(() => {
        sortAnimationTimeoutsRef.current = sortAnimationTimeoutsRef.current.filter((value) => value !== timeoutId);
        resolve();
      }, durationMs);
      sortAnimationTimeoutsRef.current.push(timeoutId);
    });

  const animateAlbumSortMove = async ({ albumId, nextOrderIds }: AlbumSortMove) => {
    const liftOffsetY = -40;
    const liftDurationMs = 90;
    const repositionDurationMs = 150;
    const settleDurationMs = 90;
    const liftedElement = albumButtonRefs.current.get(albumId);
    if (liftedElement) {
      liftedElement.style.transition = `transform ${liftDurationMs}ms cubic-bezier(0.2, 0.82, 0.22, 1)`;
      liftedElement.style.transform = `translateY(${liftOffsetY}px) scale(1.05) rotate(-1.8deg)`;
      liftedElement.style.zIndex = '10';
    }

    setSortingAlbumId(albumId);
    await waitForSortFrame(liftDurationMs);

    const previousRects = measureAlbumRects(displayedAlbumOrderIdsRef.current);
    flushSync(() => {
      setDisplayedAlbumOrderIds(nextOrderIds);
    });

    window.requestAnimationFrame(() => {
      const nextRects = measureAlbumRects(nextOrderIds);

      nextOrderIds.forEach((currentAlbumId) => {
        const element = albumButtonRefs.current.get(currentAlbumId);
        const previousRect = previousRects.get(currentAlbumId);
        const nextRect = nextRects.get(currentAlbumId);
        if (!element || !previousRect || !nextRect) {
          return;
        }

        const deltaX = previousRect.left - nextRect.left;
        const deltaY = previousRect.top - nextRect.top;
        const initialTransform =
          currentAlbumId === albumId
            ? `translate(${deltaX}px, ${deltaY + liftOffsetY}px) scale(1.05) rotate(-1.8deg)`
            : `translate(${deltaX}px, ${deltaY}px)`;
        const restingTransform =
          currentAlbumId === albumId ? `translateY(${liftOffsetY}px) scale(1.05) rotate(-1.8deg)` : 'translate(0px, 0px)';

        element.style.transition = 'none';
        element.style.transform = initialTransform;
        if (currentAlbumId === albumId) {
          element.style.zIndex = '10';
        }
        void element.getBoundingClientRect();
        window.requestAnimationFrame(() => {
          element.style.transition = `transform ${repositionDurationMs}ms cubic-bezier(0.2, 0.82, 0.22, 1)`;
          element.style.transform = restingTransform;
        });
      });
    });

    await waitForSortFrame(repositionDurationMs);

    const movedElement = albumButtonRefs.current.get(albumId);
    if (movedElement) {
      movedElement.style.transition = `transform ${settleDurationMs}ms cubic-bezier(0.2, 0.82, 0.22, 1)`;
      movedElement.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
    }

    await waitForSortFrame(settleDurationMs);
    clearAlbumTransforms(nextOrderIds);
    setSortingAlbumId(null);
  };

  const handleSortModeChange = async (nextMode: AlbumSortMode) => {
    if (sortingInProgress || nextMode === sortMode) {
      return;
    }

    stopShelfWheelAnimation(true);
    const nextSortedIds = sortAlbums(filteredAlbums, nextMode).map((album) => album.id);
    const currentOrderIds = displayedAlbumOrderIdsRef.current;
    const moves = buildAlbumSortMoves(currentOrderIds, nextSortedIds);

    setSortMode(nextMode);
    if (moves.length === 0) {
      setDisplayedAlbumOrderIds(nextSortedIds);
      return;
    }

    setSortingInProgress(true);
    try {
      for (const move of moves) {
        await animateAlbumSortMove(move);
      }
      setDisplayedAlbumOrderIds(nextSortedIds);
    } finally {
      clearAlbumTransforms(nextSortedIds);
      setSortingAlbumId(null);
      setSortingInProgress(false);
    }
  };

  const playHighlightFromSpotlight = (highlight: MusicHighlight) => {
    if (!highlight.track || spotlightLaunchingId) {
      return;
    }

    const extractDuration = 360;
    const exitDuration = activeHighlight?.cover?.src && activeHighlight.id !== highlight.id ? 620 : 0;
    const enterDuration = 820;
    const outgoingHighlight = activeHighlight?.cover?.src && activeHighlight.id !== highlight.id ? activeHighlight : null;

    setSpotlightLaunchingId(highlight.id);
    setTurntableRecordEntering(false);

    if (spotlightLaunchTimeoutRef.current) {
      window.clearTimeout(spotlightLaunchTimeoutRef.current);
    }
    if (turntableSwapTimeoutRef.current) {
      window.clearTimeout(turntableSwapTimeoutRef.current);
    }
    if (turntableEnterTimeoutRef.current) {
      window.clearTimeout(turntableEnterTimeoutRef.current);
    }

    spotlightLaunchTimeoutRef.current = window.setTimeout(() => {
      spotlightLaunchTimeoutRef.current = null;

      if (outgoingHighlight) {
        setTurntableOutgoingHighlight(outgoingHighlight);
        setTurntableRecordExiting(true);
        turntableSwapTimeoutRef.current = window.setTimeout(() => {
          setTurntableRecordExiting(false);
          setTurntableOutgoingHighlight(null);
          setTurntableRecordEntering(true);
          void startPlayback(highlight);
          setSpotlightLaunchingId(null);
          turntableSwapTimeoutRef.current = null;

          turntableEnterTimeoutRef.current = window.setTimeout(() => {
            setTurntableRecordEntering(false);
            turntableEnterTimeoutRef.current = null;
          }, enterDuration);
        }, exitDuration);
        return;
      }

      setTurntableOutgoingHighlight(null);
      setTurntableRecordExiting(false);
      setTurntableRecordEntering(true);
      void startPlayback(highlight);
      setSpotlightLaunchingId(null);

      turntableEnterTimeoutRef.current = window.setTimeout(() => {
        setTurntableRecordEntering(false);
        turntableEnterTimeoutRef.current = null;
      }, enterDuration);
    }, extractDuration);
  };

  const formatTime = (time: number) => {
    const safe = Math.max(0, Math.floor(time));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const progressRatio = previewDuration > 0 ? Math.min(previewCurrentTime / previewDuration, 1) : 0;
  const tonearmAngle = tonearmTracking ? 24 + progressRatio * 34 : 0;

  return (
    <>
      <div className={[layout.page, layout.pageWithFooter, styles.page].join(' ')}>
        <main className={styles.main}>
          <section className={styles.shelfSection} aria-label="CD shelf">
            <div className={styles.shelfHeader}>
              <div className={styles.shelfHeaderLead}>
                <h2 className={styles.shelfTitle}>
                  <span>My Collection</span>
                  <span className={styles.shelfCount}>{filteredAlbums.length}</span>
                </h2>

                <div className={styles.sortControl}>
                  <div
                    className={styles.sortSegmented}
                    style={
                      {
                        '--sort-thumb-index': sortMode === 'purchase-date' ? 0 : 1,
                      } as CSSProperties
                    }
                    role="tablist"
                    aria-label="专辑排序方式"
                  >
                    <span className={styles.sortSegmentedThumb} aria-hidden="true" />
                    <button
                      type="button"
                      role="tab"
                      aria-selected={sortMode === 'purchase-date'}
                      className={[
                        styles.sortSegmentedOption,
                        sortMode === 'purchase-date' ? styles.sortSegmentedOptionActive : '',
                      ].join(' ').trim()}
                      onClick={() => void handleSortModeChange('purchase-date')}
                      disabled={sortingInProgress}
                    >
                      购入时间
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={sortMode === 'release-year'}
                      className={[
                        styles.sortSegmentedOption,
                        sortMode === 'release-year' ? styles.sortSegmentedOptionActive : '',
                      ].join(' ').trim()}
                      onClick={() => void handleSortModeChange('release-year')}
                      disabled={sortingInProgress}
                    >
                      专辑年份
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.filterBar}>
                <FilterDropdown
                  label="艺术家"
                  value={artistFilter}
                  options={artistFilterOptions}
                  onChange={setArtistFilter}
                  disabled={sortingInProgress}
                />

                <FilterDropdown
                  label="专辑年份"
                  value={yearFilter}
                  options={yearFilterOptions}
                  onChange={setYearFilter}
                  compactMenu
                  disabled={sortingInProgress}
                />

                <button
                  type="button"
                  className={[
                    styles.clearFilterButton,
                    !hasActiveFilter ? styles.clearFilterButtonHidden : '',
                  ].join(' ').trim()}
                  onClick={() => {
                    setArtistFilter('all');
                    setYearFilter('all');
                  }}
                  disabled={!hasActiveFilter || sortingInProgress}
                  aria-hidden={!hasActiveFilter}
                  tabIndex={hasActiveFilter && !sortingInProgress ? 0 : -1}
                >
                  清除筛选
                </button>
              </div>
            </div>

            <div className={styles.shelfFrame}>
              <div className={styles.edgeFadeLeft} aria-hidden="true" />
              <div className={styles.edgeFadeRight} aria-hidden="true" />
              {sortingInProgress ? (
                <div className={styles.sortNotice} role="status" aria-live="polite">
                  <span className={styles.sortNoticeDot} aria-hidden="true" />
                  <span>{`正在按${sortModeLabel}整理`}</span>
                </div>
              ) : null}
              <div
                ref={railRef}
                className={[
                  styles.shelfRail,
                  sortingInProgress ? styles.shelfRailSorting : '',
                ].join(' ').trim()}
              >
                {displayedAlbums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    className={[
                      styles.albumButton,
                      expandedAlbumId === album.id ? styles.albumButtonExpanded : '',
                      expandRightAlbumId === album.id ? styles.albumButtonExpandRight : '',
                      pullingAlbumId === album.id ? styles.albumButtonPulling : '',
                      sortingInProgress ? styles.albumButtonLocked : '',
                      sortingAlbumId === album.id ? styles.albumButtonSorting : '',
                    ].join(' ').trim()}
                    ref={(element) => {
                      if (element) {
                        albumButtonRefs.current.set(album.id, element);
                        return;
                      }
                      albumButtonRefs.current.delete(album.id);
                    }}
                    onMouseDown={(event) => {
                      // Keep keyboard focus behavior, but avoid pointer-click focus causing the
                      // browser to auto-scroll the horizontal shelf back toward the last clicked album.
                      event.preventDefault();
                    }}
                    onMouseEnter={(event) => updateAlbumExpansion(album.id, event.currentTarget)}
                    onFocus={(event) => updateAlbumExpansion(album.id, event.currentTarget)}
                    onMouseLeave={() => clearAlbumExpansion(album.id)}
                    onBlur={() => clearAlbumExpansion(album.id)}
                    onClick={(event) => {
                      if (pullingAlbumId) {
                        return;
                      }
                      event.currentTarget.blur();
                      setPullingAlbumId(album.id);
                      window.setTimeout(() => {
                        setSelectedAlbum(album);
                        setPullingAlbumId((current) => (current === album.id ? null : current));
                        setExpandedAlbumId((current) => (current === album.id ? null : current));
                        setExpandRightAlbumId((current) => (current === album.id ? null : current));
                      }, 320);
                    }}
                    aria-label={`查看 ${album.title} by ${album.artist}`}
                  >
                    <AlbumCover album={album} />
                  </button>
                ))}

                {displayedAlbums.length === 0 ? (
                  <div className={styles.emptyState}>当前筛选下没有专辑。</div>
                ) : null}
              </div>
            </div>
          </section>

          <section className={styles.collectionSpotlight} aria-label="Collection highlights">
            {spotlightHighlight ? (
              <article
                className={styles.spotlightTile}
                style={
                  spotlightHighlight.tones
                    ? ({
                        '--spotlight-start': spotlightHighlight.tones.start,
                        '--spotlight-end': spotlightHighlight.tones.end,
                        '--spotlight-accent': spotlightHighlight.tones.accent,
                      } as CSSProperties)
                    : undefined
                }
              >
                <div key={spotlightHighlight.id} className={styles.spotlightMain}>
                  <div className={styles.spotlightCopy}>
                    <p className={styles.spotlightLabel}>{spotlightHighlight.label}</p>
                    <h3 className={styles.spotlightValue}>{spotlightHighlight.value}</h3>
                    {spotlightHighlight.meta ? <p className={styles.spotlightMeta}>{spotlightHighlight.meta}</p> : null}
                  </div>
                  {spotlightHighlight.cover ? (
                    <button
                      type="button"
                      className={[
                        styles.spotlightRecordButton,
                        spotlightHighlight.track ? styles.spotlightRecordButtonPlayable : styles.spotlightRecordButtonStatic,
                        activeHighlightId === spotlightHighlight.id ? styles.spotlightRecordButtonLoaded : '',
                        spotlightLaunchingId === spotlightHighlight.id ? styles.spotlightRecordButtonLaunching : '',
                      ].join(' ').trim()}
                      onClick={() => {
                        if (spotlightHighlight.track && activeHighlightId !== spotlightHighlight.id) {
                          playHighlightFromSpotlight(spotlightHighlight);
                        }
                      }}
                      disabled={activeHighlightId === spotlightHighlight.id}
                      aria-label={spotlightHighlight.track ? `播放 ${spotlightHighlight.track.title}` : spotlightHighlight.cover.alt}
                    >
                      <span className={styles.spotlightSleeveStack}>
                        {activeHighlightId !== spotlightHighlight.id ? (
                          <span className={styles.spotlightDisc} aria-hidden="true">
                            <span className={styles.spotlightDiscGroove} />
                            <img
                              className={styles.spotlightDiscArt}
                              src={spotlightHighlight.cover.src}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                            />
                            <span className={styles.spotlightDiscCenter} />
                          </span>
                        ) : null}
                        <span className={styles.spotlightSleeve}>
                          <img
                            className={styles.spotlightCover}
                            src={spotlightHighlight.cover.src}
                            alt={spotlightHighlight.cover.alt}
                            loading="lazy"
                          />
                        </span>
                      </span>
                    </button>
                  ) : null}
                </div>
                <div className={styles.spotlightFooter}>
                  <div className={styles.spotlightDots} aria-label="Collection spotlight slides">
                    {musicHighlights.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        className={[
                          styles.spotlightDot,
                          index === spotlightIndex ? styles.spotlightDotActive : '',
                        ].join(' ').trim()}
                        aria-label={`切换到 ${item.value}`}
                        aria-pressed={index === spotlightIndex}
                        onClick={() => setSpotlightIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ) : null}

            <aside
              className={styles.turntableCard}
              aria-label="Vinyl player"
            >
              <RecordPlayer
                className={styles.turntableDeck}
                embedded
                coverSrc={displayedTurntableHighlight?.cover?.src}
                coverAlt={displayedTurntableHighlight?.cover?.alt ?? 'Record cover'}
                outgoingCoverSrc={turntableOutgoingHighlight?.cover?.src}
                outgoingCoverAlt={turntableOutgoingHighlight?.cover?.alt}
                isPlaying={isPlayingPreview}
                tonearmAngle={tonearmAngle}
                armWobble={armWobble}
                recordEntering={turntableRecordEntering}
                recordExiting={turntableRecordExiting}
                onTogglePlayback={() => void togglePlayback()}
                disabled={!hasSelectedPlayableHighlight}
                showButton={false}
              />
            </aside>
          </section>

          <section className={styles.playerBar} aria-label="Music player controls">
            <div className={styles.playerTransport}>
              <button
                type="button"
                className={styles.playerControl}
                aria-label="上一首"
                onClick={() => playAdjacentHighlight(-1)}
                disabled={!hasSelectedPlayableHighlight}
              >
                <span className={styles.playerDoubleChevron} aria-hidden="true">
                  <span />
                  <span />
                </span>
              </button>
              <button
                type="button"
                className={[styles.playerControl, styles.playerPlayControl].join(' ')}
                aria-label={isPlayingPreview ? '暂停' : '播放'}
                onClick={() => void togglePlayback()}
                disabled={!hasSelectedPlayableHighlight}
              >
                {isPlayingPreview ? (
                  <span className={styles.playerPauseGlyph} aria-hidden="true">
                    <span />
                    <span />
                  </span>
                ) : (
                  <span className={styles.playerPlayGlyph} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className={styles.playerControl}
                aria-label="下一首"
                onClick={() => playAdjacentHighlight(1)}
                disabled={!hasSelectedPlayableHighlight}
              >
                <span className={[styles.playerDoubleChevron, styles.playerDoubleChevronForward].join(' ')} aria-hidden="true">
                  <span />
                  <span />
                </span>
              </button>
            </div>

            <div className={[styles.playerNowPlaying, !activeHighlight?.cover ? styles.playerNowPlayingNoArtwork : ''].join(' ').trim()}>
              {activeHighlight?.cover ? (
                <img
                  className={styles.playerArtwork}
                  src={activeHighlight.cover.src}
                  alt={activeHighlight.cover.alt}
                  loading="lazy"
                />
              ) : null}

              <div className={styles.playerMeta}>
                <div className={styles.playerTextRow}>
                  <strong className={styles.playerTitle}>{activeHighlight?.value ?? '唱片机里还没有唱片'}</strong>
                  {activeHighlight?.meta ? <span className={styles.playerMetaInline}>{activeHighlight.meta}</span> : null}
                </div>
                <p className={styles.playerTrackText}>
                  {playableHighlight?.track ? playableHighlight.track.title : '点击唱片放入唱片机'}
                </p>
                <div className={styles.playerProgress}>
                  <span className={styles.playerTime}>{formatTime(previewCurrentTime)}</span>
                  <div className={styles.playerProgressTrack} aria-hidden="true">
                    <span className={styles.playerProgressFill} style={{ transform: `scaleX(${progressRatio})` }} />
                  </div>
                  <span className={styles.playerTime}>{formatTime(previewDuration)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              ref={playlistButtonRef}
              className={[styles.playerControl, styles.playerListControl].join(' ')}
              aria-label="播放列表"
              aria-haspopup="dialog"
              aria-expanded={playlistOpen}
              onClick={() => setPlaylistOpen((current) => !current)}
              disabled={!hasSelectedPlayableHighlight}
            >
              <img src="/icons/UI/list.svg" alt="" aria-hidden="true" className={styles.playerListIcon} />
            </button>

          </section>
          {playlistOpen && typeof document !== 'undefined'
            ? createPortal(
                <div
                  ref={playlistRef}
                  className={styles.playlistPanel}
                  style={playlistPanelStyle ? { ...playlistPanelStyle, visibility: 'visible' } : { visibility: 'hidden' }}
                  role="dialog"
                  aria-label="播放列表"
                >
                  <div className={styles.playlistPanelInner}>
                    <p className={styles.playlistHeading}>播放列表</p>
                    <div className={styles.playlistItems}>
                      {playableHighlights.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={[
                            styles.playlistItem,
                            activeHighlightId === item.id ? styles.playlistItemActive : '',
                          ].join(' ').trim()}
                          onClick={() => {
                            setPlaylistOpen(false);
                            void startPlayback(item);
                          }}
                        >
                          {item.cover ? (
                            <img
                              className={styles.playlistItemArtwork}
                              src={item.cover.src}
                              alt={item.cover.alt}
                              loading="lazy"
                            />
                          ) : (
                            <span className={styles.playlistItemArtworkFallback} aria-hidden="true" />
                          )}
                          <span className={styles.playlistItemMeta}>
                            <strong className={styles.playlistItemTitle}>{item.track?.title ?? item.value}</strong>
                            <span className={styles.playlistItemAlbum}>{item.value}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>,
                document.body,
              )
            : null}
        </main>
      </div>

      {selectedAlbum ? (
        <div
          className={[styles.modalOverlay, modalVisible ? styles.modalOverlayVisible : ''].join(' ').trim()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="music-album-title"
          onClick={closeModal}
        >
          <div
            className={[styles.modalCard, modalVisible ? styles.modalCardVisible : ''].join(' ').trim()}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="关闭专辑详情"
              onClick={closeModal}
            >
              <img src="/icons/UI/close.svg" alt="" aria-hidden="true" className={styles.modalCloseIcon} />
            </button>

            <div className={styles.modalVisual}>
              <ModalAlbumArtwork album={selectedAlbum} />
            </div>

            <div className={styles.modalMeta}>
              <p className={styles.modalKicker}>Album Detail</p>
              <h2 id="music-album-title" className={styles.modalTitle}>
                {selectedAlbum.title}
              </h2>
              <p className={styles.modalArtist}>{selectedAlbum.artist}</p>
              <div className={styles.modalFacts}>
                <p className={styles.modalInfo}>
                  <span>专辑年份</span>
                  <strong>{selectedAlbum.releaseYear ?? '未知'}</strong>
                </p>
                <p className={styles.modalInfo}>
                  <span>购入时间</span>
                  <strong>{selectedAlbum.purchase.date}</strong>
                </p>
                <p className={styles.modalInfo}>
                  <span>购入地点</span>
                  <strong>{selectedAlbum.purchase.location}</strong>
                </p>
                {selectedAlbum.purchase.priceText ? (
                  <p className={styles.modalInfo}>
                    <span>价格</span>
                    <strong>{selectedAlbum.purchase.priceText}</strong>
                  </p>
                ) : null}
              </div>
              {!selectedAlbum.cover.file ? <p className={styles.modalMissing}>这张专辑的真实封面还没有补入，目前先使用程序化占位封面。</p> : null}
            </div>

            {selectedAlbum.note ? (
              <section className={styles.modalNotePanel} aria-label="我的备注">
                <p className={styles.modalNoteLabel}>Note</p>
                <p className={styles.modalNote}>{selectedAlbum.note}</p>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Music;
