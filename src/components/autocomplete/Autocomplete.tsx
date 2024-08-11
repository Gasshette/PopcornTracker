import {
  Autocomplete as MuiAutocomplete,
  CircularProgress,
  TextField,
} from '@mui/material';
import React, { forwardRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { Category } from '../../types/Item';
import { debounceFunc, displayTitle, isAnilistMedia } from '../../utils';
import { AnilistMedia } from '../../types/Anilist';
import { AnilistOption } from './AnilistOption';
import { TmdbOption } from './TmdbOption';
import { TmdbMedia } from '../../types/Tmdb';
import { AnilistApi } from '../../api/AnilistApi';
import { TmdbApi } from '../../api/TmdbApi';
import { useItems } from '../../contexts/ItemsProvider';
import isEqual from 'lodash.isequal';

interface AutocompleteProps {
  category: keyof typeof Category;
  defaultValue?: AnilistMedia | TmdbMedia | null;
  value?: AnilistMedia | TmdbMedia | null;
  onChange: (value: AnilistMedia | TmdbMedia) => void;
}

const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (props, ref) => {
    const { category, value, defaultValue, onChange } = props;
    const { items } = useItems();
    const [options, setOptions] = React.useState<
      Array<AnilistMedia | TmdbMedia>
    >([]);
    const [searchValue, setSearchValue] = React.useState<string>('');
    const [loading, setLoading] = React.useState(false);

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const name = event.target.value;
      if (!category || !name) return;

      setSearchValue(name);
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

    useEffect(() => {
      const fetch = async () => {
        setLoading(true);
        if (searchValue?.length > 0) {
          if (['Anime', 'Manga'].includes(category)) {
            const response = await AnilistApi.searchByNameAndType(
              searchValue,
              AnilistApi.getTypeByCategory(category)
            );

            const medias = response.data.Page.media.filter(
              (media) =>
                !items.some((item) => isEqual(item.media?.id, media.id))
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
      <MuiAutocomplete<AnilistMedia | TmdbMedia>
        ref={ref}
        onOpen={handleOpenAutocomplete}
        onClose={handleCloseAutocomplete}
        onChange={(_, value) => value && onChange(value)}
        loading={loading}
        options={options}
        noOptionsText="No results"
        value={value}
        defaultValue={defaultValue}
        getOptionLabel={displayTitle}
        filterOptions={(options, _) => options}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(props, option) => {
          return isAnilistMedia(option) ? (
            <AnilistOption key={option.id} option={option} liProps={props} />
          ) : (
            <TmdbOption key={option.id} option={option} liProps={props} />
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            onChange={debounce(handleChange, 500)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    );
  }
);

export default Autocomplete;
