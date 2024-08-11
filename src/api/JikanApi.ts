import {
  JikanAnime,
  JikanEpisodesResponse,
  JikanSearchResponse,
} from '../types/Jikan';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export const jikanApi = {
  searchAnime: async (title: string): Promise<JikanAnime[]> => {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(title)}&limit=10`
    );

    if (!response.ok) {
      throw new Error(`Failed to search anime: ${response.statusText}`);
    }

    const data: JikanSearchResponse = await response.json();

    return data.data;
  },
  fetchEpisodesPage: async (
    malId: number,
    page: number
  ): Promise<JikanEpisodesResponse> => {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime/${malId}/episodes?page=${page}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          data: [],
          pagination: {
            has_next_page: false,
            last_visible_page: 1,
          },
        };
      }
      throw new Error(`Failed to fetch episodes: ${response.statusText}`);
    }

    return await response.json();
  },
};
