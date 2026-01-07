import { createContext, useContext, useState, ReactNode } from 'react';

interface EpisodePagesContextType {
  getLoadedPages: (itemId: string) => number;
  setLoadedPages: (itemId: string, pages: number) => void;
}

const EpisodePagesContext = createContext<EpisodePagesContextType | undefined>(
  undefined
);

interface EpisodePageProviderProps {
  children: ReactNode;
}
export const EpisodePagesProvider = (props: EpisodePageProviderProps) => {
  const { children } = props;

  // Store loaded pages per anime ID
  const [loadedPagesMap, setLoadedPagesMap] = useState<Record<string, number>>(
    {}
  );

  const getLoadedPages = (itemId: string): number => {
    return loadedPagesMap[itemId] || 1; // Default to 1 page
  };

  const setLoadedPages = (itemId: string, pages: number) => {
    setLoadedPagesMap((prev) => ({
      ...prev,
      [itemId]: pages,
    }));
  };

  return (
    <EpisodePagesContext.Provider value={{ getLoadedPages, setLoadedPages }}>
      {children}
    </EpisodePagesContext.Provider>
  );
};

export const useEpisodePages = (): EpisodePagesContextType => {
  const context = useContext(EpisodePagesContext);
  if (!context) {
    throw new Error(
      'useEpisodePages must be used within an EpisodePagesProvider'
    );
  }
  return context;
};
