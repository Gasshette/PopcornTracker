import { useQuery } from '@tanstack/react-query';
import { Category, Item } from '../types/Item';
import { itemsQueryKeys } from '../queryKeys/itemsQueryKeys';
import { isAnilistMedia } from '../utils';
import { AnilistApi } from '../api/AnilistApi';
import { TmdbApi } from '../api/TmdbApi';
import { AnilistMedia } from '../types/Anilist';
import { TmdbMedia } from '../types/Tmdb';

async function fetchMedia(
  item: Item
): Promise<AnilistMedia | TmdbMedia | null> {
  if (isAnilistMedia(item.media)) {
    const result = await AnilistApi.getMedia(item.media.id, true);
    return result?.data.Media ?? null;
  }

  return await TmdbApi.getMediaById({
    id: item.media!.id,
    type: item.category === Category.Movie ? item.category.toLowerCase() : 'tv',
  });
}

export const useFetchMedia = (item: Item) => {
  return useQuery({
    queryKey: itemsQueryKeys.fetchItem(
      item.media!.id,
      isAnilistMedia(item.media) ? 'anilist' : 'tmdb'
    ),
    queryFn: () => fetchMedia(item),
  });
};
