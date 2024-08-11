import { Box, MenuItem, Typography } from '@mui/material';
import { TmdbMedia } from '../../types/Tmdb';
import MediaTitleDisplayer from '../MediaTitleDisplayer';
import { getTmdbImagePath } from '../../utils';

interface TmdbOptionProps {
  option: TmdbMedia;
  liProps: React.HTMLAttributes<HTMLLIElement> & {
    key: any;
  };
}

export const TmdbOption = (props: TmdbOptionProps) => {
  const { option, liProps } = props;
  const { key, ...rest } = liProps;

  return (
    <MenuItem
      {...rest}
      sx={{
        display: 'flex',
        alignContent: 'stretch',
        gap: 1,
      }}
    >
      <img
        src={getTmdbImagePath(option.poster_path, 'sm')}
        alt={option.media_type === 'tv' ? option.name : option.title}
      />

      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          py: 4,
          alignSelf: 'stretch',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <MediaTitleDisplayer media={option} />
        <Typography variant="caption">
          {option.release_date && option.release_date}
        </Typography>
      </Box>
    </MenuItem>
  );
};
