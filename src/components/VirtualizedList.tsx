import { LogLevel, VirtuosoGrid } from 'react-virtuoso';
import { useItems } from '../contexts/ItemsProvider';
import { Box, Button } from '@mui/material';
import ListItem from './ListItem';
import { forwardRef, MouseEvent } from 'react';
import { ArrowUpward } from '@mui/icons-material';
import { resetScrollY } from '../utils';
import { scrollYKey } from '../const';

const gridComponents = {
  List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <Box
        ref={ref}
        sx={(theme) => ({
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 2,
          [theme.breakpoints.down('sm')]: {
            gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))',
          },
        })}
        {...props}
      >
        {children}
      </Box>
    )
  ),
  Item: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <Box
        ref={ref}
        sx={(theme) => ({
          width: 400,
          height: 250,
          margin: 'auto',
          [theme.breakpoints.down('sm')]: {
            width: '100%',
          },
        })}
        {...props}
      >
        {children}
      </Box>
    )
  ),
};
const VirtualizedList = () => {
  const { filteredItems } = useItems();

  const handleReadyStateChanged = (ready: boolean) => {
    if (!ready) {
      return;
    }

    const saved = sessionStorage.getItem(scrollYKey);

    if (saved) {
      window.scrollTo({ top: Number(saved), behavior: 'instant' });
    }
  };

  const handleScrollTop = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    resetScrollY('smooth');
    event.currentTarget.blur();
  };

  return (
    <>
      <Button
        onClick={handleScrollTop}
        sx={{
          position: 'fixed',
          bottom: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
          width: 36,
          minWidth: 36,
          height: 36,
          minHeight: 36,
          borderRadius: '50%',
          zIndex: 9999,
          '&, &:focus': {
            backgroundColor: 'rgba(25, 25, 25, 0.5) !important',
          },
        }}
      >
        <ArrowUpward color="action" />
      </Button>
      <VirtuosoGrid
        useWindowScroll
        logLevel={LogLevel.DEBUG}
        data={filteredItems}
        increaseViewportBy={1000}
        components={gridComponents}
        itemContent={(_, data) => <ListItem key={data.id} item={data} />}
        readyStateChanged={handleReadyStateChanged}
        style={{
          width: '100%',
          borderRadius: '4px',
        }}
      />
    </>
  );
};

export default VirtualizedList;
