import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { useItems } from '../contexts/ItemsProvider';
import { Item } from '../types/Item';
import { Box } from '@mui/material';
import { useId } from 'react';

interface DraggableListProps {
  items: Array<Item>;
  isFavorite?: boolean;
  render: (item: Item) => JSX.Element;
}

const DraggableList = (props: DraggableListProps) => {
  const { items, isFavorite = false, render } = props;
  const {
    setItems,
    filteredItems,
    filters,
    textFilter,
    items: allItems,
  } = useItems();
  const id = useId();

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination || !textFilter || filters.length > 0) return;

    const reorderedItems = Array.from(allItems);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    setItems([...reorderedItems]);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId={`${id}-droppable-list`}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
            }}
          >
            {(filters.length > 0 || textFilter ? filteredItems : items)
              .filter((item) => item.isFavorite === isFavorite)
              .map((item, index) => (
                <Draggable
                  key={`${id}-${item.id}`}
                  draggableId={`${id}-${item.id}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {render(item)}
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
