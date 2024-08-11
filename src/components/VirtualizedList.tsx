import { Virtuoso } from 'react-virtuoso';
import { useItems } from '../contexts/ItemsProvider';
import { Item } from '../types/Item';
import { Box } from '@mui/material';
import { listStyle } from '../pages/Home';
import ListItem from './ListItem';

const VirtualizedList = () => {
  const { filteredItems } = useItems();

  return (
    <Box sx={listStyle}>
      <Virtuoso<Item>
        useWindowScroll
        data={filteredItems}
        increaseViewportBy={1000}
        itemContent={(index, data) => (
          <Box key={data.id} sx={{ ...(index !== 0 && { marginTop: 1.5 }) }}>
            <ListItem item={data} />
          </Box>
        )}
        style={{
          width: '100%',
          borderRadius: '4px',
        }}
      />
    </Box>
  );
};

export default VirtualizedList;
