import {
  Category,
  DEFAULT_CATEGORY,
  DEFAULT_STATUS,
  Item,
  Status,
  VideoItem,
} from '../types/Item';
import {
  Controller,
  FieldErrors,
  FormProvider,
  useForm,
} from 'react-hook-form';
import { useEffect, useState } from 'react';
import hasSeason, {
  displayTitle,
  getEmptyItem,
  hasTimer,
  isVideoItem,
} from '../utils';
import { useItems } from '../contexts/ItemsProvider';
import dayjs from 'dayjs';
import { TimeInput } from '../components/TimeInput';
import {
  Button,
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
  TextField,
  Stack,
  InputLabel,
  useMediaQuery,
} from '@mui/material';
import { NumberField } from '../components/numberField/NumberField';
import { DEFAULT_STEP } from '../const';
import MediaAutocomplete from '../components/autocomplete/MediaAutocomplete';
import { useDialogsContext } from '../contexts/DialogsProvider';
import { useNavigate } from 'react-router-dom';

export const AddOrUpdateItemDialog = () => {
  const { addItem, editItem, removeItem } = useItems();
  const { dialogsState, setDialogsState } = useDialogsContext();

  const item = dialogsState.addOrUpdateItem;
  const isDownSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const methods = useForm<Item & { season: number }>({
    defaultValues: item ?? {
      category: DEFAULT_CATEGORY,
      status: DEFAULT_STATUS,
      season: 1,
      step: 1,
      value: 0,
    },
  });
  const [withTimer, setWithTimer] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const categoryWatcher = watch('category');
  const stepWatcher = watch('step');
  const statusWatcher = watch('status');

  const onSubmit = (data: Item) => {
    try {
      // removes empty properties from data
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v != null)
      ) as Item;

      const submittedItem: Item = {
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

      item
        ? editItem(submittedItem)
        : addItem({ ...submittedItem, lastUpdated: Date.now() });

      handleClose();
    } catch (error) {
      console.error(`Error while adding/updating item : `, error);
    }
  };

  const handleClose = () => {
    setDialogsState((prev) => ({
      ...prev,
      addOrUpdate: false,
      addOrUpdateItem: undefined,
    }));
  };

  const handleRemove = () => {
    if (item) {
      removeItem(item);
      handleClose();
      navigate('/');
    }
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
  }, [dialogsState.addOrUpdate]);

  return (
    <Dialog
      {...(isDownSm && { fullScreen: true })}
      open={dialogsState.addOrUpdate}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: (theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          }),
        },
      }}
    >
      <FormProvider {...methods}>
        <DialogTitle>
          {item ? displayTitle(item.media) : 'Item creation'}
        </DialogTitle>
        <DialogContent>
          <Stack
            sx={(theme) => ({
              mt: 1,
              gap: 5,
              [theme.breakpoints.up('sm')]: {
                minWidth: '500px',
              },
            })}
          >
            {!item && (
              <Controller
                name="category"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <FormControl>
                      <InputLabel id="category-id">{field.name}</InputLabel>
                      <Select<keyof typeof Category>
                        fullWidth
                        {...field}
                        labelId="category-label"
                        label={field.name}
                      >
                        {Object.values(Category).map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }}
              />
            )}

            <Controller
              name="status"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl>
                  <InputLabel id="status-label">{field.name}</InputLabel>
                  <Select<keyof typeof Status>
                    fullWidth
                    labelId="status-label"
                    label={field.name}
                    {...field}
                  >
                    {Object.values(Status).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <MediaAutocomplete />

            {statusWatcher !== Status.Done && (
              <>
                {hasSeason(item ?? ({ category: categoryWatcher } as Item)) && (
                  <NumberField
                    step={1}
                    min={0}
                    name="season"
                    label="Season"
                    defaultValue={1}
                    errored={
                      !!(errors as FieldErrors<Item & { season: number }>)
                        .season
                    }
                  />
                )}

                <NumberField
                  step={0.5}
                  min={0}
                  name="step"
                  label="Step"
                  errored={!!errors.step}
                />

                <NumberField
                  min={0}
                  name="value"
                  step={stepWatcher ?? DEFAULT_STEP}
                  label="Value"
                  errored={!!errors.value}
                />

                <Controller
                  name="link"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Link"
                      placeholder="Link"
                      helperText="Replace the value in the link by {{ value }} to reach it directly ! Basic calculation can be made like {{ value + 1 }} for some reasons (Webtoon...)"
                    />
                  )}
                />

                {isVideoItem(
                  item ?? ({ category: categoryWatcher } as Item)
                ) && (
                  <FormControl
                    fullWidth
                    variant="outlined"
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
                      {withTimer && <TimeInput />}
                    </Box>
                  </FormControl>
                )}
              </>
            )}
          </Stack>
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
      </FormProvider>
    </Dialog>
  );
};

export default AddOrUpdateItemDialog;
