export interface KitsuAnime {
  id: string;
  type: string;
  attributes: {
    slug: string;
    synopsis: string;
    description: string;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
    };
    canonicalTitle: string;
    abbreviatedTitles: string[];
    averageRating: string | null;
    startDate: string | null;
    endDate: string | null;
    episodeCount: number | null;
    episodeLength: number | null;
    posterImage: {
      tiny: string;
      small: string;
      medium: string;
      large: string;
      original: string;
    } | null;
  };
}

export interface KitsuSearchResponse {
  data: KitsuAnime[];
  meta: {
    count: number;
  };
}

export interface KitsuEpisodesResponse {
  data: KitsuEpisode[];
  meta: {
    count: number;
  };
  links: {
    first: string;
    next: string | null;
    last: string;
  };
}

export interface KitsuThumbnailDimension {
  width: number;
  height: number;
}

export interface KitsuEpisode {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
    updatedAt: string;
    synopsis: string | null;
    description: string | null;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
    };
    canonicalTitle: string;
    seasonNumber: number;
    number: number;
    relativeNumber: number | null;
    airdate: string | null;
    length: number | null;
    posterImage: KitsuAnime['attributes']['posterImage'];
    thumbnail: {
      original: string | null;
      large: string | null;
      medium: string | null;
      small: string | null;
      tiny: string | null;
      meta: {
        dimensions: {
          tiny: KitsuThumbnailDimension;
          small: KitsuThumbnailDimension;
          medium: KitsuThumbnailDimension;
          large: KitsuThumbnailDimension;
        };
      };
    } | null;
  };
}
