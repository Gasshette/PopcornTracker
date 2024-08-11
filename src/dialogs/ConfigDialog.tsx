import { Category, Status } from '../types/Item';
import { useConfig } from '../contexts/ConfigProvider';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { Config } from '../types/Config';
import { Controller, useForm } from 'react-hook-form';
import { useDialogsContext } from '../contexts/DialogsProvider';
import { ColorPicker } from '../components/colorPicker/ColorPicker';
import { StyledChip } from '../components/StyledChip';

const ConfigDialog = () => {
  const { config, setConfig } = useConfig();
  const { dialogsState, setDialogsState } = useDialogsContext();
  const { control, handleSubmit } = useForm<Config>({ defaultValues: config });

  const handleClose = () => {
    setDialogsState((prev) => ({ ...prev, settings: false }));
  };

  const onSubmit = (data: Config) => {
    setConfig(data);
    handleClose();
  };

  return (
    <Dialog open={dialogsState.settings} onClose={handleClose}>
      <DialogTitle>Settings</DialogTitle>
      <form
        onSubmit={handleSubmit(onSubmit, (error) =>
          console.error('Error in the form: ', error)
        )}
      >
        <DialogContent>
          {/* COLORS */}
          <Stack
            sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}
          >
            {Object.values(Category).map((category) => {
              return (
                <Controller
                  key={category}
                  control={control}
                  name={`colors.${category}`}
                  defaultValue={config.colors[category]}
                  render={({ field }) => (
                    <ColorPicker
                      {...field}
                      fullWidth
                      adornment={
                        <StyledChip label={category} color={field.value} />
                      }
                    />
                  )}
                />
              );
            })}
          </Stack>
          <Stack
            sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}
          >
            {Object.values(Status).map((status) => {
              return (
                <Controller
                  key={status}
                  control={control}
                  name={`status.${status}`}
                  defaultValue={config.status[status]}
                  render={({ field }) => (
                    <ColorPicker
                      {...field}
                      fullWidth
                      adornment={
                        <StyledChip label={status} color={field.value} />
                      }
                    />
                  )}
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ConfigDialog;
