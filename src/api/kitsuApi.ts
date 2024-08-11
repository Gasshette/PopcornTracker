import {
  KitsuAnime,
  KitsuEpisodesResponse,
  KitsuSearchResponse,
} from '../types/Kitsu';

const KITSU_BASE_URL = 'https://kitsu.io/api/edge';
export const PAGE_LIMIT = 20; // Kitsu's default page limit

export const kitsuApi = {
  searchAnime: async (title: string): Promise<Array<KitsuAnime>> => {
    const response = await fetch(
      `${KITSU_BASE_URL}/anime?filter[text]=${encodeURIComponent(title)}&page[limit]=10`
    );

    if (!response.ok) {
      throw new Error(`Failed to search anime: ${response.statusText}`);
    }

    const data: KitsuSearchResponse = await response.json();
    return data.data;
  },
  fetchEpisodesPage: async (
    animeId: string,
    offset: number,
    limit: number = PAGE_LIMIT
  ): Promise<KitsuEpisodesResponse> => {
    const response = await fetch(
      `${KITSU_BASE_URL}/anime/${animeId}/episodes?page[limit]=${limit}&page[offset]=${offset}&sort=number`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          data: [],
          meta: { count: 0 },
          links: { first: '', next: null, last: '' },
        };
      }
      throw new Error(`Failed to fetch episodes: ${response.statusText}`);
    }

    return await response.json();
  },
};
