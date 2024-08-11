import { ArrowBack } from '@mui/icons-material';
import { DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import MediaTitleDisplayer from '../../components/MediaTitleDisplayer';
import { Item } from '../../types/Item';
import { Score } from './Score';
import { isAnilistMedia } from '../../utils';
import dayjs from 'dayjs';

interface TitleProps {
  item: Item;
  isUnderSm?: boolean;
  onClose: () => void;
}
export const Title = (props: TitleProps) => {
  const { item, isUnderSm, onClose } = props;

  if (!item.media) {
    return <></>;
  }

  return (
    <DialogTitle
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 2,
        px: 0,
      }}
    >
      <IconButton
        size="large"
        onClick={onClose}
        sx={{ ml: -2, alignSelf: 'start' }}
      >
        <ArrowBack fontSize="large" />
      </IconButton>
      <Stack gap={2}>
        <MediaTitleDisplayer
          media={item.media}
          size={isUnderSm ? 'medium' : 'large'}
        />

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
              {dayjs(item.media.first_air_date).format('MMMM D, YYYY')}
            </Typography>
          )
        )}
        {isAnilistMedia(item.media) && item.media?.averageScore ? (
          <Score score={item.media.averageScore} isUnderSm={isUnderSm} />
        ) : (
          !isAnilistMedia(item.media) &&
          item.media.vote_average && (
            <Score
              score={item.media.vote_average * 10}
              voteCount={item.media.vote_count}
              isUnderSm={isUnderSm}
            />
          )
        )}
      </Stack>
    </DialogTitle>
  );
};
