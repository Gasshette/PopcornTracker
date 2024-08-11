import { Category, Status } from '../types/Item';
import { MuiColorInput } from 'mui-color-input';
import { useConfig } from '../contexts/ConfigProvider';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ConfigDialog = (props: SettingsDialogProps) => {
  const { open, onClose } = props;
  const { config, setConfig } = useConfig();

  const handleColorChange = (
    color: string,
    category: keyof typeof Category
  ) => {
    if (color !== config.colors[category]) {
      const newColors = { ...config.colors, [category]: color };
      setConfig({ ...config, colors: newColors });
    }
  };

  const handleStatusChange = (color: string, status: keyof typeof Status) => {
    if (color !== config.status[status]) {
      const newStatus = { ...config.status, [status]: color };
      setConfig({ ...config, status: newStatus });
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        {/* COLORS */}
        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.values(Category).map((category) => {
            return (
              <MuiColorInput
                key={category}
                fullWidth
                isAlphaHidden={false}
                format="hex8"
                variant="outlined"
                value={config.colors[category]}
                onChange={(value) => handleColorChange(value, category)}
                sx={{ '& .MuiInputBase-input': { textAlign: 'right' } }}
                Adornment={(props) => (
                  <Button {...props}>
                    <Chip
                      size="small"
                      label={category}
                      style={{ backgroundColor: config.colors[category] }}
                    />
                  </Button>
                )}
              />
            );
          })}
        </Stack>

        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
          {Object.values(Status).map((status) => {
            return (
              <MuiColorInput
                key={status}
                fullWidth
                isAlphaHidden={false}
                format="hex8"
                variant="outlined"
                value={config.status[status]}
                onChange={(value) => handleStatusChange(value, status)}
                sx={{ '& .MuiInputBase-input': { textAlign: 'right' } }}
                Adornment={(props) => (
                  <Button {...props}>
                    <Chip
                      size="small"
                      label={status}
                      style={{ backgroundColor: config.status[status] }}
                    />
                  </Button>
                )}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDialog;
