export const jikanQueryKeys = {
  default: () => ['jikan'],
  fetchEpisodes: (malId: number | null) => [
    jikanQueryKeys.default(),
    'episodes',
    malId,
  ],
  findMatch: (mediaId: number | undefined) => [
    jikanQueryKeys.default(),
    'match',
    mediaId,
  ],
  animeById: (malId: number | null) => [jikanQueryKeys.default(), malId],
};
