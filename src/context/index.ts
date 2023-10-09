import { createContext } from 'react';
import type { GestureResponderEvent } from 'react-native';

export interface StoryContextType {
  setPageIndex: (idx: number) => void;
}

export const StoryContext = createContext<StoryContextType | null>(null);

export interface StoryFlatListContextType {
  onPressItem: (e: GestureResponderEvent) => void;
}

export const StoryFlatListContext =
  createContext<StoryFlatListContextType | null>(null);
