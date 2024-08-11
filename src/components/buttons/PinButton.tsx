import { PushPin, PushPinOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { MouseEvent } from 'react';
import { useItems } from '../../contexts/ItemsProvider';
import { isFavoriteColor } from '../../const';

interface PinButtonProps {
  disabled: boolean;
  isPinned: boolean;
  itemId: string;
}
export const PinButton = (props: PinButtonProps) => {
  const { disabled, isPinned, itemId } = props;

  const { toggleFavorite } = useItems();

  const handlePinButton = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(itemId);
  };

  return (
    <IconButton
      size="medium"
      disabled={disabled}
      sx={{ color: isFavoriteColor }}
      onClick={handlePinButton}
    >
      {isPinned ? (
        <PushPin fontSize="small" />
      ) : (
        <PushPinOutlined fontSize="small" />
      )}
    </IconButton>
  );
};
