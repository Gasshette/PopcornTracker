import { POPCORN_TRACKER_ANILIST_API_URL } from '../const';
import {
  MediaType,
  AnilistUniqueResponse,
  AnilistPaginatedResponse,
  AnilistMultipleResponse,
} from '../types/Anilist';
import { getAnilistMedia, pageInfos } from './GraphQLQueries';
import { PopcornTrackerApi } from './PopcornTrackerApi';

const url = POPCORN_TRACKER_ANILIST_API_URL;

export class AnilistApi extends PopcornTrackerApi {
  static async getMedia(
    mediaId: number,
    isFull = false
  ): Promise<AnilistUniqueResponse | null> {
    const query = `
    query {
      Media(id: ${mediaId}) ${getAnilistMedia(isFull)}
      }
      `;
    return AnilistApi.fetchQL(url, query);
  }

  static getMedias(
    ids: Array<number>,
    isFull = false
  ): Promise<AnilistMultipleResponse> {
    const query = `
    query {
      ${ids.map((id, i) => `item${i}: Media(id: ${id}, isAdult: false) ${getAnilistMedia(isFull)}`)}
    }
    `;

    return AnilistApi.fetchQL(url, query);
  }

  static searchByNameAndType = async (
    name: string,
    type: MediaType = 'MANGA'
  ): Promise<AnilistPaginatedResponse> => {
    if (!name) {
      throw new Error('name is required to find Anilist medias');
    }

    const query = `
      query {
        Page(page: 1,perPage: 20) ${pageInfos}
        media(search: "${name}", type: ${type}, isAdult: false) ${getAnilistMedia()}
        }
        }
        `;

    return AnilistApi.fetchQL(url, query);
  };

  static async fetchQL(url: string, query: string) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error(`Something went wrong while fetching media`);
  }
}
