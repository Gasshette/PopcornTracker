import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useConfig } from '../contexts/ConfigProvider';
import { Category, FilterCondition, Status } from '../types/Item';
import { useItems } from '../contexts/ItemsProvider';
import { Restore, Search, Send } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';

const FullChip = styled(Chip)(() => ({
  '&  .MuiChip-label': {
    overflow: 'visible',
  },
}));

interface FiltersProps {
  showSearchBar: boolean;
}

const Filters = (props: FiltersProps) => {
  const { showSearchBar } = props;

  const [filterContainerWidth, setFilterContainerWidth] = useState<number>(0);
  const { config } = useConfig();
  const {
    filters,
    setFilters,
    setTextFilter,
    filterCondition,
    setFilterCondition,
  } = useItems();
  const paperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (filterValue: Category | Status) => {
    setFilters((prev) => {
      return prev.includes(filterValue)
        ? prev.filter((c) => c !== filterValue)
        : [...prev, filterValue];
    });
  };

  const getPaperWidth = () => {
    if (paperRef.current) {
      return paperRef.current.offsetWidth;
    }
    return 0;
  };

  useEffect(() => {
    const setter = () => {
      setFilterContainerWidth(getPaperWidth());
    };

    const paperWidth = getPaperWidth();
    setFilterContainerWidth(paperWidth);

    window.addEventListener('resize', setter);

    return () => {
      window.removeEventListener('resize', setter);
    };
  }, [paperRef.current]);

  useEffect(() => {
    showSearchBar && searchInputRef.current?.focus();
  }, [showSearchBar]);

  return (
    <>
      <Stack
        ref={paperRef}
        sx={{
          width: '100%',
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={filterCondition}
            onChange={(_e, value: FilterCondition) =>
              value && setFilterCondition(value)
            }
          >
            {Object.values(FilterCondition).map((condition) => (
              <ToggleButton key={condition} value={condition}>
                {condition}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
        <Stack
          sx={(theme) => ({
            flexDirection: 'row',
            gap: 1,
            alignItems: 'center',
            [theme.breakpoints.up('sm')]: {
              justifyContent: 'center',
            },
            flexWrap: 'nowrap',
            overflow: 'auto',
            width: filterContainerWidth,
          })}
        >
          {Object.values(Category).map((category) => (
            <FullChip
              size={filters.includes(category) ? 'medium' : 'small'}
              key={category}
              sx={{
                backgroundColor: config.colors[category],
              }}
              label={category}
              onClick={() => handleClick(category)}
            />
          ))}
          {Object.values(Status).map((status) => (
            <FullChip
              size={filters.includes(status) ? 'medium' : 'small'}
              key={status}
              sx={{
                backgroundColor: config.status[status],
              }}
              label={status}
              onClick={() => handleClick(status)}
            />
          ))}
        </Stack>
        <IconButton
          sx={{ flexShrink: 0 }}
          onClick={() => {
            setFilters([]);
            searchInputRef.current && (searchInputRef.current.value = '');
            setTextFilter(undefined);
          }}
        >
          <Restore />
        </IconButton>
      </Stack>
      <Box sx={{ display: showSearchBar ? 'block' : 'none', py: 1 }}>
        <form>
          <TextField
            inputRef={searchInputRef}
            size="small"
            sx={{ m: 'auto', width: '100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton disabled>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTextFilter(searchInputRef.current?.value ?? undefined);
                    }}
                  >
                    <Send fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
    </>
  );
};

export default Filters;
