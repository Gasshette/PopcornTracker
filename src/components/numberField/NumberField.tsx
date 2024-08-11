import {
  Controller,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form';
import { Item } from '../../types/Item';
import { Button, ButtonGroup, Stack, TextField } from '@mui/material';
import { DEFAULT_STEP } from '../../const';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import './numberField.scss';

interface NumberFieldProps {
  name: UseControllerProps<Item>['name'];
  errored?: boolean;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export const NumberField = (props: NumberFieldProps) => {
  const {
    name,
    label,
    defaultValue,
    errored,
    step = 1,
    min = -Infinity,
    max = Infinity,
  } = props;

  const { control } = useFormContext<Item & { season: number }>();

  return (
    <Controller<Item & { season: number }>
      name={name}
      control={control}
      defaultValue={defaultValue ?? 0}
      {...(errored !== undefined && { rules: { required: true } })}
      render={({ field: { value, onChange, ...rest } }) => {
        return (
          <Stack direction="row">
            <TextField
              {...rest}
              fullWidth
              type="number"
              className="number-input"
              value={value}
              label={label}
              onChange={(e) => {
                onChange(e);
              }}
              slotProps={{
                htmlInput: {
                  min,
                  max,
                  step: DEFAULT_STEP,
                  label,
                },
                formHelperText: {
                  sx: { color: (theme) => theme.palette.error.main },
                },
              }}
              {...(errored && { helperText: `${name} is required` })}
            />
            <ButtonGroup
              orientation="vertical"
              variant="text"
              sx={(theme) => ({
                ml: -5,
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
        );
      }}
    />
  );
};
