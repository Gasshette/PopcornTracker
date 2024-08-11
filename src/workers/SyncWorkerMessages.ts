import { DocumentResponse, PopcornTrackerDocument } from '../types/Document';

const syncWorkerMessages = [
  'init',
  'syncDocument',
  'setDocument',
  'setConfig',
  'getConfig',
  'setItems',
  'getItems',
] as const;
export type SyncWorkerMessageType = (typeof syncWorkerMessages)[number];

interface BaseMessage<T extends SyncWorkerMessageType>
  extends PopcornTrackerDocument {
  type: T;
}

export interface GetColorsMessage extends BaseMessage<'getConfig'> {}
export interface SetColorsMessage extends BaseMessage<'setConfig'> {}
export interface GetItemsMessage extends BaseMessage<'getItems'> {}
export interface SetItemsMessage extends BaseMessage<'setItems'> {}

export interface SyncDocumentMessage
  extends Pick<BaseMessage<'syncDocument'>, 'type'> {
  apiKey: string;
  userId: string;
  userEmail: string;
}

export interface DocumentMessage extends PopcornTrackerDocument {
  type: SyncWorkerMessageType;
}

export interface DocumentResponseMessage extends DocumentResponse {
  type: SyncWorkerMessageType;
}

export type SyncWorkerMessage =
  | GetColorsMessage
  | SetColorsMessage
  | GetItemsMessage
  | SetItemsMessage
  | SyncDocumentMessage;
