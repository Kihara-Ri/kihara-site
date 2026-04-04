import { useId, type DragEventHandler } from 'react';
import styles from './RecordPlayer.module.css';

const grooveRadii = Array.from({ length: 19 }, (_, index) => 380 - index * 10);

function RecordSvg({ coverSrc, coverAlt }: { coverSrc: string; coverAlt: string }) {
  const clipPathId = useId();

  return (
    <svg className={styles.playerSvgLp} viewBox="0 0 800 800" aria-label={coverAlt}>
      <title>{coverAlt}</title>
      <path
        fill="#181819"
        d="M400,1C179.6,1,1,179.6,1,400s178.6,399,399,399s399-178.6,399-399S620.4,1,400,1zM400,409.8c-5.4,0-9.8-4.4-9.8-9.8s4.4-9.8,9.8-9.8s9.8,4.4,9.8,9.8S405.4,409.8,400,409.8z"
      />
      <g strokeWidth="1.5" stroke="#141415" fill="#181819">
        {grooveRadii.map((radius) => (
          <circle key={radius} cx="400" cy="400" r={radius} />
        ))}
      </g>
      <path
        className={styles.recordCoverRing}
        d="M400,262.1c-76.1,0-137.9,61.7-137.9,137.9S323.9,537.9,400,537.9S537.9,476.1,537.9,400S476.1,262.1,400,262.1z M400,411.7c-6.4,0-11.7-5.2-11.7-11.7s5.2-11.7,11.7-11.7s11.7,5.2,11.7,11.7S406.4,411.7,400,411.7z"
      />
      <defs>
        <clipPath id={clipPathId}>
          <path d="M400,262.1c-76.1,0-137.9,61.7-137.9,137.9S323.9,537.9,400,537.9S537.9,476.1,537.9,400S476.1,262.1,400,262.1z M400,411.7c-6.4,0-11.7-5.2-11.7-11.7s5.2-11.7,11.7-11.7s11.7,5.2,11.7,11.7S406.4,411.7,400,411.7z" />
        </clipPath>
      </defs>
      <image href={coverSrc} x="250" y="250" width="300" height="300" clipPath={`url(#${clipPathId})`} preserveAspectRatio="xMidYMid slice" />
      <circle cx="400" cy="400" r="12" fill="#f5f0e8" stroke="#0f0f10" strokeWidth="3" />
    </svg>
  );
}

function TonearmSvg() {
  return (
    <svg className={styles.playerSvgTonearm} viewBox="0 0 800 800" aria-hidden="true">
      <path
        className={styles.tonearmBody}
        d="M354.5,761.6l11.9,6.2c0,0,37.1-91.5,42.4-123.7c2.7-16.4-1.1-103.9-1.1-103.9V307.5h-14.7l-0.1,232.7c0,0,3.7,87.5,1.1,103.9C389,674.6,354.5,761.6,354.5,761.6z"
      />
      <rect className={styles.tonearmBody} x="379.7" y="239.7" width="40.7" height="67.8" />
      <circle className={styles.tonearmFixed} cx="400" cy="400" r="22.6" />
      <path className={styles.grabbableHead} d="M353,738.9l18.3-22.9l13.2,6.4l-6.2,28.7l-22.8,47.1c0,0-1.2,3.3-15.4-3.6c-11.2-5.4-10-8.7-10-8.7L353,738.9z" />
    </svg>
  );
}

interface RecordPlayerProps {
  coverSrc?: string;
  coverAlt: string;
  outgoingCoverSrc?: string;
  outgoingCoverAlt?: string;
  isPlaying: boolean;
  tonearmAngle: number;
  armWobble: 'play' | 'pause' | null;
  recordEntering?: boolean;
  recordExiting?: boolean;
  onTogglePlayback: () => void | Promise<void>;
  className?: string;
  embedded?: boolean;
  active?: boolean;
  disabled?: boolean;
  showButton?: boolean;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDragEnter?: DragEventHandler<HTMLDivElement>;
  onDragLeave?: DragEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
}

function RecordPlayer({
  coverSrc,
  coverAlt,
  outgoingCoverSrc,
  outgoingCoverAlt,
  isPlaying,
  tonearmAngle,
  armWobble,
  recordEntering = false,
  recordExiting = false,
  onTogglePlayback,
  className,
  embedded = false,
  active = false,
  disabled = false,
  showButton = true,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: RecordPlayerProps) {
  return (
    <div
      className={[
        styles.stage,
        embedded ? styles.stageEmbedded : '',
        active ? styles.stageActive : '',
        className ?? '',
      ].join(' ').trim()}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={styles.playerShell}>
        <div className={styles.playerStand} />

        <div className={styles.player}>
          <div
            className={[
              styles.playerElement,
              styles.playerElementLp,
              styles.playerElementLpCurrent,
              coverSrc ? styles.playerElementLpLoaded : styles.playerElementLpPlaceholder,
              coverSrc && recordEntering ? styles.playerElementLpEntering : '',
              coverSrc && isPlaying ? styles.playerElementLpSpinning : '',
            ].join(' ').trim()}
          >
            <div className={styles.recordPlaceholder} aria-hidden="true">
              <span className={styles.recordPlaceholderGrooves} />
              <span className={styles.recordPlaceholderCenter} />
            </div>
            {coverSrc ? (
              <div className={styles.playerElementInner}>
                <RecordSvg coverSrc={coverSrc} coverAlt={coverAlt} />
              </div>
            ) : null}
          </div>

          {outgoingCoverSrc ? (
            <div
              className={[
                styles.playerElement,
                styles.playerElementLp,
                styles.playerElementLpOutgoing,
                recordExiting ? styles.playerElementLpExiting : '',
              ].join(' ').trim()}
            >
              <div className={styles.playerElementInner}>
                <RecordSvg coverSrc={outgoingCoverSrc} coverAlt={outgoingCoverAlt ?? outgoingCoverSrc} />
              </div>
            </div>
          ) : null}

          <div
            className={[styles.playerElement, styles.playerElementTonearm].join(' ')}
            style={{ transform: `rotate(${tonearmAngle}deg)` }}
          >
            <div
              className={[
                styles.tonearmMotion,
                armWobble === 'play' ? styles.tonearmMotionPlay : '',
                armWobble === 'pause' ? styles.tonearmMotionPause : '',
              ].join(' ').trim()}
            >
              <TonearmSvg />
            </div>
          </div>
        </div>
      </div>

      {showButton ? (
        <button
          type="button"
          className={styles.playButton}
          onClick={() => void onTogglePlayback()}
          aria-label={isPlaying ? '暂停播放' : '开始播放'}
          disabled={disabled}
        >
          <span className={styles.playButtonLabel}>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
      ) : null}
    </div>
  );
}

export default RecordPlayer;
