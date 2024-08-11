import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Item } from '../../types/Item';
import { useConfig } from '../../contexts/ConfigProvider';
import { NoDataMessageDisplayer } from '../../components/NoDataMessageDisplayer';
import { isAnilistMedia } from '../../utils';
import { Title } from './Title';
import { Description } from './Description';
import { StyledChip } from '../../components/StyledChip';
import dayjs from 'dayjs';
import { InfoOutline } from '@mui/icons-material';
import { AnimeEpisodesDisplayer } from './AnimeEpisodesDisplayer';

interface DetailsContentProps {
  item: Item;
}

export const DetailsContent = (props: DetailsContentProps) => {
  const { item } = props;

  const { config } = useConfig();
  const theme = useTheme();

  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  if (!item) {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!item.media) {
    return (
      <NoDataMessageDisplayer>Something went wrong :(</NoDataMessageDisplayer>
    );
  }

  return (
    <Stack sx={{ gap: 2, p: 2, pt: 4 }}>
      {item.lastUpdated && (
        <Typography
          variant="caption"
          color="info"
          display={'flex'}
          alignItems={'center'}
          gap={1}
        >
          <InfoOutline />
          Last updated {dayjs(item.lastUpdated).fromNow()}
        </Typography>
      )}
      <Title item={item} />
      <Stack
        sx={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: 1,
          my: 2,
        }}
      >
        <StyledChip
          label={item.category}
          color={config.colors[item.category]}
          sx={{ mb: 2 }}
        />

        {isAnilistMedia(item.media) ? (
          <>
            {item.media.genres.map((genre) => (
              <StyledChip
                key={genre}
                label={genre}
                color={theme.palette.common.black}
              />
            ))}
          </>
        ) : (
          <>
            {item.media.genres.map((genre) => (
              <StyledChip
                key={genre.id}
                label={genre.name}
                color={theme.palette.common.black}
              />
            ))}
          </>
        )}
      </Stack>
      <Description item={item} />
      {isAnilistMedia(item.media) &&
      (item.media.episodes || item.media.chapters) ? (
        <>
          <Typography variant={isUnderSm ? 'h6' : 'h5'}>
            {item.media.episodes && `${item.media.episodes} episodes`}
            {item.media.chapters && `${item.media.chapters} chapters`}
          </Typography>

          <Stack
            direction={isUnderSm ? 'column' : 'row'}
            gap={2}
            flexWrap={'wrap'}
          >
            {isAnilistMedia(item.media) && (
              <AnimeEpisodesDisplayer media={item.media} item={item} />
            )}
          </Stack>
        </>
      ) : (
        <NoDataMessageDisplayer>
          No data provided for this media :(
        </NoDataMessageDisplayer>
      )}
    </Stack>
  );
};
