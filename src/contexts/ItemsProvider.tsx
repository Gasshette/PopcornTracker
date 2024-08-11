import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Category, FilterCondition, Item, Status } from '../types/Item';
import { POPCORN_TRACKER_DOCUMENT_KEY } from '../const';
import { useAuth } from './AuthProvider';
import { buildDocument, isAnilistMedia } from '../utils';
import { PopcornTrackerDocument } from '../types/Document';
import { useSyncWorkerManager } from './WorkerProvider';
import isEqual from 'lodash.isequal';
import { PopcornSignals } from '../PopcornSignals';
import { useParams } from 'react-router-dom';
import { useDocument } from '../hooks/useDocument';
import { CircularProgress } from '@mui/material';
import { AppMessage } from '../components/AppMessage';

interface ItemsContextProps {
  items: Array<Item>;
  isOrderedByScore: boolean;
  setIsOrderedByScore: React.Dispatch<React.SetStateAction<boolean>>;
  deletedItemRef: React.RefObject<Item>;
  setItems: React.Dispatch<React.SetStateAction<Array<Item>>>;
  getItem: (id: string) => Item | undefined;
  filteredItems: Array<Item>;
  filters: Array<keyof typeof Category | keyof typeof Status>;
  textFilter: string | undefined;
  setTextFilter: React.Dispatch<React.SetStateAction<string | undefined>>;
  filterCondition: FilterCondition;
  setFilterCondition: React.Dispatch<React.SetStateAction<FilterCondition>>;
  setFilters: React.Dispatch<
    React.SetStateAction<Array<keyof typeof Category | keyof typeof Status>>
  >;
  addItem: (item: Item) => void;
  toggleFavorite: (itemId: string) => void;
  editItem: (item: Item) => void;
  removeItem: (item: Item) => void;
  updateValue: (value: number, itemId: string) => void;
}

interface ItemsProviderProps {
  children: React.ReactNode;
}

function initItems(): Array<Item> {
  const storedDocument = localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY);

  if (storedDocument) {
    return (JSON.parse(storedDocument) as PopcornTrackerDocument).items;
  }

  return [];
}

const ItemsContext = createContext<ItemsContextProps>({} as ItemsContextProps);

export const ItemsProvider = (props: ItemsProviderProps) => {
  const { children } = props;

  const { userId } = useParams<{ userId: string }>();
  const [items, setItems] = useState<Array<Item>>(initItems());
  const [filterCondition, setFilterCondition] = useState<FilterCondition>(
    FilterCondition.AND
  );
  const [isOrderedByScore, setIsOrderedByScore] = useState(false);
  const [filteredItems, setFilteredItems] = useState<Array<Item>>([]);
  const [filters, setFilters] = useState<
    Array<keyof typeof Category | keyof typeof Status>
  >([]);
  const [textFilter, setTextFilter] = useState<string>();
  const syncWorkerManager = useSyncWorkerManager();
  const { user, setIsSyncing } = useAuth();
  const { data: documents, isLoading } = useDocument(userId);

  const deletedItemRef = useRef<Item | null>(null);

  const getItem = (id: string) => items.find((item) => item.id === id);

  const addItem = (item: Item) => {
    if (userId) return;

    const newItems = [item, ...items];
    setItems(newItems);
  };

  const toggleFavorite = (itemId: string) => {
    if (userId) return;

    let newItems = items;
    const item = newItems.splice(
      newItems.findIndex((item) => item.id === itemId),
      1
    )[0];

    item.isFavorite = !item.isFavorite;
    newItems.unshift(item);

    // Always put the favorites on top of the list
    const favorites = newItems.filter((item) => item.isFavorite);
    newItems = favorites.concat(newItems.filter((item) => !item.isFavorite));

    setItems([...newItems]);
  };

  const editItem = (item: Item) => {
    if (userId) return;

    const newItems = items.map((i) => (i.id === item.id ? item : i));
    setItems(newItems);
  };

  const removeItem = (item: Item) => {
    if (userId) return;

    deletedItemRef.current = item;
    const newItems = items.filter((i) => i.id !== item.id);
    setItems(newItems);
  };

  const updateValue = (value: number, itemId: string) => {
    if (userId) return;

    const newItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          value,
          ...(value > 0 && { status: Status.Ongoing }),
          ...(value === 0 && { status: Status.Planned }),
        };
      }
      return item;
    });

    setItems(newItems);
  };

  const handleFilteredItems = () => {
    let newFilteredItems =
      filters.length <= 0
        ? items
        : items.filter((item) => {
            const filterValues = [item.category, item.status];
            if (filterCondition === FilterCondition.AND) {
              return filters.every((filter) => filterValues.includes(filter));
            } else if (filterCondition === FilterCondition.OR) {
              return filters.some((filter) => filterValues.includes(filter));
            } else {
              throw new Error('Invalid filter condition');
            }
          });

    if (textFilter && newFilteredItems.length > 0) {
      newFilteredItems = newFilteredItems.filter((item) => {
        if (isAnilistMedia(item.media)) {
          const mergedTitles = `${item.media.title.romaji} ${item.media.title.english} ${item.media.title.native}`;
          return mergedTitles.toLowerCase().includes(textFilter.toLowerCase());
        } else {
          const mergedTitles = `${item.media!.title} ${item.media!.original_name} ${item.media!.name}`;
          return mergedTitles.toLowerCase().includes(textFilter.toLowerCase());
        }
      });
    }

    if (isOrderedByScore) {
      newFilteredItems = structuredClone(newFilteredItems).sort((a, b) => {
        const scoreA = isAnilistMedia(a.media)
          ? a.media.averageScore
          : a.media!.vote_average * 10;
        const scoreB = isAnilistMedia(b.media)
          ? b.media.averageScore
          : b.media!.vote_average * 10;

        return scoreB - scoreA;
      });
    }

    // Always put the favorites on top of the list
    const favorites = newFilteredItems.filter((item) => item.isFavorite);
    newFilteredItems = favorites.concat(
      newFilteredItems.filter((item) => !item.isFavorite)
    );

    setFilteredItems(newFilteredItems);
  };

  useLayoutEffect(() => {
    if (userId) return;

    const saveItems = async () => {
      // If there is any filters set, mirror the items changes in the list of filtered items
      // So the result appear on the screen
      if ((filters.length > 0 || textFilter) && filteredItems.length > 0) {
        handleFilteredItems();
      }

      let areItemsEqual = false;
      const previousDoc = localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY);

      if (previousDoc) {
        const previousItems = (
          JSON.parse(previousDoc) as PopcornTrackerDocument
        ).items;
        areItemsEqual = isEqual(previousItems, items);
      }

      // If the new Items are different than the previous ones, save them in local storage
      // And if authed, mirror the result in the DB
      if (!areItemsEqual) {
        const newDoc = buildDocument({ items });
        localStorage.setItem(
          POPCORN_TRACKER_DOCUMENT_KEY,
          JSON.stringify(newDoc)
        );

        if (user) {
          const currentDocument = localStorage.getItem(
            POPCORN_TRACKER_DOCUMENT_KEY
          );

          if (currentDocument) {
            setIsSyncing(true);

            const parsedItems = (
              JSON.parse(currentDocument) as PopcornTrackerDocument
            ).items;

            syncWorkerManager.setItems(parsedItems);
          }
        }
      }
    };

    saveItems();

    PopcornSignals.setItemsSignal.connect(() => {
      setIsSyncing(false);
    });
  }, [items]);

  useEffect(() => {
    // Effect made only for shared profile page
    if (!userId) return;

    const stringifiedDoc = localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY);

    if (stringifiedDoc) {
      const doc = JSON.parse(stringifiedDoc) as PopcornTrackerDocument;
      setItems(doc.items);
    }
  }, []);

  useEffect(() => {
    handleFilteredItems();
  }, [items, filters, textFilter, filterCondition, isOrderedByScore]);

  useEffect(() => {
    if (userId && documents) {
      setItems(documents[0].document.items);
    }
  }, [documents, userId]);

  if (!items || isLoading)
    return (
      <AppMessage>
        <CircularProgress size="4rem" />
      </AppMessage>
    );

  return (
    <ItemsContext.Provider
      value={{
        items,
        isOrderedByScore,
        setIsOrderedByScore,
        deletedItemRef,
        setItems,
        getItem,
        filterCondition,
        setFilterCondition,
        filteredItems,
        filters,
        textFilter,
        setTextFilter,
        setFilters,
        addItem,
        toggleFavorite,
        editItem,
        removeItem,
        updateValue,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
