import React, { useEffect, useRef } from 'react';
import { Box, SxProps } from '@mui/material';

interface AffixProps {
  children: React.ReactNode;
  sx?: SxProps;
}

const Affix = (props: AffixProps) => {
  const { children, sx } = props;

  const ref = useRef<HTMLElement>();

  const handleScroll = (_e: Event) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();

      if (rect.top < 0) {
        ref.current.style.position = 'sticky';
        ref.current.style.top = '0';
        ref.current.style.zIndex = '999';
      }
    }
  };

  useEffect(() => {
    if (ref.current) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ref.current]);

  return (
    <Box className="Affix" ref={ref} sx={sx}>
      {children}
    </Box>
  );
};

export default Affix;
