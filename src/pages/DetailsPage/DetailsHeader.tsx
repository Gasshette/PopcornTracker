import { Edit } from '@mui/icons-material';
import { Box, IconButton, useTheme } from '@mui/material';
import { Item } from '../../types/Item';
import { getTmdbImagePath, hexToRgba, isAnilistMedia } from '../../utils';
import { useConfig } from '../../contexts/ConfigProvider';
import { useAuth } from '../../contexts/AuthProvider';
import { useDialogsContext } from '../../contexts/DialogsProvider';
import { useParams } from 'react-router-dom';
import { StyledChip } from '../../components/StyledChip';

interface DetailsItemDialogHeaderProps {
  item: Item | undefined;
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
        backgroundPosition: 'center center',
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
      <StyledChip
        label={item?.status}
        color={config.status[item.status]}
        sx={{ position: 'absolute', bottom: -16, ml: 2 }}
      />
      <IconButton
        onClick={onEdit}
        sx={{
          backgroundColor: 'rgba(0, 0, 0)',
          '&:hover': {
            color: 'rgba(0, 0, 0)',
            backgroundColor: hexToRgba(theme.palette.common.white),
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
