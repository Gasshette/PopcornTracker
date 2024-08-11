import {
  Box,
  Chip,
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
import { AiringSchedule } from './AiringSchedule';
import { Title } from './Title';
import { Description } from './Description';

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
      <Title item={item} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: 1,
          my: 2,
        }}
      >
        <Chip
          label={item.category}
          size="medium"
          style={{ backgroundColor: config.colors[item.category] }}
          sx={{ mb: 2 }}
        />

        {isAnilistMedia(item.media) &&
          item.media.genres.map((g) => <Chip key={g} label={g} size="small" />)}
        {!isAnilistMedia(item.media) &&
          item.media.genres.map((g) => (
            <Chip key={g.id} label={g.name} size="small" />
          ))}
      </Box>

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
            <AiringSchedule item={item} />
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
