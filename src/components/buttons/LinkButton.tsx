import { Link } from 'react-router-dom';
import { MouseEvent } from 'react';
import { OpenInNew } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface LinkButtonProps {
  to: string;
}

export const LinkButton = (props: LinkButtonProps) => {
  const { to } = props;

  return (
    <IconButton<typeof Link>
      component={Link}
      to={to}
      target="_blank"
      onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
      sx={{
        color: (theme) => theme.palette.primary.main,
      }}
    >
      <OpenInNew fontSize="small" />
    </IconButton>
  );
};
