import {
  Badge,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  styled,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useConfig } from '../contexts/ConfigProvider';
import { Category, FilterCondition, Status } from '../types/Item';
import { useItems } from '../contexts/ItemsProvider';
import { Clear, KeyboardDoubleArrowRight, Tune } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { getRightTransitionSx } from '../utils';

const FullChip = styled(Chip)(() => ({
  '&  .MuiChip-label': {
    overflow: 'visible',
  },
}));

const FILTERBAR_HEIGHT = 44;

export const Filters = () => {
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [filterContainerWidth, setFilterContainerWidth] = useState<number>(0);
  const { config } = useConfig();
  const {
    filters,
    setFilters,
    setTextFilter,
    setIsOrderedByScore,
    isOrderedByScore,
  } = useItems();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (filterValue: Category | Status) => {
    setFilters((prev) => {
      return prev.includes(filterValue)
        ? prev.filter((c) => c !== filterValue)
        : [...prev, filterValue];
    });
  };

  const getPaperWidth = () => {
    if (containerRef.current) {
      return containerRef.current.offsetWidth;
    }
    return 0;
  };

  const clearFilters = () => {
    setFilters([]);
    searchInputRef.current && (searchInputRef.current.value = '');
    setTextFilter(undefined);
    setIsOrderedByScore(false);
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
  }, [containerRef.current]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        backdropFilter: 'blur(10px)',
        height: FILTERBAR_HEIGHT,
      }}
    >
      <Box
        sx={(theme) => ({
          width: '100%',
          height: FILTERBAR_HEIGHT,
          gap: 3,
          right: -999,
          px: 1,
          [theme.breakpoints.up('sm')]: { px: 2 },
          ...getRightTransitionSx(showAdvancedFilters, -2000, 1),
        })}
      >
        <AdvancedFilters />
        <IconButton
          sx={(theme) => ({ [theme.breakpoints.down('sm')]: { ml: 'auto' } })}
          onClick={() => setShowAdvancedFilters(false)}
        >
          <KeyboardDoubleArrowRight />
        </IconButton>
      </Box>

      <Box
        sx={(theme) => ({
          width: '100%',
          height: FILTERBAR_HEIGHT,
          p: 1,
          [theme.breakpoints.up('sm')]: { px: 2 },
          ...getRightTransitionSx(showAdvancedFilters, 1, -2000),
        })}
      >
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            [theme.breakpoints.up('sm')]: {
              justifyContent: 'center',
            },
            flexWrap: 'nowrap',
            gap: 1,
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
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconButton sx={{ flexShrink: 0 }} onClick={clearFilters}>
            <Clear />
          </IconButton>
          <IconButton
            sx={{ flexShrink: 0 }}
            onClick={() => {
              setShowAdvancedFilters(!showAdvancedFilters);
            }}
          >
            <Badge variant="dot" color="warning" invisible={!isOrderedByScore}>
              <Tune />
            </Badge>
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

const AdvancedFilters = () => {
  const {
    filterCondition,
    setFilterCondition,
    isOrderedByScore,
    setIsOrderedByScore,
  } = useItems();
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        gap: 2,
        [theme.breakpoints.up('sm')]: { m: 'auto' },
      })}
    >
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
      <FormControlLabel
        control={
          <Checkbox
            checked={isOrderedByScore}
            onChange={(event) => setIsOrderedByScore(event.target.checked)}
          />
        }
        label="Order by score"
      />
    </Box>
  );
};
