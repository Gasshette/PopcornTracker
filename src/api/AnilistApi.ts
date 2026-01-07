import { POPCORN_TRACKER_ANILIST_API_URL } from '../const';
import {
  MediaType,
  AnilistUniqueResponse,
  AnilistPaginatedResponse,
} from '../types/Anilist';
import { getAnilistMedia, pageInfos } from './GraphQLQueries';
import { PopcornTrackerApi } from './PopcornTrackerApi';

const url = POPCORN_TRACKER_ANILIST_API_URL;
const getQueryFilter = () => `genre_not_in: ["HENTAI"]`;

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

  static async getMedias(
    ids: Array<number>,
    isFull = false
  ): Promise<{
    media: Array<any>;
    invalidIds: Array<number>;
  }> {
    const query = `
    query ($ids: [Int]) {
      Page(perPage: 50) {
        media(id_in: $ids, ${getQueryFilter()}) ${getAnilistMedia(isFull)}
      }
    }
  `;

    const variables = { ids };

    const response = await AnilistApi.fetchQL(url, query, variables);

    const media = response.data.Page.media ?? [];

    const returnedIds = media.map((m: any) => m.id);
    const invalidIds = ids.filter((id) => !returnedIds.includes(id));

    return {
      media,
      invalidIds,
    };
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
        media(search: "${name}", type: ${type}, ${getQueryFilter()}) ${getAnilistMedia()}
        }
      }
    `;

    return AnilistApi.fetchQL(url, query);
  };

  static async fetchQL(
    url: string,
    query: string,
    variables?: Record<string, any>
  ) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      throw new Error(data.errors?.[0]?.message ?? 'GraphQL request failed');
    }

    return data;
  }
}
