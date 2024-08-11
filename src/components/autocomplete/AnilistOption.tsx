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
        overflow: 'auto',
        display: 'flex',
        gap: 1,
      }}
    >
      <img
        src={option.coverImage.medium}
        alt={option.title.romaji}
        style={{ width: '100px', flexShrink: 0 }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
        }}
      >
        <MediaTitleDisplayer media={option} size="small" />
        <Typography variant="caption">
          {option.season && option.season}{' '}
          {option.seasonYear && ` - ${option.seasonYear}`}
        </Typography>
      </Box>
    </MenuItem>
  );
};
