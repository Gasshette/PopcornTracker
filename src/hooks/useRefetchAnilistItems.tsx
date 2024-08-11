import { useQuery } from '@tanstack/react-query';
import { AnilistApi } from '../api/AnilistApi';
import { AnilistMedia } from '../types/Anilist';
import { Item } from '../types/Item';
import { itemsQueryKeys } from '../queryKeys/itemsQueryKeys';

async function refetchAnilistItems(items: Array<Item>): Promise<Array<Item>> {
  const newItems = structuredClone(items);

  const response = await AnilistApi.getMedias(newItems.map((i) => i.media!.id));

  if (!response?.data) {
    throw new Error('AniList returned no data');
  }

  const medias = Object.values(response.data);

  const mediaById = new Map<number, AnilistMedia>();
  for (const media of medias) {
    if (media?.id) {
      mediaById.set(media.id, media);
    }
  }

  newItems.forEach((item) => {
    const updated = mediaById.get(item.media!.id);
    if (updated) {
      item.media = { ...item.media, ...updated };
      item.lastUpdated = Date.now();
    }
  });

  return newItems;
}

export const useRefetchAnilistItems = (
  items: Array<Item>,
  enabled: boolean
) => {
  return useQuery({
    queryKey: itemsQueryKeys.refetchAnilistItems(items.map((i) => i.media!.id)),
    queryFn: () => refetchAnilistItems(items),
    enabled,
  });
};
