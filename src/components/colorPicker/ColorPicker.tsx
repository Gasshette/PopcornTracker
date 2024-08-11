import { forwardRef, useRef } from 'react';
import { Box, Stack, TextField, TextFieldProps } from '@mui/material';

type ColorPickerProps = TextFieldProps & {
  adornment?: React.ReactNode;
};

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  (props, ref) => {
    const { adornment, value, ...rest } = props;

    const colorInputRef = useRef<HTMLInputElement>(null);

    return (
      <Stack sx={{ position: 'relative', width: 225, m: 'auto' }}>
        {/* Hidden color input */}
        <TextField
          inputRef={colorInputRef}
          type="color"
          value={value}
          sx={{ visibility: 'hidden', position: 'absolute' }}
          onChange={rest.onChange}
        />

        <Stack
          direction="row"
          sx={{ width: '100%', alignItems: 'center', gap: 1 }}
        >
          <Box>{adornment}</Box>

          <TextField
            {...rest}
            ref={ref}
            value={value}
            fullWidth
            size="small"
            onFocus={() => colorInputRef.current?.showPicker?.()}
            sx={{ ml: 'auto', width: 100 }}
          />
        </Stack>
      </Stack>
    );
  }
);
