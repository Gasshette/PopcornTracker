import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { AnilistMedia } from '../types/Anilist';
import { DEBUGS } from '../const';
import { KitsuAnime, KitsuEpisode } from '../types/Kitsu';
import { kitsuApi, PAGE_LIMIT } from '../api/kitsuApi';
import { kitsuQueryKeys } from '../queryKeys/kitsuQueryKeys';

// ============================================================================
// Types
// ============================================================================

interface KitsuMatchResult {
  kitsuId: string;
  episodeDuration: number | null;
  posterImage: KitsuAnime['attributes']['posterImage'];
}

interface UseKitsuEpisodesResult {
  episodes: KitsuEpisode[];
  loading: boolean;
  error: Error | null;
  kitsuId: string | null;
  episodeDuration: number | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const RATE_LIMIT_DELAY = 400; // Kitsu has generous rate limits

// ============================================================================
// API Functions
// ============================================================================

// ============================================================================
// Matching Algorithm
// ============================================================================

function calculateMatchScore(
  anilistMedia: AnilistMedia,
  kitsuAnime: KitsuAnime
): number {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');
  let score = 0;

  DEBUGS.KITSU && console.group(`-----DEBUG KITSU (${kitsuAnime.id})-----`);
  const scoreRepartition: Record<string, any> = {};

  // Build title sets
  const anilistTitles = [
    anilistMedia.title.native,
    anilistMedia.title.romaji,
    anilistMedia.title.english,
  ]
    .filter((title): title is string => Boolean(title))
    .map((t) => normalize(t));

  const kitsuTitles = [
    kitsuAnime.attributes.canonicalTitle,
    kitsuAnime.attributes.titles.en,
    kitsuAnime.attributes.titles.en_jp,
    ...kitsuAnime.attributes.abbreviatedTitles,
  ]
    .filter((title): title is string => Boolean(title))
    .map((t) => normalize(t));

  // Title matching: best match only
  let bestTitleScore = 0;
  for (const aTitle of anilistTitles) {
    for (const kTitle of kitsuTitles) {
      if (aTitle === kTitle) {
        bestTitleScore = Math.max(bestTitleScore, 50);
        scoreRepartition['titleExact'] = 50;
      } else if (aTitle.includes(kTitle) || kTitle.includes(aTitle)) {
        bestTitleScore = Math.max(bestTitleScore, 30);
        scoreRepartition['titlePartial'] = 30;
      }
    }
  }
  score += bestTitleScore;

  // Year matching
  if (kitsuAnime.attributes.startDate) {
    const kitsuYear = new Date(kitsuAnime.attributes.startDate).getFullYear();
    const yearDiff = Math.abs(kitsuYear - anilistMedia.seasonYear);

    DEBUGS.KITSU && console.log('[DEBUG] Years, diff:', kitsuYear, yearDiff);
    if (yearDiff === 0) {
      score += 20;
      scoreRepartition['startDate'] = 20;
    } else if (yearDiff === 1) {
      score += 10;
      scoreRepartition['startDate'] = 10;
    }
  }

  // Episode count matching
  if (kitsuAnime.attributes.episodeCount && anilistMedia.episodes) {
    const episodeDiff = Math.abs(
      kitsuAnime.attributes.episodeCount - anilistMedia.episodes
    );
    const tolerance = anilistMedia.episodes * 0.1;

    DEBUGS.KITSU && console.log('[DEBUG] Episode diff', episodeDiff);
    if (episodeDiff === 0) {
      score += 20;
      scoreRepartition['episodeCount'] = 20;
    } else if (episodeDiff <= tolerance) {
      score += 10;
      scoreRepartition['episodeCount'] = 10;
    }
  }

  DEBUGS.KITSU && console.log('[DEBUG] Score repartition:', scoreRepartition);
  DEBUGS.KITSU && console.log('[DEBUG] Total score', score);
  DEBUGS.KITSU && console.groupEnd();

  return score;
}

function findBestMatch(
  anilistMedia: AnilistMedia,
  kitsuResults: KitsuAnime[]
): KitsuAnime | null {
  const MIN_SCORE_THRESHOLD = 40;

  let bestMatch: KitsuAnime | null = null;
  let highestScore = 0;

  for (const result of kitsuResults) {
    const score = calculateMatchScore(anilistMedia, result);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = result;
    }
  }

  return highestScore >= MIN_SCORE_THRESHOLD ? bestMatch : null;
}

// ============================================================================
// Query Functions
// ============================================================================

async function findKitsuMatch(
  media: AnilistMedia
): Promise<KitsuMatchResult | null> {
  const titlesToTry = [
    media.title.english,
    media.title.romaji,
    media.title.native,
  ].filter(Boolean);

  for (const searchTitle of titlesToTry) {
    const searchResults = await kitsuApi.searchAnime(searchTitle);

    if (searchResults.length === 0) {
      continue;
    }

    const bestMatch = findBestMatch(media, searchResults);

    if (bestMatch) {
      DEBUGS.KITSU && console.warn('[DEBUG] Best match found:', bestMatch);
      return {
        kitsuId: bestMatch.id,
        episodeDuration: bestMatch.attributes.episodeLength ?? null,
        posterImage: bestMatch.attributes.posterImage,
      };
    }
  }

  return null;
}

// ============================================================================
// React Query Hooks
// ============================================================================

// Hook 1: Find the Kitsu ID match
function useKitsuMatch(media: AnilistMedia | null) {
  return useQuery({
    queryKey: kitsuQueryKeys.findMatch(media?.id),
    queryFn: () => {
      if (!media) throw new Error('Media is required');
      return findKitsuMatch(media);
    },
    enabled: Boolean(media),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
}

// Hook 2: Fetch episodes with infinite query
function useKitsuEpisodesInfinite(
  kitsuId: string | null,
  posterImage: KitsuAnime['attributes']['posterImage'] | null
) {
  return useInfiniteQuery({
    queryKey: kitsuQueryKeys.fetchEpisodes(kitsuId),
    queryFn: async ({ pageParam }) => {
      if (!kitsuId) throw new Error('Kitsu ID is required');

      // Add rate limiting between page requests
      if (pageParam > 0) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }

      const response = await kitsuApi.fetchEpisodesPage(
        kitsuId,
        pageParam,
        PAGE_LIMIT
      );

      // Attach poster image to episodes
      response.data.forEach((ep) => {
        ep.attributes.posterImage = posterImage;
      });

      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * PAGE_LIMIT;
      const totalCount = lastPage.meta.count;

      if (currentOffset >= totalCount) return undefined;
      return currentOffset;
    },
    enabled: Boolean(kitsuId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

// Hook 3: Combined hook for easy usage
export function useKitsuEpisodes(
  media: AnilistMedia | null
): UseKitsuEpisodesResult {
  // Step 1: Find the Kitsu ID match
  const matchQuery = useKitsuMatch(media);

  // Step 2: Fetch episodes using the Kitsu ID
  const episodesQuery = useKitsuEpisodesInfinite(
    matchQuery.data?.kitsuId ?? null,
    matchQuery.data?.posterImage ?? null
  );

  // Flatten all episodes from all pages
  const allEpisodes =
    episodesQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    episodes: allEpisodes,
    loading: matchQuery.isLoading || episodesQuery.isLoading,
    error: matchQuery.error || episodesQuery.error,
    kitsuId: matchQuery.data?.kitsuId ?? null,
    episodeDuration: matchQuery.data?.episodeDuration ?? null,
    hasNextPage: episodesQuery.hasNextPage ?? false,
    isFetchingNextPage: episodesQuery.isFetchingNextPage,
    fetchNextPage: episodesQuery.fetchNextPage,
  };
}
