import {
  Box,
  Card,
  darken,
  CardMedia,
  CardContent,
  Stack,
} from '@mui/material';
import { Item } from '../../types/Item';
import { isAnilistMedia, getTmdbImagePath, displayTitle } from '../../utils';
import MediaTitleDisplayer from '../MediaTitleDisplayer';
import { StyledChip } from '../StyledChip';
import { useConfig } from '../../contexts/ConfigProvider';
import { Score } from '../../pages/DetailsPage/Score';
import dayjs from 'dayjs';

interface ListItemOptionProps {
  item: Item;
}
export const ListItemOption = (props: ListItemOptionProps) => {
  const { item } = props;

  const { config } = useConfig();

  if (!item.media) {
    return <></>;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      <Card
        sx={{
          display: 'flex',
          height: '100%',
          backgroundColor: darken(config.colors[item.category], 0.85),
          textDecoration: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            '&:hover': { cursor: 'pointer' },
          }}
        >
          <CardMedia
            component="img"
            sx={{ width: 100 }}
            image={
              isAnilistMedia(item.media)
                ? item.media.coverImage.large
                : getTmdbImagePath(item.media.poster_path)
            }
            alt={displayTitle(item.media)}
          />
          <CardContent
            sx={{
              flex: '1 1 auto',
              p: 2,
            }}
          >
            <Stack sx={{ height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {isAnilistMedia(item.media) ? (
                    !item.media?.averageScore ? (
                      <span></span>
                    ) : (
                      <Score score={item.media.averageScore} />
                    )
                  ) : (
                    !isAnilistMedia(item.media) &&
                    item.media.vote_average && (
                      <Score score={item.media.vote_average * 10} />
                    )
                  )}
                </Stack>

                <Box sx={{ my: 1, alignSelf: 'flex-start' }}>
                  <StyledChip
                    label={item.category}
                    color={config.colors[item.category]}
                  />{' '}
                  <StyledChip
                    label={item.status}
                    color={config.status[item.status]}
                  />
                </Box>
                <Box sx={{ pt: 1 }}>
                  <MediaTitleDisplayer media={item.media} size="medium" />
                </Box>
              </Box>
              {!isAnilistMedia(item.media) && item.media.release_date && (
                <Stack sx={{ mt: 'auto' }}>
                  {dayjs(item.media.release_date).format('MMMM D, YYYY')}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};
