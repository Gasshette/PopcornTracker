import { Box, Stack, SxProps, Typography } from '@mui/material';
import { AnilistMedia } from '../types/Anilist';
import { TmdbMedia } from '../types/Tmdb';
import { getTitles } from '../utils';

interface MediaTitleDisplayerProps {
  media: AnilistMedia | TmdbMedia;
  sx?: SxProps;
  size?: 'small' | 'medium' | 'large';
}

const MediaTitleDisplayer = (props: MediaTitleDisplayerProps) => {
  const { media, sx, size = 'small' } = props;

  const { mainTitle, secondaryTitle } = getTitles(media);

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
        noWrap
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        variant={size === 'small' ? 'body1' : size === 'medium' ? 'h5' : 'h3'}
      >
        {mainTitle}
      </Typography>
      <Box>
        <Typography
          noWrap
          variant="caption"
          sx={(theme) => ({
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: theme.palette.text.secondary,
          })}
        >
          {secondaryTitle}
        </Typography>
      </Box>
    </Stack>
  );
};

export default MediaTitleDisplayer;
