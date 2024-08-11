import { Category, Status } from './Item';

export type CategoryColors = Record<keyof typeof Category, string>;
export type StatusColors = Record<keyof typeof Status, string>;

export interface Config {
  colors: CategoryColors;
  status: StatusColors;
}
