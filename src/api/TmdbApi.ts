import { POPCORN_TRACKER_TMDB_API_URL, TMDB_APIKEY } from '../const';
import { TmdbGenre, TmdbMedia } from '../types/Tmdb';
import { PopcornTrackerApi } from './PopcornTrackerApi';

interface TmdbMediaResponse extends Response {
  page: number;
  results: Array<TmdbMedia>;
}

interface TmdbGenreResponse extends Response {
  genres: Array<TmdbGenre>;
}

export class TmdbApi extends PopcornTrackerApi {
  private static genres: Array<TmdbGenre> = [];

  static async getGenres(): Promise<Array<TmdbGenre>> {
    if (TmdbApi.genres.length > 0) {
      return TmdbApi.genres;
    }

    let genres: Array<TmdbGenre> = [];
    const movieUrl = `${POPCORN_TRACKER_TMDB_API_URL}/genre/movie/list?api_key=${TMDB_APIKEY}`;
    const tvUrl = `${POPCORN_TRACKER_TMDB_API_URL}/genre/tv/list?api_key=${TMDB_APIKEY}`;

    try {
      // Getting movie genres
      const movieGenreResponse = await fetch(movieUrl, {
        method: 'GET',
      });

      const movieGenreData: TmdbGenreResponse = await movieGenreResponse.json();
      genres.push(...movieGenreData.genres);

      // Getting tv genres
      const tvGenreResponse = await fetch(tvUrl, {
        method: 'GET',
      });

      const tvGenreData: TmdbGenreResponse = await tvGenreResponse.json();
      genres = genres.concat(tvGenreData.genres);

      // Remove duplicates
      TmdbApi.genres = genres.filter(
        (genre, index, self) =>
          index === self.findIndex((t) => t.id === genre.id)
      );

      return TmdbApi.genres;
    } catch (error) {
      throw new Error(`Error fetching genres: ${error}`);
    }
  }

  static async getMedia(mediaName: string): Promise<Array<TmdbMedia>> {
    const url = `${POPCORN_TRACKER_TMDB_API_URL}/search/multi?query=${mediaName}&api_key=${TMDB_APIKEY}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      const data: TmdbMediaResponse = await response.json();

      return data.results;
    } catch (error) {
      console.error('Error fetching media:', error);
      return [];
    }
  }

  static async getMediaById(item: {
    id: number;
    type: string;
  }): Promise<TmdbMedia | null> {
    const { id, type } = item;

    const url = `${POPCORN_TRACKER_TMDB_API_URL}/${type}/${id}?api_key=${TMDB_APIKEY}`;

    try {
      const response = await fetch(url);

      if (response.ok) {
        const media: TmdbMedia = await response.json();
        return media;
      }

      throw new Error(
        `Something went wrong while fetching media. id = ${id}, type=${type}`
      );
    } catch (error) {
      throw error;
    }
  }
}
