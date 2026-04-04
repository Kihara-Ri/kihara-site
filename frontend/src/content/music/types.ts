export interface MusicAlbum {
  id: string;
  title: string;
  artist: string;
  releaseYear: number | null;
  purchase: {
    date: string;
    display: string;
    location: string;
    priceText: string | null;
    priceValue: number | null;
    currency: string | null;
  };
  note: string | null;
  rawRemark: string | null;
  cover: {
    file: string | null;
    source: string | null;
    status: 'missing' | 'fetched' | 'manual';
    matchedTitle?: string;
  };
}

export interface MusicHighlight {
  id: string;
  label: string;
  value: string;
  meta?: string | null;
  track?: {
    title: string;
    previewUrl: string;
  } | null;
  tones?: {
    start: string;
    end: string;
    accent: string;
  } | null;
  cover?: {
    src: string;
    alt: string;
  } | null;
}
