import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, useTheme } from '@mui/material';
import { Item } from '../../types/Item';
import { getTmdbImagePath, hexToRgba, isAnilistMedia } from '../../utils';
import { useConfig } from '../../contexts/ConfigProvider';
import { useAuth } from '../../contexts/AuthProvider';
import { useDialogsContext } from '../../contexts/DialogsProvider';
import { useParams } from 'react-router-dom';

interface DetailsItemDialogHeaderProps {
  item?: Item;
}

const DetailsHeader = (props: DetailsItemDialogHeaderProps) => {
  const { item } = props;
  const theme = useTheme();
  const { config } = useConfig();
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const { setDialogsState } = useDialogsContext();

  const onEdit = () => {
    setDialogsState((prev) => ({
      ...prev,
      addOrUpdate: true,
      addOrUpdateItem: item,
    }));
  };

  if (!item?.media) {
    return <></>;
  }

  const getBackgroundStyle = () => {
    if (isAnilistMedia(item?.media)) {
      if (!item?.media?.bannerImage) {
        return {
          backgroundColor:
            item?.media?.coverImage.color ?? theme.palette.grey[500],
        };
      }

      return {
        backgroundImage: `url(${item?.media?.bannerImage})`,
        backgroundSize: 'cover',
      };
    } else if (!isAnilistMedia(item?.media) && item?.media?.backdrop_path) {
      return {
        backgroundImage: `url(${getTmdbImagePath(item?.media?.backdrop_path, 'xxl')})`,
        backgroundSize: 'cover',
      };
    } else {
      return {};
    }
  };

  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        height: '250px',
        ...getBackgroundStyle(),
        [theme.breakpoints.down('sm')]: {
          maxHeight: '20%',
        },
      })}
    >
      <Chip
        label={item?.status}
        sx={{
          ...(item && {
            backgroundColor: config.status[item.status],
          }),
          position: 'absolute',
          bottom: -16,
          ml: 2,
        }}
      />
      <IconButton
        onClick={onEdit}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, .7)',
          '&:hover': {
            color: 'rgba(0, 0, 0, .7)',
            backgroundColor: hexToRgba(theme.palette.common.white, 0.7),
          },
          position: 'absolute',
          bottom: -20,
          right: 0,
          mr: 2,
        }}
        disabled={!user || !!userId}
      >
        <Edit fontSize="medium" />
      </IconButton>
    </Box>
  );
};

export default DetailsHeader;
