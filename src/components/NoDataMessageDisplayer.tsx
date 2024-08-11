import { Typography, useMediaQuery, useTheme } from '@mui/material';

interface NoDataMessageDisplayerProps {
  children: React.ReactNode;
}

export const NoDataMessageDisplayer = (props: NoDataMessageDisplayerProps) => {
  const { children } = props;
  const theme = useTheme();

  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Typography
      variant={isUnderSm ? 'body1' : 'h6'}
      sx={{ color: 'rgba(255, 255, 255, .7)' }}
    >
      {children}
    </Typography>
  );
};
