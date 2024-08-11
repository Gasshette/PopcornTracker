import { useItems } from '../contexts/ItemsProvider';
import { Category, Item, Status } from '../types/Item';
import { Add, Remove } from '@mui/icons-material';
import hasSeason, {
  debounceFunc,
  displayTitle,
  getTmdbImagePath,
  hasTimer,
  isAnilistMedia,
  isVideoItem,
  parseUrl,
} from '../utils';
import dayjs from 'dayjs';
import { useConfig } from '../contexts/ConfigProvider';
import {
  SxProps,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
  darken,
} from '@mui/material';
import MediaTitleDisplayer from './MediaTitleDisplayer';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAuth } from '../contexts/AuthProvider';
import { NavLink, useParams } from 'react-router-dom';
import { Score } from '../pages/DetailsPage/Score';
import { MouseEvent, useLayoutEffect, useState } from 'react';
import { DEFAULT_STEP, isFavoriteColor, scrollYKey } from '../const';
import { PinButton } from './buttons/PinButton';
import { LinkButton } from './buttons/LinkButton';
import { StyledChip } from './StyledChip';

interface Itemprops {
  item: Item;
}

const ListItem = (props: Itemprops) => {
  const { item } = props;

  const { updateValue } = useItems();
  const { config } = useConfig();
  const theme = useTheme();
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const [currentValue, setCurrentValue] = useState<number | undefined>(
    item.value
  );

  const isVideo = isVideoItem(item);
  const withTimer = isVideo && hasTimer(item);

  const buttonStyle: SxProps = {
    py: 2,
    width: '50%',
    color: config.colors[item.category],
  };
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));
  const areButtonsDisabled = !user || item.status === Status.Done;
  const areButtonsHidden = !!(
    userId ||
    item.status === Status.Done ||
    item.category === Category.Movie
  );

  const setNewItemValue = (value: number) => {
    if (value !== item.value) {
      updateValue(value, item.id);
    }
  };

  const displayTimer = () => {
    if (withTimer) {
      return (
        <>
          {isUnderSm ? <br /> : ' '}
          at {dayjs(item.timer).format('HH:mm:ss')}
        </>
      );
    }
  };

  const handleDecrement = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    sessionStorage.removeItem(scrollYKey);

    setCurrentValue((currentValue ?? 0) - (item.step ?? DEFAULT_STEP));
  };

  const handleIncrement = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    sessionStorage.removeItem(scrollYKey);

    setCurrentValue((currentValue ?? 0) + (item.step ?? DEFAULT_STEP));
  };

  useLayoutEffect(() => {
    debounceFunc(setNewItemValue, currentValue);
  }, [currentValue]);

  if (!item.media) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
      }}
    >
      <Card
        component={NavLink}
        to={`details/${item.id}`}
        onClick={() =>
          sessionStorage.setItem(scrollYKey, String(window.scrollY))
        }
        sx={{
          backgroundColor: darken(config.colors[item.category], 0.85),
          border: item.isFavorite
            ? `2px solid ${darken(isFavoriteColor, 0.5)}`
            : 'none',
          textDecoration: 'none',
          height: '100%',
          display: 'flex',
          [theme.breakpoints.up('sm')]: {
            '& img': {
              transition: 'transform .3s ease',
              transformOrigin: 'center center',
            },
            '&:hover img': {
              transform: 'scale(1.1)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            '&:hover': { cursor: 'pointer' },
          }}
        >
          <CardMedia
            component="img"
            sx={{ width: 130 }}
            image={
              isAnilistMedia(item.media)
                ? item.media.coverImage.large
                : getTmdbImagePath(item.media.poster_path)
            }
            alt={displayTitle(item.media)}
          />
          <CardContent
            sx={{
              flex: '1 1 auto',
              p: 2,
              ...(!areButtonsHidden && { pb: '0px important' }),
            }}
          >
            <Stack sx={{ height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {isAnilistMedia(item.media) ? (
                    !item.media?.averageScore ? (
                      <span></span>
                    ) : (
                      <Score score={item.media.averageScore} />
                    )
                  ) : (
                    !isAnilistMedia(item.media) &&
                    item.media.vote_average && (
                      <Score score={item.media.vote_average * 10} />
                    )
                  )}

                  <Stack sx={{ flexDirection: 'row' }}>
                    {item.link && (
                      <LinkButton
                        to={
                          item.value
                            ? parseUrl(item.link, { value: item.value })
                            : item.link
                        }
                      />
                    )}
                    <PinButton
                      isPinned={item.isFavorite}
                      disabled={!user || !!userId}
                      itemId={item.id}
                    />
                  </Stack>
                </Stack>

                <Box sx={{ my: 1, alignSelf: 'flex-start' }}>
                  <StyledChip
                    label={item.category}
                    color={config.colors[item.category]}
                  />{' '}
                  <StyledChip
                    label={item.status}
                    color={config.status[item.status]}
                  />
                </Box>
                <Box sx={{ pt: 1 }}>
                  <MediaTitleDisplayer media={item.media} size="medium" />
                </Box>
              </Box>

              <Stack>
                {item.status !== Status.Done &&
                  item.category !== Category.Movie && (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Typography noWrap variant="caption" sx={{ mt: 2 }}>
                        {hasSeason(item) && `Season ${item.season} - `}
                        {isVideo ? 'Episode ' : 'Chapter '}
                        {currentValue}
                        {displayTimer()}
                      </Typography>
                    </LocalizationProvider>
                  )}
                <Counter
                  disabled={areButtonsDisabled}
                  hidden={areButtonsHidden}
                  onDecrement={handleDecrement}
                  onIncrement={handleIncrement}
                  sx={buttonStyle}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};

export default ListItem;

interface CounterProps {
  sx?: SxProps;
  hidden: boolean;
  disabled: boolean;
  onDecrement: (event: MouseEvent<HTMLButtonElement>) => void;
  onIncrement: (event: MouseEvent<HTMLButtonElement>) => void;
}
const Counter = (props: CounterProps) => {
  const { disabled, hidden, onDecrement, onIncrement, sx } = props;

  return (
    <Box
      sx={{
        width: '100%',
        display: hidden ? 'none' : 'flex',
      }}
    >
      {/* Buttons are disabled if the user is not logged in or if it's a guest (shared link).
      Buttons are also disabled if the media is done. In this case, icons are not shown as well */}
      <Button sx={sx} onClick={onDecrement} disabled={disabled}>
        <Remove />
      </Button>
      <Button sx={sx} onClick={onIncrement} disabled={disabled}>
        <Add />
      </Button>
    </Box>
  );
};
