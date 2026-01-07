import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { AnilistMedia } from '../types/Anilist';
import { DEBUGS } from '../const';
import { KitsuAnime, KitsuEpisode } from '../types/Kitsu';
import { kitsuApi, PAGE_LIMIT } from '../api/kitsuApi';
import { kitsuQueryKeys } from '../queryKeys/kitsuQueryKeys';

interface KitsuMatchResult {
  bestMatch: KitsuAnime;
  kitsuId: string;
  episodeDuration: number | null;
  posterImage: KitsuAnime['attributes']['posterImage'];
}

interface UseKitsuEpisodesResult {
  anime: KitsuAnime | undefined;
  episodes: KitsuEpisode[];
  loading: boolean;
  error: Error | null;
  kitsuId: string | null;
  episodeDuration: number | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const RATE_LIMIT_DELAY = 400;

interface FindBestMatchResult {
  bestMatch: KitsuAnime | null;
  score: number;
}

function findBestMatch(
  anilistMedia: AnilistMedia,
  kitsuResults: KitsuAnime[]
): FindBestMatchResult {
  const MIN_SCORE_THRESHOLD = 0.215;

  const titlesToSearch = [
    anilistMedia.title.english,
    anilistMedia.title.romaji,
    anilistMedia.title.native,
  ].filter(Boolean);

  let bestMatch: KitsuAnime | null = null;
  let bestScore = 1;

  for (const anime of kitsuResults) {
    const animeAllTitles = [
      anime.attributes.canonicalTitle,
      anime.attributes.titles.en,
      anime.attributes.titles.en_jp,
      ...anime.attributes.abbreviatedTitles,
    ].filter(Boolean);

    const fuse = new Fuse(animeAllTitles, {
      threshold: 1.0,
      includeScore: true,
      ignoreLocation: true,
      distance: 100,
    });

    let bestTitleScore = 1;
    for (const searchTitle of titlesToSearch) {
      const results = fuse.search(searchTitle);
      if (results.length > 0 && results[0].score !== undefined) {
        bestTitleScore = Math.min(bestTitleScore, results[0].score);
      }
    }

    let bonusScore = 0;

    if (anime.attributes.startDate) {
      const kitsuYear = new Date(anime.attributes.startDate).getFullYear();
      const yearDiff = Math.abs(kitsuYear - anilistMedia.seasonYear);

      if (yearDiff === 0) {
        bonusScore += 0.15;
      } else if (yearDiff === 1) {
        bonusScore += 0.08;
      }
    }

    if (anime.attributes.episodeCount && anilistMedia.episodes) {
      const episodeDiff = Math.abs(
        anime.attributes.episodeCount - anilistMedia.episodes
      );
      const tolerance = anilistMedia.episodes * 0.1;

      if (episodeDiff === 0) {
        bonusScore += 0.12;
      } else if (episodeDiff <= tolerance) {
        bonusScore += 0.06;
      }
    }

    const finalScore = Math.max(0, bestTitleScore - bonusScore);

    DEBUGS.KITSU &&
      console.log(`[DEBUG] Candidate (Kitsu ID: ${anime.id}):`, {
        title: anime.attributes.canonicalTitle,
        titleScore: bestTitleScore.toFixed(3),
        bonusScore: bonusScore.toFixed(3),
        finalScore: finalScore.toFixed(3),
        year: anime.attributes.startDate
          ? new Date(anime.attributes.startDate).getFullYear()
          : null,
        episodes: anime.attributes.episodeCount,
        passesThreshold: finalScore < MIN_SCORE_THRESHOLD,
      });

    if (finalScore < MIN_SCORE_THRESHOLD && finalScore < bestScore) {
      bestScore = finalScore;
      bestMatch = anime;
    }
  }

  DEBUGS.KITSU &&
    console.warn(
      `[DEBUG] Best match overall (Score=${bestScore.toFixed(3)}):`,
      bestMatch
    );

  return { bestMatch, score: bestScore };
}

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

    const { bestMatch } = findBestMatch(media, searchResults);

    if (bestMatch) {
      return {
        bestMatch,
        kitsuId: bestMatch.id,
        episodeDuration: bestMatch.attributes.episodeLength ?? null,
        posterImage: bestMatch.attributes.posterImage,
      };
    }
  }

  DEBUGS.KITSU && console.warn('[DEBUG] No best match found');

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
    anime: matchQuery.data?.bestMatch,
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
