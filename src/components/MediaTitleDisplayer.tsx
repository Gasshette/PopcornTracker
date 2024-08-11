import {
  Stack,
  SxProps,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AnilistMedia } from '../types/Anilist';
import { TmdbMedia } from '../types/Tmdb';
import { getTitles } from '../utils';
import { useEffect, useRef, useState } from 'react';

interface MediaTitleDisplayerProps {
  media: AnilistMedia | TmdbMedia;
  sx?: SxProps;
  dynamicSize?: boolean;
  size?: 'small' | 'medium' | 'large';
  titleWidth?: string;
}

const MediaTitleDisplayer = (props: MediaTitleDisplayerProps) => {
  const { media, sx, size = 'small', dynamicSize = false } = props;

  const [width, setWidth] = useState<number>();

  const theme = useTheme();
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  const wrapperRef = useRef<HTMLDivElement>(null);

  const localSize = dynamicSize ? (isUnderSm ? 'small' : 'medium') : size;
  const mainTitleVariant =
    localSize === 'small' ? 'body1' : localSize === 'medium' ? 'h6' : 'h3';

  useEffect(() => {
    const setSize = () => {
      if (wrapperRef.current) {
        setWidth(wrapperRef.current.getBoundingClientRect().width);
      }
    };

    setSize();
  }, []);

  if (!media) {
    return null;
  }

  const { mainTitle, secondaryTitle } = getTitles(media);

  return (
    <Stack
      ref={wrapperRef}
      justifyContent="center"
      alignItems="start"
      sx={{
        justifyContent: 'center',
        alignItems: 'start',
        maxWidth: '100%',
        ...sx,
      }}
    >
      {!width ? (
        <></>
      ) : (
        <>
          <MainTitle
            content={mainTitle}
            variant={mainTitleVariant}
            width={width}
          />
          <SecondaryTitle content={secondaryTitle} width={width} />
        </>
      )}
    </Stack>
  );
};

export default MediaTitleDisplayer;

interface MainTitleProps {
  variant: 'body1' | 'h3' | 'h6';
  content: string;
  width: number;
}
const MainTitle = (props: MainTitleProps) => {
  const { content, variant, width } = props;

  const isDetailsPage = location.pathname.startsWith('/details/');

  return (
    <Tooltip sx={{ width }} title={content}>
      <Typography
        {...(!isDetailsPage && {
          noWrap: true,
        })}
        sx={{
          display: 'block',
          width,
        }}
        variant={variant}
      >
        {content}
      </Typography>
    </Tooltip>
  );
};

interface SecondaryTitleProps {
  content: string;
  width: number;
}
const SecondaryTitle = (props: SecondaryTitleProps) => {
  const { content, width } = props;

  const isDetailsPage = location.pathname.startsWith('/details/');

  return (
    <Tooltip sx={{ width }} title={content}>
      <Typography
        {...(!isDetailsPage && {
          noWrap: true,
        })}
        variant="caption"
        sx={(theme) => ({
          display: 'block',
          width,
          color: theme.palette.text.secondary,
        })}
      >
        {content}
      </Typography>
    </Tooltip>
  );
};
