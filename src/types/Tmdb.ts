export interface TmdbMedia {
  id: number;
  name: string; // for tv type media
  original_name: string; // for tv type media
  title: string; // for movie type media
  original_title: string; // for movie type media
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: Array<number>;
  genres: Array<TmdbGenre>; // contains genres matching the genre_ids above
  adult: boolean;
  original_language: string;

  media_type: string;
  popularity: number;
  vote_count: number;
  first_air_date: string;

  // these ones does not seem to work
  // next_episode_to_air?: string;
  // networks: Array<{ name: string; logo_path: string }>;
  // seasons: Array<{ season_number: number; air_date: string }>;
}

export type TmdbGenre = { id: number; name: string };
