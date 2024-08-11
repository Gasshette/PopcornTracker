import { MenuItem, Box, Typography } from '@mui/material';
import { AnilistMedia } from '../../types/Anilist';
import MediaTitleDisplayer from '../MediaTitleDisplayer';

interface AnilistOptionProps {
  option: AnilistMedia;
  liProps: React.HTMLAttributes<HTMLLIElement> & {
    key: any;
  };
}

export const AnilistOption = (props: AnilistOptionProps) => {
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
      <img src={option.coverImage.medium} alt={option.title.romaji} />

      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          py: 2,
          alignSelf: 'stretch',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <MediaTitleDisplayer media={option} />
        <Typography variant="caption">
          {option.season && option.season}{' '}
          {option.seasonYear && ` - ${option.seasonYear}`}
        </Typography>
      </Box>
    </MenuItem>
  );
};
