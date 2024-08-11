import { Box, List, ListItem, Stack, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { Item } from '../../types/Item';
import { isAnilistMedia } from '../../utils';
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
      <List
        sx={(theme) => ({
          width: 500,
          [theme.breakpoints.down('sm')]: {
            width: '100%',
          },
        })}
      >
        {item.media?.airingSchedule?.nodes.map((a) => (
          <ListItem
            key={a.id}
            sx={{
              position: 'relative',
              p: 1,
              mb: 1,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${(item.media as AnilistMedia)?.bannerImage ?? (item.media as AnilistMedia)?.coverImage.large}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 20%, black 100%)',
                maskImage:
                  'linear-gradient(to right, transparent 0%, transparent 20%, black 100%)',
              }}
            ></Box>
            <Box>
              <Typography>
                <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
                  {a.episode ? 'Episode' : 'Chapter'} {a.episode}
                  {dayjs.unix(a.airingAt).isAfter(dayjs()) && (
                    <>
                      {'  '}
                      <Tooltip title="Airing in the future">
                        <KeyboardDoubleArrowDown color="success" />
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, .7)' }}
              >
                {dayjs.unix(a.airingAt).format('MM/DD/YYYY')}
              </Typography>
              {'  '}
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, .7)' }}
              >
                {dayjs.unix(a.airingAt).format('h:mm a')}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </LocalizationProvider>
  );
};
