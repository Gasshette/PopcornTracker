import { AccessTime, Check } from '@mui/icons-material';
import {
  useMediaQuery,
  Card,
  Box,
  CardMedia,
  Chip,
  CardContent,
  Stack,
  Typography,
  Tooltip,
  Icon,
} from '@mui/material';

export interface AnimeEpisodeCardItem {
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

interface AnimeEpisodeCardItemProps {
  episode: AnimeEpisodeCardItem;
  watched: boolean;
}

export const AnimeEpisodeCardItem = (props: AnimeEpisodeCardItemProps) => {
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
        width: isUnderSm ? '100%' : 'unset',
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
      <CardContent
        sx={{
          position: 'relative',
          width: isUnderSm ? '100%' : 250,
          flex: 1,
          py: 1.5,
        }}
      >
        <Stack spacing={0.5} height={'100%'}>
          <Stack direction="row" alignItems={'flex-end'} spacing={1}>
            <Typography
              variant="caption"
              sx={{ color: episode.color, fontWeight: 600 }}
            >
              EPISODE {episodeNumber}
            </Typography>
          </Stack>

          <Tooltip title={titles.english || titles.romanji}>
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
          </Tooltip>

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

        {/* Watched indicator */}
        {watched ? (
          <Icon
            component={Check}
            color="success"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
            }}
          />
        ) : (
          aired && (
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
          )
        )}
      </CardContent>
    </Card>
  );
};
