import { createContext, useContext, useEffect, useState } from 'react';
import { Category, FilterCondition, Item, Status } from '../types/Item';
import { DEFAULT_STEP, POPCORN_TRACKER_DOCUMENT_KEY } from '../const';
import { useAuth } from './AuthProvider';
import { buildDocument, debounceFunc, isAnilistMedia } from '../utils';
import { PopcornTrackerDocument } from '../types/Document';
import { useSyncWorkerManager } from './WorkerProvider';
import isEqual from 'lodash.isequal';
import { PopcornSignals } from '../PopcornSignals';

interface ItemsContextProps {
  items: Array<Item>;
  setItems: React.Dispatch<React.SetStateAction<Array<Item>>>;
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
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
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
  const [items, setItems] = useState<Array<Item>>(initItems());
  const [filterCondition, setFilterCondition] = useState<FilterCondition>(
    FilterCondition.AND
  );
  const [filteredItems, setFilteredItems] = useState<Array<Item>>([]);
  const [filters, setFilters] = useState<
    Array<keyof typeof Category | keyof typeof Status>
  >([]);
  const [textFilter, setTextFilter] = useState<string>();
  const syncWorkerManager = useSyncWorkerManager();
  const { user, setIsSyncing } = useAuth();

  const addItem = (item: Item) => {
    const newItems = [item, ...items];
    setItems(newItems);
  };

  const toggleFavorite = (itemId: string) => {
    const newItems = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, isFavorite: !item.isFavorite };
      }

      return item;
    });

    // Set the favorite Items at the top of the list for the draggableList of favorites to work as expected
    setItems([
      ...newItems.filter((item) => item.id === itemId),
      ...newItems.filter((item) => item.id !== itemId),
    ]);
  };

  const editItem = (item: Item) => {
    const newItems = items.map((i) => (i.id === item.id ? item : i));
    setItems(newItems);
  };

  const removeItem = (item: Item) => {
    const newItems = items.filter((i) => i.id !== item.id);
    setItems(newItems);
  };

  const incrementItem = (itemId: string) => {
    const newItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          value: (item.value ?? 0) + (item.step ?? DEFAULT_STEP),
        };
      }
      return item;
    });

    setItems(newItems);
  };

  const decrementItem = (itemId: string) => {
    const newItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          value: (item.value ?? 0) - (item.step ?? DEFAULT_STEP),
        };
      }
      return item;
    });

    setItems(newItems);
  };

  const handleFilteredItems = () => {
    let newFilteredItems = items.filter((item) => {
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

    setFilteredItems(newFilteredItems);
  };

  useEffect(() => {
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

    debounceFunc(saveItems, JSON.stringify(items));
    PopcornSignals.setItemsSignal.connect(() => {
      setIsSyncing(false);
    });
  }, [items]);

  useEffect(() => {
    const stringifiedDoc = localStorage.getItem(POPCORN_TRACKER_DOCUMENT_KEY);

    if (stringifiedDoc) {
      const doc = JSON.parse(stringifiedDoc) as PopcornTrackerDocument;
      setItems(doc.items);
    }
  }, []);

  useEffect(() => {
    handleFilteredItems();
  }, [filters, textFilter, filterCondition]);

  return (
    <ItemsContext.Provider
      value={{
        items,
        setItems,
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
        incrementItem,
        decrementItem,
      }}
    >
      {props.children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
