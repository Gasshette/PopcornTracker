import { createContext, useContext, useLayoutEffect, useState } from 'react';
import { POPCORN_TRACKER_DOCUMENT_KEY } from '../const';
import { useSyncWorkerManager } from './WorkerProvider';
import { Config } from '../types/Config';
import { useAuth } from './AuthProvider';
import { buildDocument, debounceFunc, getInitialConfig } from '../utils';
import { PopcornTrackerDocument } from '../types/Document';
import isEqual from 'lodash.isequal';

function initConfig(): Config {
  const storedDocument = localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY);
  if (storedDocument) {
    return (JSON.parse(storedDocument) as PopcornTrackerDocument).config;
  }

  return getInitialConfig();
}

interface ConfigContext {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

const ConfigContext = createContext<ConfigContext | null>(null);

interface ConfigProviderProps {
  children: React.ReactNode;
}

export const ConfigProvider = (props: ConfigProviderProps) => {
  const [config, setConfig] = useState<Config>(initConfig());
  const syncWorkerManager = useSyncWorkerManager();
  const { user } = useAuth();

  useLayoutEffect(() => {
    const saveConfig = async () => {
      let areConfigEqual = false;
      const previousDoc = localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY);

      if (previousDoc) {
        const previousConfig = (
          JSON.parse(previousDoc) as PopcornTrackerDocument
        ).config;
        areConfigEqual = isEqual(previousConfig, config);
      }

      if (!areConfigEqual) {
        localStorage.setItem(
          POPCORN_TRACKER_DOCUMENT_KEY,
          JSON.stringify(buildDocument({ config: config }))
        );

        if (user) {
          const currentDocument = localStorage.getItem(
            POPCORN_TRACKER_DOCUMENT_KEY
          );

          if (currentDocument) {
            const parsedConfig = (
              JSON.parse(currentDocument) as PopcornTrackerDocument
            ).config;

            syncWorkerManager.setConfig(parsedConfig);
          }
        }
      }
    };

    debounceFunc(saveConfig, JSON.stringify(config));
  }, [config]);

  useLayoutEffect(() => {
    const stringifiedDoc = localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY);
    if (stringifiedDoc) {
      const doc = JSON.parse(stringifiedDoc) as PopcornTrackerDocument;
      setConfig(doc.config);
    }
  }, []);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {props.children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return context;
};
