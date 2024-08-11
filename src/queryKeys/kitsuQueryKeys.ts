export const kitsuQueryKeys = {
  default: () => ['kitsu'],
  fetchEpisodes: (kitsuId: string | null) => [
    kitsuQueryKeys.default(),
    'episodes',
    kitsuId,
  ],
  findMatch: (mediaId: number | undefined) => [
    kitsuQueryKeys.default(),
    'match',
    mediaId,
  ],
};
