export type MediaType = 'ANIME' | 'MANGA';

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AnilistMedia {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    medium: string;
    large: string;
    /** Hexa color representing the media */
    color: string;
  };
  bannerImage: string;
  episodes: number;
  duration: number;
  chapters: number;
  averageScore: number;
  genres: Array<string>;
  season: string;
  seasonYear: number;
  streamingEpisodes: Array<{
    title: string;
    thumbnail: string;
    site: string;
    url: string;
  }>;
  airingSchedule: {
    nodes: Array<{
      id: number;
      episode: number;
      mediaId: number;
      airingAt: number;
      timeUntilAiring: number;
    }>;
  };
}
export interface AnilistPaginatedResponse {
  data: {
    Page: {
      media: Array<AnilistMedia>;
      pageInfo: PageInfo;
    };
  };
}

export interface AnilistMultipleResponse {
  data: Record<string, AnilistMedia>;
}

export interface AnilistUniqueResponse {
  data: {
    Media: AnilistMedia;
  };
}
