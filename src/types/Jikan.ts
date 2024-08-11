export interface JikanError {
  status: string;
  type: string;
  message: string;
  error: null;
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
  forum_url: string | null;
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  titles: Array<{ type: string; title: string }>;
  title_synonyms: Array<string>;
  type: string;
  episodes: number | null;
  year: number | null;
  score: number | null;
  duration: string | null;
}

export interface FetchJikanEpisodesResult {
  episodes: JikanEpisode[];
  malId: number | null;
  episodeDuration: number | null;
}

export interface JikanSearchResponse {
  data: JikanAnime[];
}

export interface JikanEpisodesResponse {
  data: JikanEpisode[];
  pagination: {
    has_next_page: boolean;
    last_visible_page: number;
  };
}
