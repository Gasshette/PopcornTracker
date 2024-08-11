import { Box, Stack, SxProps, Typography } from '@mui/material';
import { AnilistMedia } from '../types/Anilist';
import { TmdbMedia } from '../types/Tmdb';
import { isAnilistMedia } from '../utils';

interface MediaTitleDisplayerProps {
  media: AnilistMedia | TmdbMedia;
  sx?: SxProps;
  size?: 'small' | 'medium' | 'large';
}

const MediaTitleDisplayer = (props: MediaTitleDisplayerProps) => {
  const { media, sx, size = 'small' } = props;

  let mainTitle;
  let secondaryTitle;

  if (isAnilistMedia(media)) {
    mainTitle = media.title.romaji;
    secondaryTitle = media.title.english;
  } else {
    mainTitle = media.media_type === 'tv' ? media.name : media.title;
    secondaryTitle = media.original_name;
  }

  return (
    <Stack
      justifyContent="center"
      alignItems="start"
      sx={{
        justifyContent: 'center',
        alignItems: 'start',
        maxWidth: '100%',
        ...sx,
      }}
    >
      <Typography
        sx={{ wordBreak: 'break-word' }}
        variant={size === 'small' ? 'body1' : size === 'medium' ? 'h5' : 'h3'}
      >
        {mainTitle}
      </Typography>
      <Box>
        <Typography
          variant="caption"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
          })}
        >
          {secondaryTitle}
        </Typography>
        {isAnilistMedia(media) &&
          media.title.english &&
          media.title.native &&
          ' | '}
        {isAnilistMedia(media) && (
          <Typography
            variant="caption"
            sx={(theme) => ({ color: theme.palette.text.secondary })}
          >
            {media.title.native}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default MediaTitleDisplayer;
