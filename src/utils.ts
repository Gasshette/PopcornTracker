import {
  DEFAULT_STEP,
  POPCORN_TRACKER_DOCUMENT_KEY,
  scrollYKey,
} from './const';
import { AnilistMedia } from './types/Anilist';
import { CategoryColors, Config, StatusColors } from './types/Config';
import {
  AnimeItem,
  BaseItem,
  Category,
  Item,
  MangaItem,
  MovieItem,
  SerieItem,
  Status,
} from './types/Item';
import debounce from 'lodash.debounce';
import { v4 as uuidv4 } from 'uuid';
import { PopcornTrackerDocument } from './types/Document';
import isEqual from 'lodash.isequal';
import { TmdbMedia } from './types/Tmdb';
import { CSSProperties } from 'react';

export function getEmptyItem(category?: Category): Item {
  if (!category) {
    throw new Error('Invalid category: category cannot be undefined');
  }

  const baseItem: Omit<BaseItem<typeof category>, 'category'> = {
    id: uuidv4(),
    value: 0,
    media: null,
    step: DEFAULT_STEP,
    status: Status.Planned,
    isFavorite: false,
    lastUpdated: null,
  };

  switch (category) {
    case 'Movie':
      const movieItem: MovieItem = {
        ...baseItem,
        category,
      };

      return movieItem;
    case 'Serie':
      const serieItem: SerieItem = {
        ...baseItem,
        category,
      };

      return serieItem;
    case 'Anime':
      const animeItem: AnimeItem = {
        ...baseItem,
        category,
      };

      return animeItem;
    case 'Manga':
      const mangaItem: MangaItem = {
        ...baseItem,
        category,
      };

      return mangaItem;
    default:
      throw new Error(`Invalid category. Provided category: "${category}"`);
  }
}

export const getInitialConfig = (): Config => {
  const initialColors: CategoryColors = {} as CategoryColors;
  const initialStatus: StatusColors = {} as StatusColors;

  const baseColor = '#FFF';

  Object.values(Category).forEach((c) => {
    initialColors[c] = baseColor;
  });

  Object.values(Status).forEach((s) => {
    initialStatus[s] = baseColor;
  });

  const config: Config = {
    colors: initialColors,
    status: initialStatus,
  };

  return config;
};

export function isVideoItem(
  item: Item
): item is MovieItem | SerieItem | AnimeItem {
  return (
    item.category === 'Movie' ||
    item.category === 'Serie' ||
    item.category === 'Anime'
  );
}

/**
 * Return true if the given item is either a SerieItem or an AnimeItem, false otherwise.
 * @param {Item | undefined} item - The item to check.
 * @returns {boolean} True if the item is either a SerieItem or an AnimeItem, false otherwise.
 */
export default function hasSeason(item: Item): item is SerieItem | AnimeItem {
  return item.category === 'Serie' || item.category === 'Anime';
}

/**
 * Return true if the given item has a timer, false otherwise.
 * @param {Item | undefined} item - The item to check.
 * @returns {boolean} True if the item has a timer, false otherwise.
 */
export function hasTimer(item?: Item) {
  return !!item?.hasOwnProperty('timer');
}

export const debounceFunc = debounce(
  (func: (val: any) => void, source: any) => func(source),
  500
);

export const displayTitle = (media: AnilistMedia | TmdbMedia | null) => {
  if (!media) throw new Error('media is required');

  if (isAnilistMedia(media)) {
    return media.title.romaji ?? media.title.english ?? media.title.native;
  } else {
    return media.media_type === 'movie' ? media.title : media.name;
  }
};

export const getTitles = (media: AnilistMedia | TmdbMedia) => {
  let mainTitle: string;
  let secondaryTitle: string;

  if (isAnilistMedia(media)) {
    mainTitle = media.title.romaji ?? '';
    secondaryTitle = media.title.english ?? '';
    media.title.english && media.title.native && (secondaryTitle += ' | ');
    secondaryTitle += media.title.native;
  } else {
    mainTitle = media.media_type === 'tv' ? media.name : media.title;
    secondaryTitle = media.original_name ?? media.original_title;
  }

  mainTitle = mainTitle ?? '';
  secondaryTitle = secondaryTitle ?? '';

  return {
    mainTitle,
    secondaryTitle,
  };
};

export const isAnilistMedia = (
  media: AnilistMedia | TmdbMedia | null
): media is AnilistMedia => {
  return !!media && 'coverImage' in media;
};

/**
 * Builds a PopcornTracker document by combining partial document data with stored items and colors.
 *
 * @param {Partial<PopcornTrackerDocument>} partialDoc - Partial document data to be combined with stored items and colors.
 * @return {object} A complete PopcornTracker document with stored items, colors, and the provided partial document data.
 */
export const buildDocument = (
  partialDoc?: Partial<PopcornTrackerDocument>
): PopcornTrackerDocument => {
  const baseDoc = {
    items: [],
    config: getInitialConfig(),
    lastUpdated: new Date().toISOString(),
  };

  if (!partialDoc) {
    return baseDoc;
  }

  const localStoredDoc = JSON.parse(
    localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY) ?? '{}'
  );
  delete localStoredDoc.lastUpdated;

  return {
    ...baseDoc,
    ...localStoredDoc,
    ...partialDoc,
  };
};

/**
 * Checks if a document is equal to the default document.
 *
 * @param {PopcornTrackerDocument} doc - Document to check.
 * @return {boolean} True if the document is equal to the default document, false otherwise.
 */
export const isDefaultDocument = (doc: PopcornTrackerDocument) => {
  const defaultDoc: Partial<PopcornTrackerDocument> = buildDocument();
  const copy: Partial<PopcornTrackerDocument> = structuredClone(doc);

  delete copy.lastUpdated;
  delete defaultDoc.lastUpdated;

  return isEqual(copy, defaultDoc);
};

/**
 * Checks if a Date object is valid.
 *
 * @param {Date} d - The Date object to check.
 * @return {boolean} True if the Date object is valid, false otherwise.
 */
export const isValidDate = (d: Date) => {
  return d instanceof Date && !isNaN(d.getTime());
};

/**
 * Converts a hex color string to an rgba string.
 *
 * @param {string} hex - A hex color string, e.g. '#ff0000'.
 * @param {number} [opacity=1] - The opacity of the color, from 0 to 1.
 * @return {string|null} The rgba string, or null if the input is invalid.
 */
export const hexToRgba = (hex: string, opacity = 1) => {
  const result =
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex) ||
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1] + result[1], 16)}, ${parseInt(
        result[2] + result[2],
        16
      )}, ${parseInt(result[3] + result[3], 16)}, ${opacity})`
    : null;
};

export const getTmdbImagePath = (
  path: string,
  size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'original' = 'original'
) => {
  let urlSize = 'original';

  switch (size) {
    case 'sm':
      urlSize = 'w92';
      break;
    case 'md':
      urlSize = 'w154';
      break;
    case 'lg':
      urlSize = 'w342';
      break;
    case 'xl':
      urlSize = 'w500';
      break;
    case 'xxl':
      urlSize = 'w780';
      break;
  }

  return `https://image.tmdb.org/t/p/${urlSize}/${path}`;
};

export function getRightTransitionSx(
  condition: boolean,
  rightBefore: number,
  rightAfter: number
): CSSProperties {
  return {
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    right: rightBefore,
    transition: 'right .5s ease-in-out',
    ...(condition && {
      right: rightAfter,
    }),
  };
}

export function parseUrl(
  template: string,
  vars: Record<string, number>
): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawExpr: string) => {
    const expr = String(rawExpr || '').trim();
    if (!expr) throw new Error('Empty expression inside {{ }}');

    // Replace commas with dots so "3,5" works like 3.5
    const normalizedExpr = expr.replace(/,/g, '.');

    // Use Function constructor to safely evaluate the expression with given vars
    try {
      const fn = new Function(
        ...Object.keys(vars),
        `return ${normalizedExpr};`
      );
      let value = fn(...Object.values(vars));

      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Expression did not evaluate to a number: ${expr}`);
      }

      let result = String(value);
      // Replace decimal point with dash
      if (result.includes('.')) {
        result = result.replace('.', '-');
      }
      return result;
    } catch (e) {
      throw new Error(`Failed to evaluate expression: ${expr}`);
    }
  });
}

export function resetScrollY(smooth?: 'smooth') {
  sessionStorage.removeItem(scrollYKey);
  window.scrollTo({ top: 0, behavior: smooth ?? 'instant' });
}
