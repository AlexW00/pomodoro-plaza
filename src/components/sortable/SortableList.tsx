import { ReactNode, createContext, useContext, useMemo, useState } from 'react';

interface SortableContextType {
  items: any[];
  startDrag: (id: string) => void;
  endDrag: () => void;
  draggedId: string | null;
  dragOverId: string | null;
  setDragOverId: (id: string | null) => void;
}

const SortableContext = createContext<SortableContextType | null>(null);

export const useSortable = () => {
  const context = useContext(SortableContext);
  if (!context) {
    throw new Error('useSortable must be used within a SortableList');
  }
  return context;
};

interface SortableListProps<T> {
  items: T[];
  onDragEnd: (items: T[]) => void;
  children: (item: T) => ReactNode;
  className?: string;
}

export function SortableList<T extends { id: string }>({
  items,
  onDragEnd,
  children,
  className = '',
}: SortableListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  const startDrag = (id: string) => {
    setDraggedId(id);
  };
  
  const endDrag = () => {
    if (draggedId && dragOverId && draggedId !== dragOverId) {
      const draggedIndex = items.findIndex(item => item.id === draggedId);
      const dropIndex = items.findIndex(item => item.id === dragOverId);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        const newItems = [...items];
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, removed);
        onDragEnd(newItems);
      }
    }
    
    setDraggedId(null);
    setDragOverId(null);
  };
  
  const contextValue = useMemo(() => ({
    items,
    startDrag,
    endDrag,
    draggedId,
    dragOverId,
    setDragOverId,
  }), [items, draggedId, dragOverId]);
  
  return (
    <SortableContext.Provider value={contextValue}>
      <div className={className}>
        {items.map(item => children(item))}
      </div>
    </SortableContext.Provider>
  );
}

interface SortableItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function SortableItem({ id, children, className = '' }: SortableItemProps) {
  const { startDrag, endDrag, draggedId, dragOverId, setDragOverId } = useSortable();
  
  const isDragging = draggedId === id;
  const isOver = dragOverId === id;
  
  return (
    <div
      draggable
      onDragStart={() => startDrag(id)}
      onDragEnd={endDrag}
      onDragOver={(e) => {
        e.preventDefault();
        if (id !== draggedId) {
          setDragOverId(id);
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        if (id !== draggedId) {
          setDragOverId(id);
        }
      }}
      onDragLeave={() => {
        if (dragOverId === id) {
          setDragOverId(null);
        }
      }}
      className={`${className} ${isDragging ? 'opacity-50' : ''} ${
        isOver ? 'ring-2 ring-primary ring-opacity-50' : ''
      } transition-all`}
      style={{
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {children}
    </div>
  );
}