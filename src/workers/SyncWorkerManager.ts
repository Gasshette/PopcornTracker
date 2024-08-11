import { PopcornSignals } from '../PopcornSignals';
import { Config } from '../types/Config';
import { PopcornTrackerDocument } from '../types/Document';
import { Item } from '../types/Item';
import { buildDocument } from '../utils';
import {
  DocumentMessage,
  DocumentResponseMessage,
  SyncDocumentMessage as SyncDocumentMessage,
  SyncWorkerMessageType,
} from './SyncWorkerMessages';

export class SyncWorkerManager {
  constructor(public syncWorker: Worker) {
    this.syncWorker.onmessage = this.onMessage;
  }

  onMessage = (event: MessageEvent<DocumentResponseMessage>) => {
    switch (event.data.type) {
      case 'init':
        PopcornSignals.initSignal.emit();
        // this.init(event.data);
        break;
      case 'setConfig':
        PopcornSignals.setConfigSignal.emit();
        break;
      case 'setItems':
        PopcornSignals.setItemsSignal.emit();
        break;
      case 'syncDocument':
        PopcornSignals.syncSignal.emit(event.data);
        break;
    }
  };

  syncDocument(conf: Partial<SyncDocumentMessage>) {
    this.syncWorker.postMessage({ type: 'syncDocument', ...conf });
  }

  setConfig(config: Config) {
    this.syncWorker.postMessage(
      this.buildDocumentMessage({ config }, 'setConfig')
    );
  }

  async setItems(items: Array<Item>) {
    this.syncWorker.postMessage(
      this.buildDocumentMessage({ items }, 'setItems')
    );
  }

  setDocument(document: PopcornTrackerDocument) {
    this.syncWorker.postMessage(
      this.buildDocumentMessage(document, 'setDocument')
    );
  }

  private buildDocumentMessage(
    document: Partial<PopcornTrackerDocument>,
    type: SyncWorkerMessageType
  ): DocumentMessage {
    const doc = buildDocument(document);

    return {
      type,
      ...doc,
    };
  }
}
