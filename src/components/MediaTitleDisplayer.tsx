import {
  Box,
  Stack,
  SxProps,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AnilistMedia } from '../types/Anilist';
import { TmdbMedia } from '../types/Tmdb';
import { getTitles } from '../utils';

interface MediaTitleDisplayerProps {
  media: AnilistMedia | TmdbMedia;
  sx?: SxProps;
  dynamicSize?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const MediaTitleDisplayer = (props: MediaTitleDisplayerProps) => {
  const { media, sx, size = 'small', dynamicSize = false } = props;

  const theme = useTheme();
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  const localSize = dynamicSize ? (isUnderSm ? 'small' : 'medium') : size;

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
        variant={
          localSize === 'small' ? 'body1' : localSize === 'medium' ? 'h5' : 'h3'
        }
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
