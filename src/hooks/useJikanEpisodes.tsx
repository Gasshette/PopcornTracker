import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { AnilistMedia } from '../types/Anilist';
import { DEBUGS } from '../const';
import { jikanQueryKeys } from '../queryKeys/jikanQueryKeys';
import { jikanApi } from '../api/JikanApi';

// ============================================================================
// Types
// ============================================================================

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

interface JikanAnime {
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

interface JikanMatchResult {
  malId: number;
  episodeDuration: number | null;
}

interface UseJikanEpisodesResult {
  episodes: JikanEpisode[];
  loading: boolean;
  error: Error | null;
  malId: number | null;
  episodeDuration: number | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const RATE_LIMIT_DELAY = 350; // ms between requests

// ============================================================================
// Utility Functions
// ============================================================================

function parseDurationToSeconds(durationString: string | null): number | null {
  if (!durationString) return null;

  const hourMatch = durationString.match(/(\d+)\s*hr/);
  const minMatch = durationString.match(/(\d+)\s*min/);

  let totalSeconds = 0;

  if (hourMatch) {
    totalSeconds += parseInt(hourMatch[1], 10) * 3600;
  }
  if (minMatch) {
    totalSeconds += parseInt(minMatch[1], 10) * 60;
  }

  return totalSeconds > 0 ? totalSeconds : null;
}

function findBestMatch(
  anilistMedia: AnilistMedia,
  jikanResults: JikanAnime[]
): JikanAnime | null {
  const MIN_SCORE_THRESHOLD = 40;

  let bestMatch: JikanAnime | null = null;
  let highestScore = 0;

  for (const result of jikanResults) {
    const score = calculateMatchScore(anilistMedia, result);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = result;
    }
  }

  return highestScore >= MIN_SCORE_THRESHOLD ? bestMatch : null;
}

async function findJikanMatch(
  media: AnilistMedia
): Promise<JikanMatchResult | null> {
  const titlesToTry = [
    media.title.english,
    media.title.romaji,
    media.title.native,
  ].filter(Boolean);

  for (const searchTitle of titlesToTry) {
    const searchResults = await jikanApi.searchAnime(searchTitle);

    if (searchResults.length === 0) {
      continue;
    }

    const bestMatch = findBestMatch(media, searchResults);

    if (bestMatch) {
      DEBUGS.JIKAN && console.warn('[DEBUG] Best match found:', bestMatch);
      return {
        malId: bestMatch.mal_id,
        episodeDuration: parseDurationToSeconds(bestMatch.duration),
      };
    }
  }

  return null;
}
function calculateMatchScore(
  anilistMedia: AnilistMedia,
  jikanAnime: JikanAnime
): number {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');
  let score = 0;

  DEBUGS.JIKAN && console.group(`-----DEBUG JIKAN (${jikanAnime.mal_id})-----`);
  const scoreRepartition: Record<string, any> = {};

  // Build title sets
  const anilistTitles = [
    anilistMedia.title.romaji,
    anilistMedia.title.english,
    anilistMedia.title.native,
  ]
    .filter((t): t is string => Boolean(t))
    .map((t) => normalize(t));

  const jikanTitles = [
    jikanAnime.title,
    jikanAnime.title_english,
    jikanAnime.title_japanese,
    ...(jikanAnime.titles.map((t) => t.title) ?? []),
    ...(jikanAnime.title_synonyms ?? []),
  ]
    .filter((t): t is string => Boolean(t))
    .map((t) => normalize(t));

  // Title matching: best match only
  let bestTitleScore = 0;
  for (const aTitle of anilistTitles) {
    for (const jTitle of jikanTitles) {
      if (aTitle === jTitle) {
        bestTitleScore = Math.max(bestTitleScore, 50);
        scoreRepartition[`titleExact`] = 50;
      } else if (aTitle.includes(jTitle) || jTitle.includes(aTitle)) {
        bestTitleScore = Math.max(bestTitleScore, 30);
        scoreRepartition[`titlePartial`] = 30;
      }
    }
  }
  score += bestTitleScore;

  // Year matching
  if (jikanAnime.year && anilistMedia.seasonYear) {
    const yearDiff = Math.abs(jikanAnime.year - anilistMedia.seasonYear);
    if (yearDiff === 0) {
      score += 20;
      scoreRepartition['startDate'] = 20;
    } else if (yearDiff === 1) {
      score += 10;
      scoreRepartition['startDate'] = 10;
    }
  }

  // Episode count matching
  if (jikanAnime.episodes && anilistMedia.episodes) {
    const episodeDiff = Math.abs(jikanAnime.episodes - anilistMedia.episodes);
    const tolerance = anilistMedia.episodes * 0.1;
    if (episodeDiff === 0) {
      score += 20;
      scoreRepartition['episodeCount'] = 20;
    } else if (episodeDiff <= tolerance) {
      score += 10;
      scoreRepartition['episodeCount'] = 10;
    }
  }

  DEBUGS.JIKAN && console.log('[DEBUG] Score repartition:', scoreRepartition);
  DEBUGS.JIKAN && console.log('[DEBUG] Total score', score);
  DEBUGS.JIKAN && console.groupEnd();

  return score;
}
// ============================================================================
// React Query Hooks
// ============================================================================

// Hook 1: Find the MAL ID match
function useJikanMatch(media: AnilistMedia | null) {
  return useQuery({
    queryKey: jikanQueryKeys.findMatch(media?.id),
    queryFn: () => {
      if (!media) throw new Error('Media is required');
      return findJikanMatch(media);
    },
    enabled: Boolean(media),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
}

// Hook 2: Fetch episodes with infinite query
function useJikanEpisodesInfinite(malId: number | null) {
  return useInfiniteQuery({
    queryKey: jikanQueryKeys.fetchEpisodes(malId),
    queryFn: async ({ pageParam }) => {
      if (!malId) throw new Error('MAL ID is required');

      // Add rate limiting between page requests
      if (pageParam > 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }

      return jikanApi.fetchEpisodesPage(malId, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.pagination.has_next_page) return undefined;
      return allPages.length + 1;
    },
    enabled: Boolean(malId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

// Hook 3: Combined hook for easy usage
export function useJikanEpisodes(
  media: AnilistMedia | null
): UseJikanEpisodesResult {
  // Step 1: Find the MAL ID match
  const matchQuery = useJikanMatch(media);

  // Step 2: Fetch episodes using the MAL ID
  const episodesQuery = useJikanEpisodesInfinite(
    matchQuery.data?.malId ?? null
  );

  // Flatten all episodes from all pages
  const allEpisodes =
    episodesQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    episodes: allEpisodes,
    loading: matchQuery.isLoading || episodesQuery.isLoading,
    error: matchQuery.error || episodesQuery.error,
    malId: matchQuery.data?.malId ?? null,
    episodeDuration: matchQuery.data?.episodeDuration ?? null,
    hasNextPage: episodesQuery.hasNextPage ?? false,
    isFetchingNextPage: episodesQuery.isFetchingNextPage,
    fetchNextPage: episodesQuery.fetchNextPage,
  };
}
