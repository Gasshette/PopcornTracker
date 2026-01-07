import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { AnilistMedia } from '../types/Anilist';
import { DEBUGS } from '../const';
import { jikanQueryKeys } from '../queryKeys/jikanQueryKeys';
import { jikanApi } from '../api/JikanApi';

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
  anime: JikanAnime;
  malId: number;
  episodeDuration: number | null;
}

interface UseJikanEpisodesResult {
  anime: JikanAnime | undefined;
  episodes: JikanEpisode[];
  loading: boolean;
  error: Error | null;
  malId: number | null;
  episodeDuration: number | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const RATE_LIMIT_DELAY = 350; // ms between requests

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

interface FindBestMatchResult {
  bestMatch: JikanAnime | null;
  score: number;
}

function findBestMatch(
  anilistMedia: AnilistMedia,
  jikanResults: JikanAnime[]
): FindBestMatchResult {
  const MIN_SCORE_THRESHOLD = 0.1;

  const titlesToSearch = [
    anilistMedia.title.english,
    anilistMedia.title.romaji,
    anilistMedia.title.native,
  ].filter(Boolean);

  let bestMatch: JikanAnime | null = null;
  let bestScore = 1;

  for (const anime of jikanResults) {
    const animeAllTitles = [
      anime.title,
      anime.title_english,
      anime.title_japanese,
      ...anime.titles.map((t) => t.title),
      ...anime.title_synonyms,
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

    if (anime.year && anilistMedia.seasonYear) {
      const yearDiff = Math.abs(anime.year - anilistMedia.seasonYear);
      if (yearDiff === 0) {
        bonusScore += 0.15;
      } else if (yearDiff === 1) {
        bonusScore += 0.08;
      }
    }

    if (anime.episodes && anilistMedia.episodes) {
      const episodeDiff = Math.abs(anime.episodes - anilistMedia.episodes);
      const tolerance = anilistMedia.episodes * 0.1;
      if (episodeDiff === 0) {
        bonusScore += 0.12;
      } else if (episodeDiff <= tolerance) {
        bonusScore += 0.06;
      }
    }

    const finalScore = Math.max(0, bestTitleScore - bonusScore);

    DEBUGS.JIKAN &&
      console.log(`[DEBUG] Candidate (MAL ID: ${anime.mal_id}):`, {
        title: anime.title,
        titleScore: bestTitleScore.toFixed(3),
        bonusScore: bonusScore.toFixed(3),
        finalScore: finalScore.toFixed(3),
        year: anime.year,
        episodes: anime.episodes,
        passesThreshold: finalScore < MIN_SCORE_THRESHOLD,
      });

    if (finalScore < MIN_SCORE_THRESHOLD && finalScore < bestScore) {
      bestScore = finalScore;
      bestMatch = anime;
    }
  }

  DEBUGS.JIKAN &&
    console.warn(
      `[DEBUG] Best match overall (Score=${bestScore.toFixed(3)}):`,
      bestMatch
    );

  return { bestMatch, score: bestScore };
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

    const { bestMatch } = findBestMatch(media, searchResults);

    if (bestMatch) {
      return {
        anime: bestMatch,
        malId: bestMatch.mal_id,
        episodeDuration: parseDurationToSeconds(bestMatch.duration),
      };
    }
  }

  DEBUGS.JIKAN && console.warn('[DEBUG] No best match found');

  return null;
}

// Hook 1: Find the MAL ID match
function useJikanMatch(media: AnilistMedia | null) {
  return useQuery({
    queryKey: jikanQueryKeys.findMatch(media?.id),
    queryFn: async () => {
      if (!media) throw new Error('Media is required');

      if (media.idMal) {
        DEBUGS.JIKAN &&
          console.log('[DEBUG] Using direct MAL ID:', media.idMal);

        const anime = await jikanApi.fetchById(media.idMal, 'anime');

        const matchResult: JikanMatchResult = {
          anime,
          episodeDuration: parseDurationToSeconds(anime.duration),
          malId: media.idMal,
        };

        return matchResult;
      }

      DEBUGS.JIKAN && console.log('[DEBUG] No MAL ID, performing fuzzy search');
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
    anime: matchQuery.data?.anime,
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
