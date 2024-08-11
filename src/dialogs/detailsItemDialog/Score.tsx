import { Box, Rating, Tooltip, Typography } from '@mui/material';

interface ScoreProps {
  score: number;
  voteCount?: number;
  isUnderSm?: boolean;
}

export const Score = (props: ScoreProps) => {
  const { score, voteCount, isUnderSm } = props;

  const note = (Number(score) / 20).toFixed(1);
  const tooltipTitle = `${note} (${score} out of 100)`;

  return (
    <Tooltip title={tooltipTitle}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}
      >
        <Rating value={Number(note)} precision={0.1} readOnly />
        {isUnderSm && <Typography variant="caption">{tooltipTitle}</Typography>}
        {voteCount && (
          <Typography variant="caption">({voteCount} votes)</Typography>
        )}
      </Box>
    </Tooltip>
  );
};
