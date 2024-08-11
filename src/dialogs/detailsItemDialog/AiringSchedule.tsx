import { Paper, Stack, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { Item } from '../../types/Item';
import { displayTitle, isAnilistMedia } from '../../utils';
import { NoDataMessageDisplayer } from '../../components/NoDataMessageDisplayer';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import { AnilistMedia } from '../../types/Anilist';

interface AiringScheduleProps {
  item: Item;
}
export const AiringSchedule = (props: AiringScheduleProps) => {
  const { item } = props;

  if (!isAnilistMedia(item.media)) {
    return <></>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {!item.media ||
        (item.media.airingSchedule?.nodes.length <= 0 && (
          <NoDataMessageDisplayer>
            No airing schedule provided for this media :(
          </NoDataMessageDisplayer>
        ))}
      {item.media?.airingSchedule?.nodes.map((a) => (
        <Paper key={a.id} sx={{ p: 2, position: 'relative' }}>
          {dayjs.unix(a.airingAt).isAfter(dayjs()) && (
            <Tooltip title="Airing in the future">
              <KeyboardDoubleArrowDown
                color="success"
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                }}
              />
            </Tooltip>
          )}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            <img
              src={(item.media as AnilistMedia)?.coverImage?.medium}
              alt={`${displayTitle(item.media)} - Episode ${a.episode}`}
            />
            <Stack>
              <Typography>
                {a.episode ? 'Episode' : 'Chapter'} {a.episode}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, .7)' }}
              >
                {dayjs.unix(a.airingAt).format('MM/DD/YYYY')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, .7)' }}
              >
                {dayjs.unix(a.airingAt).format('h:mm a')}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </LocalizationProvider>
  );
};
