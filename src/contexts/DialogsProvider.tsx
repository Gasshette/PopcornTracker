import { createContext, useContext, useState } from 'react';
import { Item } from '../types/Item';

interface DialogsState {
  addOrUpdate: boolean;
  settings: boolean;
  share: boolean;
  addOrUpdateItem?: Item;
}

export interface DialogsContext {
  dialogsState: DialogsState;
  setDialogsState: React.Dispatch<React.SetStateAction<DialogsState>>;
}

const DialogsContext = createContext<DialogsContext | null>(null);

export const DialogsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [dialogsState, setDialogsState] = useState<DialogsState>({
    addOrUpdate: false,
    settings: false,
    share: false,
  });

  return (
    <DialogsContext.Provider value={{ dialogsState, setDialogsState }}>
      {children}
    </DialogsContext.Provider>
  );
};

export const useDialogsContext = () => {
  const dialogsContext = useContext(DialogsContext);
  if (!dialogsContext)
    throw new Error('useDialogsContext must be used within a DialogsProvider');
  return dialogsContext;
};
