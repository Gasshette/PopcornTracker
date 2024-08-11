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

export const DEFAULT_CATEGORY = Category.Anime;
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
   * Media of the item
   */
  media: AnilistMedia | TmdbMedia | null;
  /**
   * Status of the item
   */
  status: keyof typeof Status;
  /**
   * Wether the item is a favorite or not. Favorites are displayed first in the list
   */
  isFavorite: boolean;
  /**
   * Increment/decrement step of the value
   */
  step?: number;
  /**
   * Value of the item. Represent the last read chapter, the last seen episode, etc.
   */
  value?: number;
  /**
   * A link defined by the user to easily reach its content. It can be written with a variable {{value}} that will be replaced by the current item value.
   * e.g.: https://arenascan.com/the-beginning-after-the-end-{{value}}/
   */
  link?: string;
  /**
   * The timetamp representing the last time the item has been updated. Used to auto update items during sync
   */
  lastUpdated?: number | null;
}

export interface VideoItem<
  T extends Extract<
    keyof typeof Category,
    'Movie' | 'Serie' | 'Anime'
  > = Extract<keyof typeof Category, 'Movie' | 'Serie' | 'Anime'>,
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
