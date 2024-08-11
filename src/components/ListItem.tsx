import { useItems } from '../contexts/ItemsProvider';
import { Category, Item, Status } from '../types/Item';
import { Add, Bookmark, BookmarkBorder, Remove } from '@mui/icons-material';
import hasSeason, {
  debounceFunc,
  displayTitle,
  getTmdbImagePath,
  hasTimer,
  isAnilistMedia,
  isVideoItem,
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
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import MediaTitleDisplayer from './MediaTitleDisplayer';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { Score } from '../pages/DetailsPage/Score';
import { useLayoutEffect, useState } from 'react';
import { DEFAULT_STEP } from '../const';

interface Itemprops {
  item: Item;
}

const ListItem = (props: Itemprops) => {
  const { item } = props;

  const { toggleFavorite, updateValue } = useItems();
  const { config } = useConfig();
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [currentValue, setCurrentValue] = useState<number | undefined>(
    item.value
  );

  const isVideo = isVideoItem(item);
  const withTimer = isVideo && hasTimer(item);

  const buttonStyle: SxProps = {
    py: 3,
    width: '50%',
    color: config.colors[item.category],
  };
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));
  const areButtonsDisabled = !user || item.status === Status.Done;
  const areButtonsHidden =
    userId || item.status === Status.Done || item.category === Category.Movie;

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

  useLayoutEffect(() => {
    debounceFunc(setNewItemValue, currentValue);
  }, [currentValue]);

  if (!item.media) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Card onClick={() => navigate(`details/${item.id}`)}>
        <Box
          sx={{
            display: 'flex',
            '&:hover': { cursor: 'pointer' },
          }}
        >
          <CardContent sx={{ flex: '1 1 auto' }}>
            <IconButton
              size="medium"
              disabled={!user || !!userId}
              sx={{
                position: 'absolute',
                p: 0.6,
                top: -10,
                left: -16,
                color: 'darkorange',
                '&.Mui-disabled': {
                  color: item.isFavorite ? 'darkorange' : 'inherit',
                },
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
            >
              {item.isFavorite ? (
                <Bookmark fontSize="medium" />
              ) : (
                <BookmarkBorder fontSize="medium" />
              )}
            </IconButton>
            <Stack sx={{ height: '100%' }}>
              <MediaTitleDisplayer media={item.media} size="medium" />

              {isAnilistMedia(item.media) && item.media?.averageScore ? (
                <Score score={item.media.averageScore} />
              ) : (
                !isAnilistMedia(item.media) &&
                item.media.vote_average && (
                  <Score
                    score={item.media.vote_average * 10}
                    voteCount={item.media.vote_count}
                  />
                )
              )}

              <Box sx={{ my: 1, alignSelf: 'flex-start' }}>
                <Chip
                  size="small"
                  label={item.category}
                  style={{ backgroundColor: config.colors[item.category] }}
                />{' '}
                <Chip
                  label={item.status}
                  size="small"
                  sx={{ backgroundColor: config.status[item.status] }}
                />
              </Box>
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

              <Box
                sx={{
                  mt: 'auto',
                  width: '100%',
                  display: areButtonsHidden ? 'none' : 'flex',
                }}
              >
                {/* Buttons are disabled if the user is not logged in or if it's a guest (shared link).
                Buttons are also disabled if the media is done. In this case, icons are not shown as well */}
                <Button
                  sx={buttonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentValue(
                      (currentValue ?? 0) - (item.step ?? DEFAULT_STEP)
                    );
                  }}
                  disabled={areButtonsDisabled}
                >
                  <Remove />
                </Button>
                <Button
                  sx={buttonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentValue(
                      (currentValue ?? 0) + (item.step ?? DEFAULT_STEP)
                    );
                  }}
                  disabled={areButtonsDisabled}
                >
                  <Add />
                </Button>
              </Box>
            </Stack>
          </CardContent>
          <CardMedia
            component="img"
            sx={(theme) => ({
              width: 200,
              [theme.breakpoints.down('sm')]: {
                width: 130,
              },
              flexShrink: 0,
            })}
            image={
              isAnilistMedia(item.media)
                ? item.media.coverImage.large
                : getTmdbImagePath(item.media.poster_path)
            }
            alt={displayTitle(item.media)}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default ListItem;
