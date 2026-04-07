import type { MusicHighlight } from './types';

export const musicHighlights: MusicHighlight[] = [
  {
    id: 'recently-on-repeat',
    label: 'Recently on repeat',
    value: 'Racing Mount Pleasant',
    meta: 'Racing Mount Pleasant',
    track: {
      title: 'Emily',
      previewUrl: '/music/highlights/Emily - Racing Mount Pleasant.mp3',
    },
    tones: {
      start: '#cfc6b8',
      end: '#70665d',
      accent: '#2b2623',
    },
    cover: {
      src: '/music/highlights/racing-mount-pleasant.jpg',
      alt: 'Racing Mount Pleasant cover',
    },
  },
  {
    id: 'all-time-favorite',
    label: 'All time favorite',
    value: 'Illinois',
    meta: 'Sufjan Stevens',
    track: {
      title: 'Come On! Feel the Illinoise!',
      previewUrl: '/music/highlights/come-on-feel-the-illinoise.mp3',
    },
    tones: {
      start: '#f2d76d',
      end: '#db7a2f',
      accent: '#8f3d17',
    },
    cover: {
      src: '/music/highlights/illinois.jpg',
      alt: 'Sufjan Stevens Illinois cover',
    },
  },
  {
    id: 'favorite-rock-album',
    label: 'Favorite rock album',
    value: 'Ants From Up There',
    meta: 'Black Country, New Road',
    track: {
      title: 'Concorde',
      previewUrl: '/music/highlights/concorde.mp3',
    },
    tones: {
      start: '#d9d3cb',
      end: '#8f8475',
      accent: '#3f342a',
    },
    cover: {
      src: '/music/highlights/ants-from-up-there.jpg',
      alt: 'Black Country, New Road Ants From Up There cover',
    },
  },
  {
    id: 'favorite-genre',
    label: 'Favorite genre',
    value: 'Chamber Pop',
    meta: 'via Funeral',
    track: {
      title: 'Neighborhood #1 (Tunnels)',
      previewUrl: '/music/highlights/neighborhood-1.mp3',
    },
    tones: {
      start: '#b8a178',
      end: '#4a3e36',
      accent: '#1f1b18',
    },
    cover: {
      src: '/music/highlights/funeral.jpg',
      alt: 'Arcade Fire Funeral cover',
    },
  },
  {
    id: 'favorite-cpop-artist',
    label: 'Favorite cpop artist',
    value: '陈奕迅',
    meta: 'Shall We Dance? Shall We Talk!',
    track: {
      title: 'Shall We Talk',
      previewUrl: '/music/highlights/shall-we-talk.mp3',
    },
    tones: {
      start: '#d7d0c8',
      end: '#8a7f74',
      accent: '#51463f',
    },
    cover: {
      src: '/music/highlights/shall-we-dance-shall-we-talk.jpg',
      alt: '陈奕迅 Shall We Dance? Shall We Talk! cover',
    },
  },
];
