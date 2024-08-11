export const pageInfos = `{
  pageInfo {
    total
    currentPage
    lastPage
    hasNextPage
    perPage
  }`;

/**
 * Returns a GraphQL query string for retrieving Anilist media information.
 *
 * @param {boolean} [isFull] - Optional flag to include additional media details. Default is false.
 * @return {string} A GraphQL query string.
 */
export const getAnilistMedia = (isFull?: boolean) => `{
  id
  title {
    romaji
    english
    native
  }
  bannerImage
  coverImage {
    medium
    large
    color
  }
  ${
    isFull
      ? `
    season
    seasonYear
    type
    description
    episodes
    chapters
    averageScore
    genres
    airingSchedule {
      nodes {
        id
        airingAt
        timeUntilAiring
        episode
        mediaId
      }
    }
    `
      : ``
  }
}`;
