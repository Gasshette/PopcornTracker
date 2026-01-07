import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { BigLoader } from '../../../components/BigLoader';
import { NoDataMessageDisplayer } from '../../../components/NoDataMessageDisplayer';
import { useEpisodePages } from '../../../contexts/EpisodePagesProvider';
import {
  JikanEpisode,
  useJikanEpisodes,
} from '../../../hooks/useJikanEpisodes';
import { useKitsuEpisodes } from '../../../hooks/useKitsuEpisodes';
import { AnilistMedia } from '../../../types/Anilist';
import { Item, Status } from '../../../types/Item';
import { KitsuEpisode } from '../../../types/Kitsu';
import { AnimeEpisodeCardItem } from './AnimeEpisodeCardItem';

const PAGE_SIZE = 20;

/**
 * Extracts episode title from AniList streaming episode title
 * Removes "Episode X - " prefix if present
 */
function extractAnilistEpisodeTitle(title: string): string {
  const match = title.match(/^Episode\s+\d+\s*-\s*(.+)$/i);
  return match ? match[1].trim() : title;
}

/**
 * Gets the best thumbnail from all available sources
 * Priority: AniList streaming → Kitsu thumbnail → Kitsu poster → Media banner/cover
 */
function getThumbnail(
  episodeNumber: number,
  jikanEpisode: JikanEpisode | undefined,
  kitsuEpisode: KitsuEpisode | undefined,
  media: AnilistMedia
): string | null {
  // ANILIST - Try to match by episode number or title
  const anilistEpisode = media.streamingEpisodes.find((sEp) => {
    // Try to extract episode number from title (e.g., "Episode 26 - Title")
    const match = sEp.title.match(/^Episode\s+(\d+)/i);
    if (match) {
      const epNum = parseInt(match[1], 10);
      return epNum === episodeNumber;
    }
    // Fallback: match by title if jikanEpisode exists
    return jikanEpisode && sEp.title.includes(jikanEpisode.title);
  });

  if (anilistEpisode?.thumbnail) {
    return anilistEpisode.thumbnail;
  }

  // KITSU - thumbnail
  const small = kitsuEpisode?.attributes.thumbnail?.small;
  const medium = kitsuEpisode?.attributes.thumbnail?.medium;
  const large = kitsuEpisode?.attributes.thumbnail?.large;
  const original = kitsuEpisode?.attributes.thumbnail?.original;
  const tiny = kitsuEpisode?.attributes.thumbnail?.tiny;

  if (small || medium || large || original || tiny) {
    return small ?? medium ?? large ?? original ?? tiny ?? null;
  }

  // KITSU - poster image
  const pSmall = kitsuEpisode?.attributes.posterImage?.small;
  const pMedium = kitsuEpisode?.attributes.posterImage?.medium;
  const pLarge = kitsuEpisode?.attributes.posterImage?.large;
  const pOriginal = kitsuEpisode?.attributes.posterImage?.original;
  const pTiny = kitsuEpisode?.attributes.posterImage?.tiny;

  if (pSmall || pMedium || pLarge || pOriginal || pTiny) {
    return pSmall ?? pMedium ?? pLarge ?? pOriginal ?? pTiny ?? null;
  }

  // Fallback to media images
  return media.bannerImage ?? media.coverImage.large ?? media.coverImage.medium;
}

/**
 * Gets the best episode title from all available sources
 * Priority: Jikan → Kitsu → AniList → Fallback "Episode X"
 */
function getEpisodeTitle(
  episodeNumber: number,
  jikanEpisode: JikanEpisode | undefined,
  kitsuEpisode: KitsuEpisode | undefined,
  media: AnilistMedia
): { english: string | null; romanji: string | null } {
  // Priority 1: Jikan
  if (jikanEpisode?.title) {
    return {
      english: jikanEpisode.title,
      romanji: jikanEpisode.title_romanji,
    };
  }

  // Priority 2: Kitsu
  if (kitsuEpisode?.attributes.canonicalTitle) {
    return {
      english: kitsuEpisode.attributes.canonicalTitle,
      romanji: null,
    };
  }

  // Priority 3: AniList
  const anilistEpisode = media.streamingEpisodes.find((sEp) => {
    const match = sEp.title.match(/^Episode\s+(\d+)/i);
    if (match) {
      const epNum = parseInt(match[1], 10);
      return epNum === episodeNumber;
    }
    return false;
  });

  if (anilistEpisode) {
    return {
      english: extractAnilistEpisodeTitle(anilistEpisode.title),
      romanji: null,
    };
  }

  // Fallback
  return {
    english: `Episode ${episodeNumber}`,
    romanji: null,
  };
}

/**
 * Gets the best air date from all available sources
 * Priority: Jikan → Kitsu → AniList schedule
 */
function getAirDate(
  episodeNumber: number,
  jikanEpisode: JikanEpisode | undefined,
  kitsuEpisode: KitsuEpisode | undefined,
  media: AnilistMedia
): { airingAt: string | null; aired: boolean | null } {
  // Priority 1: Jikan
  if (jikanEpisode?.aired) {
    const rawAiringAt = dayjs.utc(jikanEpisode.aired);
    return {
      airingAt: rawAiringAt.format('MMM D, YYYY'),
      aired: rawAiringAt.isBefore(dayjs()),
    };
  }

  // Priority 2: Kitsu
  if (kitsuEpisode?.attributes.airdate) {
    const rawAiringAt = dayjs.utc(kitsuEpisode.attributes.airdate);
    return {
      airingAt: rawAiringAt.format('MMM D, YYYY'),
      aired: rawAiringAt.isBefore(dayjs()),
    };
  }

  // Priority 3: AniList schedule
  const scheduleNode = media.airingSchedule.nodes.find(
    (node) => node.episode === episodeNumber
  );

  if (scheduleNode?.airingAt) {
    const rawAiringAt = dayjs.utc(scheduleNode.airingAt * 1000);
    return {
      airingAt: rawAiringAt.format('MMM D, YYYY'),
      aired: rawAiringAt.isBefore(dayjs()),
    };
  }

  return { airingAt: null, aired: null };
}

/**
 * Gets episode duration in seconds
 * Priority: Kitsu episode length → Jikan average → Kitsu average
 */
function getEpisodeDuration(
  kitsuEpisode: KitsuEpisode | undefined,
  jikanAverageEpisodeDuration: number | null,
  kitsuAverageEpisodeDuration: number | null
): number | null {
  if (kitsuEpisode?.attributes.length) {
    return kitsuEpisode.attributes.length * 60;
  }

  return jikanAverageEpisodeDuration ?? kitsuAverageEpisodeDuration ?? null;
}

/**
 * Creates a merged episode from all available sources
 */
function createMergedEpisode(
  episodeNumber: number,
  jikanEpisode: JikanEpisode | undefined,
  kitsuEpisode: KitsuEpisode | undefined,
  media: AnilistMedia,
  jikanAverageEpisodeDuration: number | null,
  kitsuAverageEpisodeDuration: number | null
): AnimeEpisodeCardItem {
  const titles = getEpisodeTitle(
    episodeNumber,
    jikanEpisode,
    kitsuEpisode,
    media
  );
  const { airingAt, aired } = getAirDate(
    episodeNumber,
    jikanEpisode,
    kitsuEpisode,
    media
  );
  const duration = getEpisodeDuration(
    kitsuEpisode,
    jikanAverageEpisodeDuration,
    kitsuAverageEpisodeDuration
  );
  const thumbnail = getThumbnail(
    episodeNumber,
    jikanEpisode,
    kitsuEpisode,
    media
  );

  return {
    episodeNumber,
    titles,
    duration,
    airingAt,
    aired,
    thumbnail,
    color: media.coverImage.color,
  };
}

interface AnimeEpisodesDisplayerProps {
  media: AnilistMedia;
  item: Item;
}

export const AnimeEpisodesDisplayer = (props: AnimeEpisodesDisplayerProps) => {
  const { media, item } = props;

  // Get the episode pages context to track loaded pages per anime
  const { getLoadedPages, setLoadedPages } = useEpisodePages();

  // Get the previously loaded pages for this anime (persists across navigation)
  // Use item.id since we fully control this identifier
  const loadedPages = getLoadedPages(item.id);

  const {
    anime: jikanAnime,
    episodes: jikanEpisodes,
    episodeDuration: jikanAverageEpisodeDuration,
    loading: isJikanLoading,
    error: _jikanError,
    malId: _jikanMalId,
    hasNextPage: jikanHasNextPage,
    isFetchingNextPage: jikanIsFetchingNextPage,
    fetchNextPage: jikanFetchNextPage,
  } = useJikanEpisodes(media);

  const {
    anime: kitsuAnime,
    episodes: kitsuEpisodes,
    loading: isKitsuLoading,
    error: _kitsuError,
    kitsuId: _,
    episodeDuration: kitsuAverageEpisodeDuration,
    hasNextPage: kitsuHasNextPage,
    isFetchingNextPage: kitsuIsFetchingNextPage,
    fetchNextPage: kitsuFetchNextPage,
  } = useKitsuEpisodes(media);

  const isUnderSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // Calculate total episodes - use the maximum between metadata and actual episode data
  const metadataTotalEpisodes =
    jikanAnime?.episodes ??
    kitsuAnime?.attributes.episodeCount ??
    media.episodes ??
    0;

  const actualMaxEpisode = Math.max(
    jikanEpisodes.length > 0
      ? Math.max(...jikanEpisodes.map((ep) => ep.mal_id))
      : 0,
    kitsuEpisodes.length > 0
      ? Math.max(...kitsuEpisodes.map((ep) => ep.attributes.number))
      : 0
  );

  // If actual episodes exceed metadata, trust the actual data
  const totalEpisodes = Math.max(metadataTotalEpisodes, actualMaxEpisode);

  const episodes = useMemo(() => {
    // Use the loaded pages from context (persists across navigation)
    const displayedPages = loadedPages;

    const maxDisplayEpisode = Math.min(
      displayedPages * PAGE_SIZE,
      totalEpisodes || Infinity
    );

    // Create a map to store merged episodes
    const episodeMap = new Map<number, AnimeEpisodeCardItem>();

    // Get the slice of Jikan episodes we need for the current display limit
    const relevantJikanEpisodes = jikanEpisodes.filter(
      (jEp) => jEp.mal_id <= maxDisplayEpisode
    );

    // Get the slice of Kitsu episodes we need
    const relevantKitsuEpisodes = kitsuEpisodes.filter(
      (kEp) => kEp.attributes.number <= maxDisplayEpisode
    );

    // Merge episodes from both sources
    for (let i = 1; i <= maxDisplayEpisode; i++) {
      const jikanEpisode = relevantJikanEpisodes.find(
        (jEp) => jEp.mal_id === i
      );
      const kitsuEpisode = relevantKitsuEpisodes.find(
        (kEp) => kEp.attributes.number === i
      );

      episodeMap.set(
        i,
        createMergedEpisode(
          i,
          jikanEpisode,
          kitsuEpisode,
          media,
          jikanAverageEpisodeDuration,
          kitsuAverageEpisodeDuration
        )
      );
    }

    // Convert to sorted array
    return Array.from(episodeMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, episode]) => episode);
  }, [
    media,
    jikanEpisodes,
    kitsuEpisodes,
    jikanAverageEpisodeDuration,
    kitsuAverageEpisodeDuration,
    loadedPages,
    totalEpisodes,
  ]);

  const currentDisplayedPages = loadedPages;

  const handleLoadMore = () => {
    // Calculate the next page number
    const nextPage = currentDisplayedPages + 1;
    const nextPageEndEpisode = nextPage * PAGE_SIZE;

    // Check if we need to fetch more data from APIs
    // Only fetch if the API has more pages AND we don't have enough episodes yet
    const needsMoreJikan =
      jikanHasNextPage && jikanEpisodes.length < nextPageEndEpisode;
    const needsMoreKitsu =
      kitsuHasNextPage && kitsuEpisodes.length < nextPageEndEpisode;

    if (needsMoreJikan) {
      jikanFetchNextPage();
    }
    if (needsMoreKitsu) {
      kitsuFetchNextPage();
    }

    // Always update the page count - even if we don't need to fetch more,
    // we might have cached episodes that just need to be displayed
    // Use item.id since we fully control this identifier
    setLoadedPages(item.id, nextPage);
  };

  // Show "Load More" if we haven't displayed all episodes yet
  const hasNextPage = totalEpisodes > 0 && episodes.length < totalEpisodes;
  const isFetchingNextPage = jikanIsFetchingNextPage || kitsuIsFetchingNextPage;

  if (isJikanLoading || isKitsuLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" width={'100%'}>
        <BigLoader />
      </Stack>
    );
  }

  if (episodes.length <= 0) {
    return (
      <NoDataMessageDisplayer>
        No airing schedule provided for this media
      </NoDataMessageDisplayer>
    );
  }

  return (
    <Stack spacing={3} width="100%">
      <Typography variant={isUnderSm ? 'h6' : 'h5'}>
        {totalEpisodes} episode{totalEpisodes > 1 ? 's' : ''}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isUnderSm
            ? '1fr'
            : 'repeat(auto-fit, minmax(470px, max-content))',
          gap: 1,
          columnGap: 2,
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {episodes.map((episode) => (
          <AnimeEpisodeCardItem
            key={episode.episodeNumber}
            episode={episode}
            watched={
              item.status === Status.Done ||
              (item.value ?? 0) >= episode.episodeNumber
            }
          />
        ))}
      </Box>

      {/* Load More Button */}
      {hasNextPage && (
        <Stack alignItems="center" py={2}>
          <Button
            variant="contained"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            sx={{
              minWidth: 200,
              py: 1.5,
            }}
          >
            {isFetchingNextPage ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} color="inherit" />
                <span>Loading more episodes...</span>
              </Stack>
            ) : (
              'Load More Episodes'
            )}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
