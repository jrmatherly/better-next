"use client"

import React, { ReactNode } from 'react';

// Types for drag and drop functionality
interface DraggableProps {
  draggableId: string;
  index: number;
  children: (providedDraggable: {
    draggableProps: any;
    dragHandleProps: any;
    innerRef: (element: HTMLElement | null) => void;
  }) => ReactNode;
}

interface DroppableProps {
  droppableId: string;
  direction?: 'vertical' | 'horizontal';
  children: (providedDroppable: {
    droppableProps: any;
    innerRef: (element: HTMLElement | null) => void;
    placeholder: ReactNode;
  }) => ReactNode;
}

interface DragDropContextProps {
  onDragEnd: (result: any) => void;
  children: ReactNode;
}

// Simple implementation of drag and drop context
export function DragDropContext({ children, onDragEnd }: DragDropContextProps) {
  return (
    <div className="drag-drop-context">
      {children}
    </div>
  );
}

// Simple implementation of droppable
export function Droppable({ children, droppableId, direction = 'vertical' }: DroppableProps) {
  return (
    <>
      {children({
        droppableProps: {
          'data-droppable-id': droppableId,
          'data-direction': direction,
        },
        innerRef: () => {},
        placeholder: null,
      })}
    </>
  );
}

// Simple implementation of draggable
export function Draggable({ children, draggableId, index }: DraggableProps) {
  return (
    <>
      {children({
        draggableProps: {
          'data-draggable-id': draggableId,
          'data-index': index,
        },
        dragHandleProps: {
          'data-drag-handle': true,
        },
        innerRef: () => {},
      })}
    </>
  );
}