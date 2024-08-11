import { Box, Stack, Typography } from '@mui/material';
import MediaTitleDisplayer from '../../components/MediaTitleDisplayer';
import { Item } from '../../types/Item';
import { Score } from './Score';
import { isAnilistMedia } from '../../utils';
import dayjs from 'dayjs';

interface TitleProps {
  item: Item;
}
export const Title = (props: TitleProps) => {
  const { item } = props;

  if (!item.media) {
    return <></>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 2,
        px: 0,
      }}
    >
      <Stack gap={2}>
        <MediaTitleDisplayer dynamicSize media={item.media} />

        {isAnilistMedia(item.media) &&
        (item.media.seasonYear || item.media.season) ? (
          <Typography>
            ({item.media.seasonYear}
            {item.media.seasonYear && item.media.season ? ' - ' : ''}
            {item.media.season})
          </Typography>
        ) : (
          !isAnilistMedia(item.media) && (
            <Typography>
              Aired first on{' '}
              {dayjs(
                item.media.first_air_date ?? item.media.release_date
              ).format('MMMM D, YYYY')}
            </Typography>
          )
        )}
        {isAnilistMedia(item.media) && item.media?.averageScore ? (
          <Score score={item.media.averageScore} />
        ) : (
          !isAnilistMedia(item.media) &&
          item.media.vote_average && (
            <Score
              score={item.media.vote_average * 10}
              voteCount={item.media.vote_count}
            />
          )
        )}
      </Stack>
    </Box>
  );
};
