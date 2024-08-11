import { Dayjs } from 'dayjs';
import { AnilistMedia } from './Anilist';
import { TmdbMedia } from './Tmdb';

export enum Category {
  Movie = 'Movie',
  Serie = 'Serie',
  Anime = 'Anime',
  Manga = 'Manga',
}

export enum Status {
  Ongoing = 'Ongoing',
  Done = 'Done',
  Planned = 'Planned',
}

export const DEFAULT_CATEGORY = Category.Manga;
export const DEFAULT_STATUS = Status.Planned;

export enum FilterCondition {
  AND = 'AND',
  OR = 'OR',
}

export interface BaseItem<T extends keyof typeof Category> {
  /**
   * Unique id
   */
  id: string;
  /**
   * Category of the item
   */
  category: T;
  /**
   * Name of the item
   */
  media: AnilistMedia | TmdbMedia | null;
  /**
   * Increment/decrement step of the value
   */
  step?: number;
  /**
   * Value of the item. Represent the last read chapter, the last seen episode, etc.
   */
  value?: number;
  /**
   * Status of the item
   */
  status: keyof typeof Status;
  isFavorite: boolean;
}

export interface VideoItem<
  T extends Extract<keyof typeof Category, 'Movie' | 'Serie' | 'Anime'>,
> extends BaseItem<T> {
  timer?: Dayjs;
}

export interface MovieItem extends VideoItem<'Movie'> {}
export interface SerieItem extends VideoItem<'Serie'> {
  season?: number;
}
export interface AnimeItem extends VideoItem<'Anime'> {
  season?: number;
}
export interface MangaItem extends BaseItem<'Manga'> {}

export type Item = MovieItem | SerieItem | AnimeItem | MangaItem;
