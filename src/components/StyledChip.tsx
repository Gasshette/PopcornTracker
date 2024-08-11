import { Chip, ChipProps, darken, lighten } from '@mui/material';

export const StyledChip = (
  props: Omit<ChipProps, 'color' | 'size'> & { color: string }
) => {
  const { color, sx, ...rest } = props;

  return (
    <Chip
      {...rest}
      size="small"
      sx={{
        fontWeight: 500,
        backgroundColor: darken(color, 0.5),
        color: lighten(color, 0.3),
        border: `1px solid ${lighten(color, 0.3)}`,
        ...sx,
      }}
    />
  );
};
