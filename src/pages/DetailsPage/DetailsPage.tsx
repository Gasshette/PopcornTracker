import { Typography, Box, CircularProgress } from '@mui/material';
import { useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnilistApi } from '../../api/AnilistApi';
import { Item } from '../../types/Item';
import { isAnilistMedia } from '../../utils';
import { useItems } from '../../contexts/ItemsProvider';
import { DetailsContent } from './DetailsContent';
import DetailsHeader from './DetailsHeader';
import { AppMessage } from '../../components/AppMessage';

export const DetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { items, getItem, deletedItemRef } = useItems();
  const [item, setItem] = useState<Item>();
  const [error, setError] = useState<string>();

  useLayoutEffect(() => {
    const buildItem = async () => {
      try {
        if (id && items) {
          const sourceItem = getItem(id);

          if (!sourceItem) {
            throw new Error('Item not found');
          }

          if (!isAnilistMedia(sourceItem?.media)) {
            setItem(sourceItem);
            return;
          }

          const fullMedia = await AnilistApi.getMedia(
            sourceItem.media?.id,
            true
          );

          setItem({
            ...sourceItem,
            media: fullMedia?.data.Media,
          });
        }
      } catch (error: any) {
        setError(
          `An error occured while retrieving the media (id:${id}). ${error.message}`
        );
      }
    };

    buildItem();
  }, [id, items]);

  if (!id) {
    return null;
  }

  if (error) {
    if (id === deletedItemRef.current?.id) {
      return (
        <AppMessage>
          <CircularProgress />
        </AppMessage>
      );
    }

    return <Typography>{error}</Typography>;
  }

  if (!item) {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <>
      <DetailsHeader item={item} />
      <DetailsContent item={item} />
    </>
  );
};
