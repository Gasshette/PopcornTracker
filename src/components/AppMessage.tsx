import { Box } from '@mui/material';

interface AppMessageProps {
  children: React.ReactNode;
}

export const AppMessage = (props: AppMessageProps) => {
  const { children } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  );
};
