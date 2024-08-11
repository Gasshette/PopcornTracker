import { useQuery } from '@tanstack/react-query';
import { Item } from '../types/Item';
import { itemsQueryKeys } from '../queryKeys/itemsQueryKeys';
import { TmdbApi } from '../api/TmdbApi';
import { TmdbMedia } from '../types/Tmdb';

export async function refetchTmdbItems(items: Array<Item>) {
  const newItems = structuredClone(items);

  const successfulMedias = [];
  const failedItems = [];

  for (const item of newItems) {
    const { id, media_type: type } = item.media! as TmdbMedia;
    try {
      const media = await TmdbApi.getMediaById({ id, type });

      if (!media) {
        throw new Error('Media not found');
      }

      successfulMedias.push({ status: 'fulfilled', item, media });
    } catch (err) {
      failedItems.push({ status: 'rejected', item, error: err });
    }
  }

  // Build a map for fast lookup
  const mediaById = new Map<number, TmdbMedia>();
  for (const media of successfulMedias) {
    mediaById.set(media.media.id, media.media);
  }

  // Update items with fetched media
  newItems.forEach((item) => {
    const updated = mediaById.get(item.media!.id);
    if (updated) {
      item.media = { ...item.media, ...updated }; // prevent losing data: api call doesn't return media_type for example
      item.lastUpdated = Date.now();
    }
  });

  return { items: newItems, failedItems };
}

export const useRefetchTmdbItems = (items: Array<Item>, enabled: boolean) => {
  return useQuery({
    queryKey: itemsQueryKeys.refetchTmdbItems(items.map((i) => i.media!.id)),
    queryFn: () => refetchTmdbItems(items),
    enabled,
  });
};
