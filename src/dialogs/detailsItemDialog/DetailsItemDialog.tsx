import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { AnilistApi } from '../../api/AnilistApi';
import { Item } from '../../types/Item';
import { useConfig } from '../../contexts/ConfigProvider';
import DetailsItemDialogHeader from './DetailsItemDialogHeader';
import { NoDataMessageDisplayer } from '../../components/NoDataMessageDisplayer';
import { AiringSchedule } from './AiringSchedule';
import { Description } from './Description';
import { Title } from './Title';
import { isAnilistMedia } from '../../utils';

interface DetailsItemDialogProps {
  sourceItem?: Item;
  open: boolean;
  onClose: () => void;
  onEdit: (item: Item) => void;
}

const DetailsItemDialog = (props: DetailsItemDialogProps) => {
  const { sourceItem, open, onClose, onEdit } = props;

  const [item, setItem] = useState<Item>();
  const [error, setError] = useState<string>();
  const { config } = useConfig();
  const theme = useTheme();
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  const buildDialogContent = () => {
    if (error) {
      return <Typography>{error}</Typography>;
    }

    if (!item) {
      return (
        <Stack justifyContent="center">
          <CircularProgress />
        </Stack>
      );
    }

    if (!item.media) {
      return (
        <NoDataMessageDisplayer>Something went wrong :(</NoDataMessageDisplayer>
      );
    }

    return (
      <Stack gap={2}>
        <Title item={item} isUnderSm={isUnderSm} onClose={onClose} />

        {/* CHIPS */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: 1,
            my: 2,
          }}
        >
          <Chip
            label={item.category}
            size="medium"
            style={{ backgroundColor: config.colors[item.category] }}
            sx={{ mb: 2 }}
          />

          {isAnilistMedia(item.media) &&
            item.media.genres.map((g) => (
              <Chip key={g} label={g} size="small" />
            ))}
          {!isAnilistMedia(item.media) &&
            item.media.genres.map((g) => (
              <Chip key={g.id} label={g.name} size="small" />
            ))}
        </Box>

        <Description item={item} />

        {isAnilistMedia(item.media) &&
        (item.media.episodes || item.media.chapters) ? (
          <>
            <Typography variant={isUnderSm ? 'h6' : 'h5'}>
              {item.media.episodes && `${item.media.episodes} episodes`}
              {item.media.chapters && `${item.media.chapters} chapters`}
            </Typography>

            <Stack
              direction={isUnderSm ? 'column' : 'row'}
              gap={2}
              flexWrap={'wrap'}
            >
              <AiringSchedule item={item} />
            </Stack>
          </>
        ) : (
          <NoDataMessageDisplayer>
            No data provided for this media :(
          </NoDataMessageDisplayer>
        )}
      </Stack>
    );
  };

  useEffect(() => {
    const buildItem = async () => {
      const mediaId = sourceItem?.media?.id;

      try {
        if (mediaId) {
          if (!isAnilistMedia(sourceItem?.media)) {
            setItem(sourceItem);
            return;
          }

          const fullMedia = await AnilistApi.getMedia(mediaId, true);

          setItem({
            ...sourceItem,
            media: fullMedia?.data.Media,
          });
        }
      } catch (error: any) {
        setError(
          `An error occured while retrieving the media (id:${mediaId}). ${error.message}`
        );
      }
    };

    buildItem();
  }, [sourceItem]);

  if (!sourceItem) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogContent sx={{ p: 0 }}>
        <DetailsItemDialogHeader item={item} onEdit={onEdit} />
        <DialogContent>{buildDialogContent()}</DialogContent>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsItemDialog;
