import { AccessTime, Check } from '@mui/icons-material';
import {
  useMediaQuery,
  Stack,
  CircularProgress,
  Card,
  Box,
  CardMedia,
  Chip,
  CardContent,
  Typography,
  Tooltip,
  Button,
  Icon,
} from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { NoDataMessageDisplayer } from '../../components/NoDataMessageDisplayer';
import { JikanEpisode, useJikanEpisodes } from '../../hooks/useJikanEpisodes';
import { useKitsuEpisodes } from '../../hooks/useKitsuEpisodes';
import { AnilistMedia } from '../../types/Anilist';
import { KitsuEpisode } from '../../types/Kitsu';
import { Item, Status } from '../../types/Item';

interface AnimeEpisodeCardItem {
  thumbnail: string | null;
  color: string;
  episodeNumber: number;
  titles: {
    english: string | null;
    romanji: string | null;
  };
  airingAt: string | null;
  aired: boolean | null;
  duration: number | null;
}

function getThumbnail(
  jikanEpisode: JikanEpisode,
  kitsuEpisode: KitsuEpisode | undefined,
  media: AnilistMedia
): string | null {
  // ANILIST
  const anilistEpisode = media.streamingEpisodes.find((sEp) =>
    sEp.title.includes(jikanEpisode.title)
  );

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

  const pSmall = kitsuEpisode?.attributes.posterImage?.small;
  const pMedium = kitsuEpisode?.attributes.posterImage?.medium;
  const pLarge = kitsuEpisode?.attributes.posterImage?.large;
  const pOriginal = kitsuEpisode?.attributes.posterImage?.original;
  const pTiny = kitsuEpisode?.attributes.posterImage?.tiny;

  if (pSmall || pMedium || pLarge || pOriginal || pTiny) {
    return pSmall ?? pMedium ?? pLarge ?? pOriginal ?? pTiny ?? null;
  }

  return media.bannerImage ?? media.coverImage.large ?? media.coverImage.medium;
}

const createFallbackEpisode = (
  episodeNumber: number,
  media: AnilistMedia,
  duration: number | null
): AnimeEpisodeCardItem => {
  const scheduleNode = media.airingSchedule.nodes.find(
    (node) => node.episode === episodeNumber
  );
  const rawAiringAt = scheduleNode?.airingAt
    ? dayjs.utc(scheduleNode.airingAt * 1000)
    : null;
  const airingAt = rawAiringAt?.format('MMM D, YYYY') ?? null;
  const aired = rawAiringAt?.isBefore(dayjs()) ?? null;

  return {
    episodeNumber,
    titles: {
      english: `Episode ${episodeNumber}`,
      romanji: null,
    },
    duration,
    airingAt,
    aired,
    thumbnail:
      media.bannerImage ??
      media.coverImage.large ??
      media.coverImage.medium ??
      null,
    color: media.coverImage.color,
  };
};

interface AnimeEpisodesDisplayerProps {
  media: AnilistMedia;
  item: Item;
}

export const AnimeEpisodesDisplayer = (props: AnimeEpisodesDisplayerProps) => {
  const { media, item } = props;

  const {
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

  const episodes: Array<AnimeEpisodeCardItem> = useMemo(() => {
    const duration =
      jikanAverageEpisodeDuration ?? kitsuAverageEpisodeDuration ?? null;

    // If no Jikan episodes at all, show only what we have from schedule
    if (jikanEpisodes.length === 0) {
      // Only show episodes that have airing schedule info
      return media.airingSchedule.nodes.map((node) =>
        createFallbackEpisode(node.episode, media, duration)
      );
    }

    // Synchronize display based on BOTH Jikan and Kitsu fetch progress
    // Show episodes only up to the minimum of what both APIs have fetched
    const maxJikanEpisode = Math.max(
      ...jikanEpisodes.map((ep) => ep.mal_id),
      0
    );
    const maxKitsuEpisode =
      kitsuEpisodes.length > 0
        ? Math.max(...kitsuEpisodes.map((ep) => ep.attributes.number), 0)
        : 0;

    // Only display up to whichever API has fetched less
    // This ensures thumbnails are available for all displayed episodes
    const maxDisplayEpisode = Math.min(
      maxJikanEpisode,
      maxKitsuEpisode || maxJikanEpisode // If Kitsu has nothing, use Jikan limit
    );

    // Build episode list only up to maxDisplayEpisode
    const episodeMap = new Map<number, AnimeEpisodeCardItem>();

    // Add all Jikan episodes up to the display limit
    jikanEpisodes
      .filter((jEp) => jEp.mal_id <= maxDisplayEpisode)
      .forEach((jEp) => {
        const kitsuEpisode = kitsuEpisodes.find(
          (kEp) => kEp.attributes.number === jEp.mal_id
        );
        const rawAiringAt = jEp.aired ? dayjs.utc(jEp.aired) : null;
        const airingAt = rawAiringAt?.format('MMM D, YYYY') ?? null;
        const aired = rawAiringAt?.isBefore(dayjs()) ?? null;

        episodeMap.set(jEp.mal_id, {
          episodeNumber: jEp.mal_id,
          titles: {
            english: jEp.title,
            romanji: jEp.title_romanji,
          },
          duration: kitsuEpisode?.attributes.length
            ? kitsuEpisode.attributes.length * 60
            : (jikanAverageEpisodeDuration ??
              kitsuAverageEpisodeDuration ??
              null),
          airingAt,
          aired,
          thumbnail: getThumbnail(jEp, kitsuEpisode, media),
          color: media.coverImage.color,
        });
      });

    // Fill gaps ONLY up to maxDisplayEpisode
    for (let i = 1; i <= maxDisplayEpisode; i++) {
      if (!episodeMap.has(i)) {
        episodeMap.set(i, createFallbackEpisode(i, media, duration));
      }
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
  ]);

  const hasNextPage = jikanHasNextPage || kitsuHasNextPage;
  const isFetchingNextPage = jikanIsFetchingNextPage || kitsuIsFetchingNextPage;

  const handleLoadMore = () => {
    if (jikanHasNextPage) {
      jikanFetchNextPage();
    }
    if (kitsuHasNextPage) {
      kitsuFetchNextPage();
    }
  };

  if (isJikanLoading || isKitsuLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" width={'100%'}>
        <CircularProgress size="4rem" />
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
      <Stack
        flexWrap="wrap"
        direction={isUnderSm ? 'column' : 'row'}
        alignItems="center"
        justifyContent="center"
        gap={1}
        columnGap={2}
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
      </Stack>

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

interface AnimeEpisodeCardProps {
  episode: AnimeEpisodeCardItem;
  watched: boolean;
}

const AnimeEpisodeCardItem = (props: AnimeEpisodeCardProps) => {
  const { episode, watched } = props;
  const { thumbnail, episodeNumber, titles, airingAt, aired, duration } =
    episode;

  const isUnderSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: isUnderSm ? 'column' : 'row',
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          backgroundColor: thumbnail ? 'transparent' : episode.color,
        }}
      >
        <CardMedia
          component="img"
          image={thumbnail ?? ''}
          sx={{
            width: isUnderSm ? '100%' : 220,
            aspectRatio: '16/9',
            opacity: aired ? 1 : 0.7,
          }}
        />

        {/* Not Aired indicator - prominent */}
        {aired !== null && !aired && (
          <Chip
            icon={<AccessTime sx={{ fontSize: 14 }} />}
            label="UPCOMING"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: episode.color,
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 600,
              height: 20,
            }}
          />
        )}

        {/* Duration badge */}
        {duration && (
          <Chip
            label={`${duration / 60} min`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: '0.75rem',
            }}
          />
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ position: 'relative', width: 250, flex: 1, py: 1.5 }}>
        <Stack spacing={0.5} height={'100%'}>
          <Stack direction="row" alignItems={'flex-end'} spacing={1}>
            <Typography
              variant="caption"
              sx={{ color: episode.color, fontWeight: 600 }}
            >
              EPISODE {episodeNumber}
            </Typography>
            {watched && <Icon component={Check} color="success" />}
          </Stack>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {titles.english || titles.romanji}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              marginTop: 'auto',
              color: (theme) => theme.palette.grey[500],
            }}
          >
            {airingAt ?? '—'}
          </Typography>
        </Stack>

        {/* Aired indicator */}
        {aired && (
          <Tooltip title="Episode already available">
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: (theme) => theme.palette.success.main,
                boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.3)',
              }}
            />
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};
