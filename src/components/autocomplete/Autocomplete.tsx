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

interface AutocompleteProps {
  category: keyof typeof Category;
  defaultValue?: AnilistMedia | TmdbMedia | null;
  value?: AnilistMedia | TmdbMedia | null;
  onChange: (value: AnilistMedia | TmdbMedia) => void;
}

const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (props, ref) => {
    const { category, value, defaultValue, onChange } = props;

    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState<
      Array<AnilistMedia | TmdbMedia>
    >([]);
    const [searchValue, setSearchValue] = React.useState<string>('');
    const loading =
      open && options && options.length === 0 && searchValue.length > 0;

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const name = event.target.value;
      if (!category || !name) return;

      setSearchValue(name);
    };

    useEffect(() => {
      const fetch = async () => {
        if (searchValue?.length > 0) {
          if (['Anime', 'Manga'].includes(category)) {
            const response = await AnilistApi.searchByNameAndType(
              searchValue,
              AnilistApi.getTypeByCategory(category)
            );

            setOptions(response.data.Page.media);
          } else {
            const response = await TmdbApi.getMedia(searchValue);
            setOptions(response);
          }
        }
      };

      debounceFunc(fetch, searchValue);
    }, [searchValue]);

    return (
      <MuiAutocomplete<AnilistMedia | TmdbMedia>
        ref={ref}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        onChange={(_, value) => value && onChange(value)}
        loading={loading}
        options={options}
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
            variant="outlined"
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
