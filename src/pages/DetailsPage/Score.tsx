import { Rating, Stack, Typography } from '@mui/material';
import { isFavoriteColor } from '../../const';

interface ScoreProps {
  score: number;
}

export const Score = (props: ScoreProps) => {
  const { score } = props;

  const note = (Number(score) / 20).toFixed(1);

  return (
    <Stack direction="row" sx={{ alignItems: 'start', gap: 0.5 }}>
      <Rating
        readOnly
        size="small"
        value={Number(note)}
        precision={0.1}
        sx={{ color: isFavoriteColor }}
      />
      <Typography variant="caption">({note})</Typography>
    </Stack>
  );
};
