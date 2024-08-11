import { MediaType } from '../types/Anilist';
import { Category } from '../types/Item';

export abstract class PopcornTrackerApi {
  static getTypeByCategory = (category: keyof typeof Category): MediaType => {
    switch (category) {
      case 'Movie':
      case 'Serie':
      case 'Anime':
        return 'ANIME';
      case 'Manga':
        return 'MANGA';
      default:
        return 'MANGA';
    }
  };
}
