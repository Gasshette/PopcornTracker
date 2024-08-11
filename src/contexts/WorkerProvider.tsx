import { createContext, useContext } from 'react';
import { SyncWorkerManager } from '../workers/SyncWorkerManager';

const syncWorkerContext = createContext<Worker | null>(null);

export const WorkerProvider = syncWorkerContext.Provider;
export const useSyncWorkerManager = () => {
  const context = useContext(syncWorkerContext);

  if (!context) {
    throw new Error('useSyncWorker must be used within a WorkerProvider');
  }

  const syncWorkerManager = new SyncWorkerManager(context);

  return syncWorkerManager;
};
