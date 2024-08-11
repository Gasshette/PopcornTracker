import { Control, Controller, UseControllerProps } from 'react-hook-form';
import { Item } from '../../types/Item';
import { Button, ButtonGroup, Stack, TextField } from '@mui/material';
import { DEFAULT_STEP } from '../../const';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import './numberField.scss';

interface NumberFieldProps {
  name: UseControllerProps<Item>['name'];
  min?: number;
  max?: number;
  control: Control<Item, any>;
  defaultValue?: number;
  step?: number;
}

export const NumberField = (props: NumberFieldProps) => {
  const {
    name,
    defaultValue,
    step = 1,
    control,
    min = -Infinity,
    max = Infinity,
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange, ...rest } }) => (
        <Stack direction="row" gap={1}>
          <TextField
            className="number-input"
            type="number"
            inputProps={{
              min,
              max,
              step: DEFAULT_STEP,
            }}
            value={value}
            onChange={(e) => {
              onChange(e);
            }}
            {...rest}
          />
          <ButtonGroup
            orientation="vertical"
            variant="text"
            sx={(theme) => ({
              ml: -6,
              '& .MuiButton-root': {
                border: 'none',
                color: theme.palette.common.white,
              },
            })}
          >
            [
            <Button
              size="small"
              key="up"
              onClick={() => {
                const newValue =
                  Number(value ?? 0) + Number(step ?? DEFAULT_STEP);
                onChange(newValue);
              }}
            >
              <ArrowUpward fontSize="small" />
            </Button>
            ,
            <Button
              size="small"
              key="down"
              onClick={() => {
                const newValue =
                  Number(value ?? 0) - Number(step ?? DEFAULT_STEP);
                onChange(newValue);
              }}
            >
              <ArrowDownward fontSize="small" />
            </Button>
            ]
          </ButtonGroup>
        </Stack>
      )}
    />
  );
};
