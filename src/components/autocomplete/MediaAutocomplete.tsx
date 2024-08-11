import {
  Autocomplete as MuiAutocomplete,
  CircularProgress,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import React, { useEffect } from 'react';
import debounce from 'lodash.debounce';
import { Category, Item, Status } from '../../types/Item';
import { debounceFunc, displayTitle, isAnilistMedia } from '../../utils';
import { AnilistMedia } from '../../types/Anilist';
import { TmdbMedia } from '../../types/Tmdb';
import { AnilistApi } from '../../api/AnilistApi';
import { TmdbApi } from '../../api/TmdbApi';
import { useItems } from '../../contexts/ItemsProvider';
import isEqual from 'lodash.isequal';
import { Controller, useFormContext } from 'react-hook-form';
import { ListItemOption } from './ListItemOption';

const MediaAutocomplete = () => {
  const [options, setOptions] = React.useState<Array<AnilistMedia | TmdbMedia>>(
    []
  );
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const { items } = useItems();
  const {
    control,
    getValues,
    resetField,
    formState: { errors },
  } = useFormContext<Item>();

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = event.target.value;
    if (!getValues('category') || !name) return;

    setSearchValue(name);
  };

  const transformTmdbMedia = async (media: TmdbMedia) => {
    // transform into something exploitable based on TmdbApi.getGenres()
    const allGenres = await TmdbApi.getGenres();
    media.genres = allGenres.filter((g) => media.genre_ids.includes(g.id));
  };

  const handleOpenAutocomplete = () => {
    // Disable window scroll and dialog body scroll
    document.body.style.overflow = 'hidden';
    const dialogBody = document.querySelector(
      '.MuiDialogContent-root'
    ) as HTMLDivElement;
    if (dialogBody) dialogBody.style.overflow = 'hidden';
  };

  const handleCloseAutocomplete = () => {
    // Re-enable scroll
    document.body.style.overflow = '';
    const dialogBody = document.querySelector(
      '.MuiDialogContent-root'
    ) as HTMLDivElement;
    if (dialogBody) dialogBody.style.overflow = '';
  };

  const buildItem = (option: AnilistMedia | TmdbMedia) => {
    const item: Item = {
      id: '',
      media: option,
      category: Category[getValues('category')],
      isFavorite: false,
      status: Status[getValues('status')],
    };
    return item;
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      if (searchValue?.length > 0) {
        const category = getValues('category');

        if (['Anime', 'Manga'].includes(category)) {
          const response = await AnilistApi.searchByNameAndType(
            searchValue,
            AnilistApi.getTypeByCategory(category)
          );

          const medias = response.data.Page.media.filter(
            (media) => !items.some((item) => isEqual(item.media?.id, media.id))
          );

          setOptions(medias);
        } else {
          const response = await TmdbApi.getMedia(searchValue);
          setOptions(
            response.filter(
              (media) =>
                !items.some((item) => isEqual(item.media?.id, media.id))
            )
          );
        }
      }
      setLoading(false);
    };

    debounceFunc(fetch, searchValue);
  }, [searchValue]);

  return (
    <Controller
      name="media"
      rules={{ required: true }}
      control={control}
      render={({ field: { onChange, value, ...rest } }) => (
        <MuiAutocomplete<AnilistMedia | TmdbMedia>
          {...rest}
          autoFocus
          clearOnBlur={false}
          onOpen={handleOpenAutocomplete}
          onClose={handleCloseAutocomplete}
          onChange={async (_, value, reason) => {
            if (reason === 'clear') {
              resetField('media');
              return;
            }

            if (value) {
              if (!isAnilistMedia(value)) {
                await transformTmdbMedia(value);
              }

              onChange(value);
            }
          }}
          loading={loading}
          options={options}
          noOptionsText="No results"
          value={value}
          getOptionLabel={displayTitle}
          filterOptions={(options, _) => options}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            const item = buildItem(option);

            return (
              <MenuItem key={option.id} {...rest}>
                <ListItemOption item={item} />
              </MenuItem>
            );
          }}
          renderInput={(params) => {
            const media = getValues('media');

            return (
              <Stack sx={{ gap: 1 }}>
                <TextField
                  autoFocus
                  {...params}
                  label="Media"
                  onChange={debounce(handleSearchChange, 500)}
                  slotProps={{
                    formHelperText: {
                      sx: { color: (theme) => theme.palette.error.main },
                    },
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                  {...(!!errors.media && { helperText: 'Media is required' })}
                />
                {media && <ListItemOption item={buildItem(media)} />}
              </Stack>
            );
          }}
        />
      )}
    />
  );
};

export default MediaAutocomplete;
