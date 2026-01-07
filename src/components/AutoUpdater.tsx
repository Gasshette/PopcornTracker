import { Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { ReactNode, useEffect, useMemo } from 'react';
import {
  POPCORN_TRACKER_LAST_REFETCH_TIMESTAMP_KEY,
  POPCORN_TRACKER_REFETCH_STATUSES_KEY,
} from '../const';
import { useItems } from '../contexts/ItemsProvider';
import { useRefetchAnilistItems } from '../hooks/useRefetchAnilistItems';
import { useRefetchTmdbItems } from '../hooks/useRefetchTmdbItems';
import { Item } from '../types/Item';
import { isAnilistMedia } from '../utils';
import { AppMessage } from './AppMessage';
import { SyncIcon } from './SyncIcon';

interface AutoUpdaterProps {
  children: ReactNode;
}

const TWO_WEEKS = 14;
const SLICE_SIZE = 10;
const cutoff = dayjs().subtract(TWO_WEEKS, 'day').valueOf();

interface RefetchState {
  refetchdate: string;
  errors: {
    anilist: unknown;
    tmdb: unknown;
  };
}

function hasRefetchedToday(): boolean {
  const lastTs = localStorage.getItem(
    POPCORN_TRACKER_LAST_REFETCH_TIMESTAMP_KEY
  );
  if (!lastTs) return false;

  const lastRefetch = dayjs(Number(lastTs));
  return lastRefetch.isSame(dayjs(), 'day'); // compares only the day
}

export const AutoUpdater = (props: AutoUpdaterProps) => {
  const { children } = props;

  const canRefetch = !hasRefetchedToday();

  const { items } = useItems();

  const { anilistItems, tmdbItems } = useMemo(() => {
    const anilistItems: Array<Item> = [];
    const tmdbItems: Array<Item> = [];

    const toUpdate = items
      .filter((i) => i.lastUpdated == null || i.lastUpdated <= cutoff)
      .sort((a, b) => (a.lastUpdated ?? 0) - (b.lastUpdated ?? 0))
      .slice(0, SLICE_SIZE);

    toUpdate.forEach((item) =>
      isAnilistMedia(item.media)
        ? anilistItems.push(item)
        : tmdbItems.push(item)
    );

    return { anilistItems, tmdbItems };
  }, [items]);

  const {
    data: { newItems: anilistData, invalidIds: invalidAnilistIds } = {
      newItems: [],
      invalidIds: [],
    },
    isLoading: isAnilistLoading,
    error: anilistError,
  } = useRefetchAnilistItems(anilistItems, canRefetch);
  const {
    data: tmdbData,
    isLoading: isTmdbLoading,
    error: tmdbError,
  } = useRefetchTmdbItems(tmdbItems, canRefetch);

  if (isAnilistLoading || isTmdbLoading) {
    return (
      <AppMessage>
        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <Typography variant="h4">Auto updating &#128524;</Typography>
          <SyncIcon sx={{ fontSize: 50 }} />
        </Stack>
      </AppMessage>
    );
  }

  if (
    anilistError ||
    invalidAnilistIds.length > 0 ||
    tmdbError ||
    (tmdbData && tmdbData.failedItems.length > 0)
  ) {
    let states: Array<RefetchState> = [];
    const statesRaw = localStorage.getItem(
      POPCORN_TRACKER_REFETCH_STATUSES_KEY
    );

    if (statesRaw) {
      states = JSON.parse(statesRaw);
    }

    const tmdbErrorState = [];
    if (tmdbError) {
      tmdbErrorState.unshift(tmdbError);
    }

    if (tmdbData?.failedItems) {
      tmdbErrorState.push(tmdbData.failedItems);
    }
    const newState: RefetchState = {
      refetchdate: dayjs().format('YYYY-MM-DD'),
      errors: {
        anilist: { anilistError, invalidAnilistIds },
        tmdb: tmdbErrorState,
      },
    };

    states.unshift(newState);

    localStorage.setItem(
      POPCORN_TRACKER_REFETCH_STATUSES_KEY,
      JSON.stringify(states)
    );
  }

  return (
    <>
      {canRefetch && (
        <Updater anilistData={anilistData} tmdbData={tmdbData?.items} />
      )}
      {children}
    </>
  );
};

interface UpdaterProps {
  anilistData: Array<Item> | undefined;
  tmdbData: Array<Item> | undefined;
}
const Updater = (props: UpdaterProps) => {
  const { anilistData, tmdbData } = props;
  const { items, setItems } = useItems();

  useEffect(() => {
    const newItems: Array<Item> = structuredClone(items);

    anilistData?.forEach((anilistItem) => {
      const matchingItem = newItems.find((item) => item.id === anilistItem.id);

      if (matchingItem) {
        matchingItem.media = anilistItem.media;
        matchingItem.lastUpdated = anilistItem.lastUpdated;
      }
    });

    tmdbData?.forEach((tmdbItem) => {
      const matchingItem = newItems.find((item) => item.id === tmdbItem.id);

      if (matchingItem) {
        matchingItem.media = tmdbItem.media;
        matchingItem.lastUpdated = tmdbItem.lastUpdated;
      }
    });

    if (newItems.length === items.length) {
      localStorage.setItem(
        POPCORN_TRACKER_LAST_REFETCH_TIMESTAMP_KEY,
        Date.now().toString()
      );

      setItems(newItems);
    }
  }, []);

  return null;
};
