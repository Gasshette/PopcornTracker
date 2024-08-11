import { useItems } from '../contexts/ItemsProvider';
import { Category, Item, Status } from '../types/Item';
import { Add, Bookmark, Remove } from '@mui/icons-material';
import hasSeason, {
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

interface Itemprops {
  item: Item;
  openItemDetails: (item: Item) => void;
}

const ListItem = (props: Itemprops) => {
  const { item, openItemDetails } = props;

  const { incrementItem, decrementItem, toggleFavorite } = useItems();
  const { config } = useConfig();
  const theme = useTheme();
  const { user } = useAuth();

  const isVideo = isVideoItem(item);
  const withTimer = isVideo && hasTimer(item);
  const buttonStyle: SxProps = {
    py: 3,
    width: '50%',
    color: config.colors[item.category],
  };
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    incrementItem(item.id);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    decrementItem(item.id);
  };

  const handleOpenItemDetails = () => {
    openItemDetails(item);
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

  if (!item.media) {
    return <></>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Card onClick={handleOpenItemDetails}>
        <Box
          sx={{
            display: 'flex',
            '&:hover': { cursor: 'pointer' },
          }}
        >
          <CardContent sx={{ flex: '1 1 auto' }}>
            <IconButton
              size="medium"
              sx={{
                position: 'absolute',
                top: -14,
                left: -20,
                color: item.isFavorite ? 'darkorange' : 'inherit',
                ...(!item.isFavorite && { opacity: 0.8 }),
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              disabled={!user}
            >
              <Bookmark fontSize="medium" />
            </IconButton>
            <Stack sx={{ height: '100%' }}>
              <MediaTitleDisplayer media={item.media} size="medium" />
              <Box sx={{ mb: 1, alignSelf: 'flex-start' }}>
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
                      {item.value}
                      {displayTimer()}
                    </Typography>
                  </LocalizationProvider>
                )}

              <Box
                sx={{
                  mt: 'auto',
                  display: 'flex',
                  width: '100%',
                }}
              >
                {/* Buttons are disabled is the user is not logged in
              Buttons are also disabled is the media is done. In this case, icons are not shown as well */}
                <Button
                  sx={buttonStyle}
                  onClick={handleDecrement}
                  disabled={!user || item.status === Status.Done}
                >
                  {item.status === Status.Done ||
                  item.category === Category.Movie ? (
                    <></>
                  ) : (
                    <Remove />
                  )}
                </Button>
                <Button
                  sx={buttonStyle}
                  onClick={handleIncrement}
                  disabled={!user || item.status === Status.Done}
                >
                  {item.status === Status.Done ||
                  item.category === Category.Movie ? (
                    <></>
                  ) : (
                    <Add />
                  )}
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
