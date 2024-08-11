import { Config } from './Config';
import { Item } from './Item';

export interface PopcornTrackerDocument {
  items: Array<Item>;
  config: Config;
  lastUpdated: string;
}

export interface DocumentResponse {
  document: PopcornTrackerDocument;
  userId: string;
  _changed: string;
  _changedby: string;
  _created: string;
  _createdby: string;
  _id: string;
  _keywords: string[];
  _tags: string;
  _version: number;
}
