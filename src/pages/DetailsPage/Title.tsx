import { Box, Stack, Typography } from '@mui/material';
import MediaTitleDisplayer from '../../components/MediaTitleDisplayer';
import { Item } from '../../types/Item';
import { Score } from './Score';
import { isAnilistMedia, parseUrl } from '../../utils';
import dayjs from 'dayjs';
import { LinkButton } from '../../components/buttons/LinkButton';
import { PinButton } from '../../components/buttons/PinButton';
import { useAuth } from '../../contexts/AuthProvider';
import { useParams } from 'react-router-dom';

interface TitleProps {
  item: Item;
}
export const Title = (props: TitleProps) => {
  const { item } = props;

  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();

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
      <Stack gap={2} sx={{ width: '100%' }}>
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
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 4,
          }}
        >
          {isAnilistMedia(item.media) && item.media?.averageScore ? (
            <Score score={item.media.averageScore} />
          ) : (
            !isAnilistMedia(item.media) &&
            item.media.vote_average && (
              <Score score={item.media.vote_average * 10} />
            )
          )}
          <Box>
            {item.link && (
              <LinkButton
                to={
                  item.value
                    ? parseUrl(item.link, { value: item.value })
                    : item.link
                }
              />
            )}
            <PinButton
              isPinned={item.isFavorite}
              disabled={!user || !!userId}
              itemId={item.id}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
