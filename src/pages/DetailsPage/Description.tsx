import { FormatQuote } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { Item } from '../../types/Item';
import { isAnilistMedia } from '../../utils';

interface DescriptionProps {
  item: Item;
}

export const Description = (props: DescriptionProps) => {
  const { item } = props;

  return (
    <Paper
      sx={{
        p: 2,
        my: 4,
        mt: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'flex',
          fontStyle: 'italic',
        }}
        fontSize={14}
      >
        <FormatQuote fontSize="large" sx={{ mt: -4 }} />
        <Box
          sx={{ flexGrow: 1 }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              isAnilistMedia(item.media)
                ? item.media.description
                : (item.media?.overview ?? 'No description found')
            ),
          }}
        />
        <FormatQuote
          fontSize="large"
          sx={{
            mb: -4,
            alignSelf: 'flex-end',
          }}
        />
      </Typography>
    </Paper>
  );
};
