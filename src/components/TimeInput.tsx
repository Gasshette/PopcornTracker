import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Control, Controller } from 'react-hook-form';
import { Item } from '../types/Item';

interface TimeInputProps {
  /**
   * React hook form control
   */
  control: Control<Item, any>;
}

export const TimeInput = (props: TimeInputProps) => {
  const { control } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        control={control}
        name="timer"
        render={({ field: { value, ...rest } }) => (
          <TimePicker
            minutesStep={1}
            ampm={false}
            format="HH:mm:ss"
            views={['hours', 'minutes', 'seconds']}
            sx={{ '& > fieldset': { border: 'none' } }}
            defaultValue={dayjs(value)}
            {...rest}
          />
        )}
      />
    </LocalizationProvider>
  );
};
