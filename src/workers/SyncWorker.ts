import { getDocument } from '../api/RestDbApi';
import { RESTDB_URL } from '../const';
import { DocumentResponse, PopcornTrackerDocument } from '../types/Document';
import { getInitialConfig } from '../utils';
import { DocumentMessage, SyncDocumentMessage } from './SyncWorkerMessages';

let apiKey: string | undefined;
let userId: string | undefined;
let userEmail: string | undefined;
let documentId: string | undefined;

export const get = async () => {
  if (!apiKey) {
    throw new Error('apiKey is required');
  }

  const response = await fetch(RESTDB_URL, {
    headers: {
      'x-apikey': apiKey,
    },
  });

  const data = await response.json();
  postMessage(data);
};

self.onmessage = async (
  event: MessageEvent<DocumentMessage | SyncDocumentMessage>
) => {
  try {
    switch (event.data.type) {
      case 'syncDocument': {
        apiKey = (event.data as SyncDocumentMessage).apiKey;
        userId = (event.data as SyncDocumentMessage).userId;
        userEmail = (event.data as SyncDocumentMessage).userEmail;
        let response: Array<DocumentResponse> | DocumentResponse | undefined;

        response = undefined;
        if (userId && apiKey) {
          response = await getDocument(userId, apiKey);
        }
        // If no record exists with the userId, create one
        if (!response || response.length <= 0) {
          response = await checkAndFetch(() =>
            setDocument(
              {
                items: [],
                config: getInitialConfig(),
                lastUpdated: new Date().toISOString(),
              },
              true
            )
          );

          if (!response) {
            throw new Error('Failed to init document');
          }
        }

        const returnedResponse = Array.isArray(response)
          ? response[0]
          : response;
        documentId = returnedResponse._id;

        postMessage({ ...returnedResponse, type: event.data.type });
        break;
      }
      case 'setDocument':
      case 'setItems':
      case 'setConfig': {
        const document: PopcornTrackerDocument = {
          items: event.data.items,
          config: event.data.config,
          lastUpdated: event.data.lastUpdated,
        };
        await checkAndFetch(() => setDocument(document));
        self.postMessage({ type: event.data.type });
        break;
      }
      case 'getConfig':
      case 'getItems':
        break;
      default:
        throw new Error(`Unknown message type ${(event.data as any).type}`);
    }
  } catch (error: unknown) {
    throw error;
  }
};

async function checkAndFetch<T>(
  callback: (...args: any) => Promise<T>
): Promise<T | undefined> {
  if (apiKey && userId) {
    return await callback();
  }

  throw new Error('apiKey and userId are required');
}

async function setDocument(
  document: PopcornTrackerDocument,
  isInit = false
): Promise<DocumentResponse | undefined> {
  if (!isInit && !documentId) {
    throw new Error('DocumentId is required');
  }

  const response = await fetch(
    `${RESTDB_URL}${isInit ? '' : `/${documentId}`}`,
    {
      method: isInit ? 'POST' : 'PATCH',
      headers: {
        'x-apikey': `${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ document, userId, userEmail }),
    }
  );

  if (response.ok) {
    return await response.json();
  }
}
