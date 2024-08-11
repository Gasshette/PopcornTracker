import { Clear, Search } from '@mui/icons-material';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  SxProps,
} from '@mui/material';
import { forwardRef } from 'react';

interface SearchBarProps {
  sx?: SxProps;
  defaultValue?: string;
  onSearch: React.MouseEventHandler<HTMLButtonElement>;
  onClear: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (props, ref) => {
    const { sx, defaultValue, onSearch, onClear } = props;

    return (
      <Box
        sx={{
          py: 1,
          ...sx,
        }}
      >
        <form>
          <TextField
            fullWidth
            inputRef={ref}
            size="small"
            defaultValue={defaultValue}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={onClear}>
                    <Clear />
                  </IconButton>
                  <IconButton type="submit" size="small" onClick={onSearch}>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
    );
  }
);
