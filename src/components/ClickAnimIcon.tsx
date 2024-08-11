import { SvgIconComponent, ThumbUp } from '@mui/icons-material';
import { Box } from '@mui/material';
import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ClickAnimIconProps {
  target: React.RefObject<HTMLButtonElement>;
  SvgIcon: SvgIconComponent;
  color?: string;
}

export const ClickAnimIcon = (props: ClickAnimIconProps) => {
  const { color, target, SvgIcon = ThumbUp } = props;

  const ref = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const animate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (ref.current && target.current) {
      const rect = target.current.getBoundingClientRect();
      const thumbUp = ref.current;

      const iconWidth = 35; // width of the icon (in px)
      const top = rect.top + window.scrollY - rect.height; // Adjust for scroll
      const left = rect.left + window.scrollX + rect.width / 2 - iconWidth / 2; // Adjust for scroll & center

      thumbUp.style.opacity = '1';
      thumbUp.style.top = `${top}px`;
      thumbUp.style.left = `${left}px`;

      intervalRef.current = setInterval(() => {
        const currentOpacity = Number(thumbUp.style.opacity);
        const currentTop = parseFloat(thumbUp.style.top);

        thumbUp.style.opacity = String(currentOpacity - 0.15);
        thumbUp.style.top = `${currentTop - 2}px`;

        if (currentOpacity <= 0) {
          thumbUp.style.top = '-9999px'; // hide after animation
          clearInterval(intervalRef.current!);
        }
      }, 50);
    }
  };

  useLayoutEffect(() => {
    if (target.current) {
      const originalClick = target.current.onclick;

      target.current.onclick = (e) => {
        animate();
        originalClick?.call(target.current as HTMLButtonElement, e);
      };
    }
  }, [target.current]);

  return createPortal(
    <>
      <Box
        className="tamer"
        ref={ref}
        sx={{ position: 'absolute', opacity: 0, top: 0, zIndex: 9999 }}
      >
        <SvgIcon
          fontSize="large"
          sx={{ color: (theme) => color ?? theme.palette.info.main }}
        />
      </Box>
    </>,
    document.getElementById('root')!
  );
};
