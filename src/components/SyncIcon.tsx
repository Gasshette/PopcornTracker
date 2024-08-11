import { Sync } from '@mui/icons-material';
import { SxProps } from '@mui/material';

interface SyncIconProps {
  sx?: SxProps;
}

export const SyncIcon = (props: SyncIconProps) => {
  return (
    <Sync
      sx={{
        animation: 'spin 2s linear infinite',
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(360deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
        ...props.sx,
      }}
    />
  );
};
