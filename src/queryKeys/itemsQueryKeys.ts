export const itemsQueryKeys = {
  default: () => ['items'],
  fetchItem: (mediaId: number | undefined, mediaType: 'anilist' | 'tmdb') => [
    itemsQueryKeys.default(),
    mediaId,
    mediaType,
  ],
  refetchAnilistItems: (mediaIds: Array<number>) => [
    itemsQueryKeys.default(),
    'anilist',
    mediaIds,
  ],
  refetchTmdbItems: (mediaIds: Array<number>) => [
    itemsQueryKeys.default(),
    'tmdb',
    mediaIds,
  ],
};
