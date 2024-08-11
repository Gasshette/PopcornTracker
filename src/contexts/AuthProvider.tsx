import { createContext, useContext, useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useSyncWorkerManager } from './WorkerProvider';
import { DocumentResponse, PopcornTrackerDocument } from '../types/Document';
import {
  POPCORN_TRACKER_DOCUMENT_KEY,
  POPCORN_TRACKER_LOGGED_USER_KEY,
  RESTDB_APIKEY,
} from '../const';
import { PopcornSignals } from '../PopcornSignals';
import { isDefaultDocument, isValidDate } from '../utils';
import { SyncIcon } from '../components/SyncIcon';
import { GoogleUserInfo } from '../types/GoogleUserInfo';
import { useParams } from 'react-router-dom';
import { AppMessage } from '../components/AppMessage';

interface AuthContext {
  user: GoogleUserInfo | undefined;
  setUser: React.Dispatch<React.SetStateAction<GoogleUserInfo | undefined>>;
  isSyncing: boolean;
  setIsSyncing: React.Dispatch<React.SetStateAction<boolean>>;
}

const authContext = createContext<AuthContext | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const { children } = props;

  const [user, setUser] = useState<GoogleUserInfo>();
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { userId } = useParams<{ userId: string }>();
  const syncWorkerManager = useSyncWorkerManager();

  useEffect(() => {
    const user = localStorage.getItem(POPCORN_TRACKER_LOGGED_USER_KEY);

    if (user) {
      const userInfo: GoogleUserInfo = JSON.parse(user);
      setUser(userInfo);
    }
  }, []);

  useEffect(() => {
    // We do not sync if we are checking someone else's profile (userId)
    if (!user || userId) {
      return;
    }

    if (userId) {
      setIsSynced(true);
      return;
    }

    const sync = async (response: DocumentResponse) => {
      const stringifiedLocalDoc = localStorage.getItem(
        POPCORN_TRACKER_DOCUMENT_KEY
      );

      if (stringifiedLocalDoc) {
        const localDoc = JSON.parse(
          stringifiedLocalDoc
        ) as PopcornTrackerDocument;

        const remoteLastUpdated = new Date(response.document.lastUpdated);
        const localLastUpdated = new Date(localDoc.lastUpdated);

        if (!isValidDate(remoteLastUpdated) || !isValidDate(localLastUpdated)) {
          throw new Error(
            `Invalid date. remote: ${remoteLastUpdated}, local: ${localLastUpdated}`
          );
        }

        const isLocalDefaultDoc = isDefaultDocument(localDoc);
        const isRemoteDefaultDoc = isDefaultDocument(response.document);

        // if at least one document contains data (not the default doc)
        if (!isLocalDefaultDoc || !isRemoteDefaultDoc) {
          if (!isLocalDefaultDoc && isRemoteDefaultDoc) {
            // If only the localDoc contains real data (different than default doc)
            syncWorkerManager.setDocument(localDoc);
          } else if (isLocalDefaultDoc && !isRemoteDefaultDoc) {
            // if only the remote doc contains real data (different than default doc)
            localStorage.setItem(
              POPCORN_TRACKER_DOCUMENT_KEY,
              JSON.stringify(response.document)
            );
          } else if (localLastUpdated > remoteLastUpdated) {
            // if the local doc is newer
            syncWorkerManager.setDocument(localDoc);
          } else {
            localStorage.setItem(
              POPCORN_TRACKER_DOCUMENT_KEY,
              JSON.stringify(response.document)
            );
          }
        }
      } else {
        // If the local doc doesn't exist, we store the response in localStorage
        localStorage.setItem(
          POPCORN_TRACKER_DOCUMENT_KEY,
          JSON.stringify(response.document)
        );
      }

      setIsSynced(true);
    };

    setIsSynced(false);

    syncWorkerManager.syncDocument({
      apiKey: RESTDB_APIKEY,
      userId: user.id,
      userEmail: user.email,
    });

    PopcornSignals.syncSignal.connect(sync);
  }, [user, userId]);

  if (!userId && user && !isSynced) {
    return (
      <AppMessage>
        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <Typography variant="h4">Syncing &#128524;</Typography>
          <SyncIcon sx={{ fontSize: 50 }} />
        </Stack>
      </AppMessage>
    );
  }

  return (
    <authContext.Provider value={{ user, setUser, isSyncing, setIsSyncing }}>
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authContext);

  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
};
