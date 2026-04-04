import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from 'react';
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
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (nextValue: string) => void;
  compactTrigger?: boolean;
  compactMenu?: boolean;
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

function findHighlight(id: string) {
  return musicHighlights.find((item) => item.id === id) ?? null;
}

function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<MusicAlbum | null>(null);
  const [pullingAlbumId, setPullingAlbumId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [artistFilter, setArtistFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);
  const [expandRightAlbumId, setExpandRightAlbumId] = useState<string | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [dropActive, setDropActive] = useState(false);
  const [spotlightLaunchingId, setSpotlightLaunchingId] = useState<string | null>(null);
  const [turntableOutgoingHighlight, setTurntableOutgoingHighlight] = useState<MusicHighlight | null>(null);
  const [turntableRecordEntering, setTurntableRecordEntering] = useState(false);
  const [turntableRecordExiting, setTurntableRecordExiting] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);
  const playlistRef = useRef<HTMLDivElement | null>(null);
  const spotlightLaunchTimeoutRef = useRef<number | null>(null);
  const turntableSwapTimeoutRef = useRef<number | null>(null);
  const turntableEnterTimeoutRef = useRef<number | null>(null);
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

  useEffect(() => {
    if (!selectedAlbum) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAlbum]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      rail.scrollBy({
        left: event.deltaY,
        behavior: 'auto',
      });
      event.preventDefault();
    };

    rail.addEventListener('wheel', handleWheel, { passive: false });
    return () => rail.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    if (!playlistOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!playlistRef.current?.contains(event.target as Node)) {
        setPlaylistOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPlaylistOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playlistOpen]);

  useEffect(() => {
    return () => {
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
    window.setTimeout(() => {
      setSelectedAlbum(null);
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

  const spotlightHighlight = musicHighlights[spotlightIndex] ?? musicHighlights[0] ?? null;
  const displayedTurntableHighlight = turntableRecordExiting ? null : activeHighlight;

  const playHighlightFromSpotlight = (highlight: MusicHighlight) => {
    if (!highlight.track || spotlightLaunchingId) {
      return;
    }

    const extractDuration = 360;
    const exitDuration = activeHighlight?.cover?.src && activeHighlight.id !== highlight.id ? 620 : 0;
    const enterDuration = 820;
    const outgoingHighlight = activeHighlight?.cover?.src && activeHighlight.id !== highlight.id ? activeHighlight : null;

    setSpotlightLaunchingId(highlight.id);
    setDropActive(false);
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
  const handleHighlightDragStart = (event: DragEvent<HTMLButtonElement>, highlight: MusicHighlight) => {
    if (!highlight.track) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/music-highlight-id', highlight.id);
  };

  const handleDeckDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const highlightId = event.dataTransfer.getData('text/music-highlight-id');
    const highlight = findHighlight(highlightId);
    if (highlight?.track) {
      void startPlayback(highlight);
    }
    setDropActive(false);
  };

  return (
    <>
      <div className={[layout.page, layout.pageWithFooter, styles.page].join(' ')}>
        <main className={styles.main}>
          <section className={styles.shelfSection} aria-label="CD shelf">
            <div className={styles.shelfHeader}>
              <div>
                <h2 className={styles.shelfTitle}>
                  <span>My Collection</span>
                  <span className={styles.shelfCount}>{filteredAlbums.length}</span>
                </h2>
              </div>
              <div className={styles.filterBar}>
                <FilterDropdown
                  label="艺术家"
                  value={artistFilter}
                  options={artistFilterOptions}
                  onChange={setArtistFilter}
                />

                <FilterDropdown
                  label="专辑年份"
                  value={yearFilter}
                  options={yearFilterOptions}
                  onChange={setYearFilter}
                  compactMenu
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
                  disabled={!hasActiveFilter}
                  aria-hidden={!hasActiveFilter}
                  tabIndex={hasActiveFilter ? 0 : -1}
                >
                  清除筛选
                </button>
              </div>
            </div>

            <div className={styles.shelfFrame}>
              <div className={styles.edgeFadeLeft} aria-hidden="true" />
              <div className={styles.edgeFadeRight} aria-hidden="true" />
              <div ref={railRef} className={styles.shelfRail}>
                {filteredAlbums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    className={[
                      styles.albumButton,
                      expandedAlbumId === album.id ? styles.albumButtonExpanded : '',
                      expandRightAlbumId === album.id ? styles.albumButtonExpandRight : '',
                      pullingAlbumId === album.id ? styles.albumButtonPulling : '',
                    ].join(' ').trim()}
                    onMouseEnter={(event) => updateAlbumExpansion(album.id, event.currentTarget)}
                    onFocus={(event) => updateAlbumExpansion(album.id, event.currentTarget)}
                    onMouseLeave={() => clearAlbumExpansion(album.id)}
                    onBlur={() => clearAlbumExpansion(album.id)}
                    onClick={() => {
                      if (pullingAlbumId) {
                        return;
                      }
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

                {filteredAlbums.length === 0 ? (
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
                      draggable={Boolean(spotlightHighlight.track)}
                      onDragStart={(event) => handleHighlightDragStart(event, spotlightHighlight)}
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
                active={dropActive}
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
                onDragOver={(event) => {
                  if (event.dataTransfer.types.includes('text/music-highlight-id')) {
                    event.preventDefault();
                    setDropActive(true);
                  }
                }}
                onDragEnter={(event) => {
                  if (event.dataTransfer.types.includes('text/music-highlight-id')) {
                    event.preventDefault();
                    setDropActive(true);
                  }
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDropActive(false);
                  }
                }}
                onDrop={handleDeckDrop}
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

            <div className={styles.playerNowPlaying}>
              {activeHighlight?.cover ? (
                <img
                  className={styles.playerArtwork}
                  src={activeHighlight.cover.src}
                  alt={activeHighlight.cover.alt}
                  loading="lazy"
                />
              ) : (
                <span className={styles.playerArtworkFallback} aria-hidden="true" />
              )}

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
              className={[styles.playerControl, styles.playerListControl].join(' ')}
              aria-label="播放列表"
              aria-haspopup="dialog"
              aria-expanded={playlistOpen}
              onClick={() => setPlaylistOpen((current) => !current)}
              disabled={!hasSelectedPlayableHighlight}
            >
              <img src="/icons/UI/list.svg" alt="" aria-hidden="true" className={styles.playerListIcon} />
            </button>

            {playlistOpen ? (
              <div ref={playlistRef} className={styles.playlistPanel} role="dialog" aria-label="播放列表">
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
              </div>
            ) : null}
          </section>
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
              {selectedAlbum.note ? <p className={styles.modalNote}>{selectedAlbum.note}</p> : null}
              {!selectedAlbum.cover.file ? <p className={styles.modalMissing}>这张专辑的真实封面还没有补入，目前先使用程序化占位封面。</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Music;
