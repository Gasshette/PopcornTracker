import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import { useDialogsContext } from '../contexts/DialogsProvider';
import { useAuth } from '../contexts/AuthProvider';
import { ContentCopy, OpenInNew, ThumbUp } from '@mui/icons-material';
import { ClickAnimIcon } from '../components/ClickAnimIcon';
import { useRef } from 'react';

export const ShareDialog = () => {
  const { dialogsState, setDialogsState } = useDialogsContext();
  const auth = useAuth();
  const animationRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setDialogsState((prev) => ({ ...prev, share: false }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${auth.user?.id}`);
  };

  const handleOpenLink = () => {
    window.open(`${window.location.origin}/${auth.user?.id}`, '_blank');
  };

  return (
    <Dialog
      fullWidth
      open={dialogsState.share}
      onClose={handleClose}
      maxWidth="sm"
    >
      <DialogTitle>Share your profile</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            value={`${window.location.origin}/${auth.user?.id}`}
          />
          <ClickAnimIcon SvgIcon={ThumbUp} target={animationRef} />
          <IconButton ref={animationRef} onClick={handleCopy}>
            <ContentCopy />
          </IconButton>
          <IconButton onClick={handleOpenLink}>
            <OpenInNew />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
