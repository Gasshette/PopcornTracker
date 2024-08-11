import {
  Category,
  DEFAULT_CATEGORY,
  DEFAULT_STATUS,
  Item,
  Status,
  VideoItem,
} from '../types/Item';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { useEffect, useState } from 'react';
import hasSeason, {
  displayTitle,
  getEmptyItem,
  hasTimer,
  isAnilistMedia,
  isVideoItem,
} from '../utils';
import { useItems } from '../contexts/ItemsProvider';
import dayjs from 'dayjs';
import { TimeInput } from '../components/TimeInput';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Switch,
  Box,
} from '@mui/material';
import { NumberField } from '../components/numberField/NumberField';
import { DEFAULT_STEP } from '../const';
import Autocomplete from '../components/autocomplete/Autocomplete';
import { useConfig } from '../contexts/ConfigProvider';
import { TmdbMedia } from '../types/Tmdb';
import { TmdbApi } from '../api/TmdbApi';

interface ItemDetailsDialogProps {
  item?: Item;
  open: boolean;
  onClose: () => void;
}

export const AddOrUpdateItemDialog = (props: ItemDetailsDialogProps) => {
  const { item, open, onClose } = props;

  const { addItem, editItem, removeItem } = useItems();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<Item>({ defaultValues: item });
  const [withTimer, setWithTimer] = useState<boolean>(false);

  const { config } = useConfig();

  const categoryWatcher = watch('category');
  const stepWatcher = watch('step');
  const statusWatcher = watch('status');

  const onSubmit = (data: Item) => {
    try {
      // removes empty properties from data
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v != null)
      ) as Item;

      const submittedItem = {
        ...(item ?? getEmptyItem(Category[data.category])),
        ...cleanData,
      };

      // Manage value
      const val = Number(submittedItem.value);
      submittedItem.value = !val || Number.isNaN(val) ? 0 : val;

      // manage timer
      if (isVideoItem(submittedItem) && !withTimer) {
        delete submittedItem.timer;
      }

      item ? editItem(submittedItem) : addItem(submittedItem);

      handleClose();
    } catch (error) {
      console.error(`error : `, error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleRemove = () => {
    if (item) {
      removeItem(item);
      handleClose();
    }
  };

  const transformTmdbMedia = async (media: TmdbMedia) => {
    // transform into something exploitable based on TmdbApi.getGenres()
    const allGenres = await TmdbApi.getGenres();
    media.genres = allGenres.filter((g) => media.genre_ids.includes(g.id));
  };

  useEffect(() => {
    setWithTimer(hasTimer(item));
  }, [item]);

  useEffect(() => {
    if (item && isVideoItem(item)) {
      const timerValue = withTimer ? dayjs(item?.timer) : undefined;
      setValue('timer', timerValue, { shouldDirty: true });
    }
  }, [withTimer]);

  useEffect(() => {
    reset(item ?? getEmptyItem(DEFAULT_CATEGORY));
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: (theme) => ({
          [theme.breakpoints.down('sm')]: {
            width: '100%',
          },
        }),
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {item && displayTitle(item.media)}
          {!item && 'Item creation'}
        </div>
        {item && (
          <Chip
            label={item.category}
            sx={{ backgroundColor: config.colors[item.category] }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={(theme) => ({
            mt: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            [theme.breakpoints.up('sm')]: {
              minWidth: '500px',
            },
          })}
        >
          {!item && (
            <>
              <FormControl fullWidth>
                <FormLabel>Category</FormLabel>
                <Select<keyof typeof Category>
                  fullWidth
                  defaultValue={DEFAULT_CATEGORY}
                  {...register('category', { required: true })}
                  MenuProps={{ PaperProps: { style: { maxWidth: '90vw' } } }}
                >
                  {Object.values(Category).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          <FormControl fullWidth>
            <FormLabel>Status</FormLabel>
            <Controller
              control={control}
              name="status"
              defaultValue={item?.status ?? DEFAULT_STATUS}
              render={({ field }) => (
                <Select<keyof typeof Status>
                  fullWidth
                  {...field}
                  defaultValue={item?.status ?? DEFAULT_STATUS}
                  MenuProps={{ PaperProps: { style: { maxWidth: '90vw' } } }}
                >
                  {Object.values(Status).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <FormControl fullWidth error={!!errors.media}>
            <FormLabel>
              Media <ErrorMessage errors={errors} name="media" />
            </FormLabel>
            <Controller
              rules={{ required: 'is required' }}
              control={control}
              name="media"
              render={({ field: { onChange, ...rest } }) => (
                <Autocomplete
                  {...rest}
                  onChange={async (value) => {
                    if (!isAnilistMedia(value)) {
                      await transformTmdbMedia(value);
                    }

                    onChange(value);
                  }}
                  category={item?.category ?? categoryWatcher}
                />
              )}
            />
          </FormControl>

          {statusWatcher !== Status.Done && (
            <>
              {hasSeason(
                item ??
                  ({ category: categoryWatcher } as Item & { season: number })
              ) && (
                <FormControl fullWidth>
                  <FormLabel>Season</FormLabel>
                  <NumberField
                    step={1}
                    min={0}
                    name="season"
                    defaultValue={1}
                    control={control}
                  />
                </FormControl>
              )}

              <FormControl fullWidth>
                <FormLabel>Step</FormLabel>
                <NumberField step={0.5} min={0} name="step" control={control} />
              </FormControl>

              <FormControl fullWidth variant="outlined" error={!!errors.value}>
                <FormLabel>Value</FormLabel>
                <NumberField
                  min={0}
                  name="value"
                  step={stepWatcher ?? DEFAULT_STEP}
                  control={control}
                />
              </FormControl>

              {isVideoItem(item ?? ({ category: categoryWatcher } as Item)) && (
                <FormControl
                  fullWidth
                  error={!!(errors as FieldErrors<VideoItem>).timer}
                >
                  <FormLabel>Timer</FormLabel>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Switch
                      checked={withTimer}
                      onChange={(e) => setWithTimer(e.target.checked)}
                    />
                    {withTimer && <TimeInput control={control} />}
                  </Box>
                </FormControl>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {item && (
          <Button
            variant="outlined"
            color="error"
            sx={{ mr: 'auto' }}
            onClick={handleRemove}
          >
            Delete
          </Button>
        )}
        <Button color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          type="submit"
          onClick={handleSubmit(onSubmit, (error) => {
            console.error('error', error);
          })}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrUpdateItemDialog;
