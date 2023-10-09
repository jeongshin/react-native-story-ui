import { createContext } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export interface StoryContextType {
  activePageIndex: SharedValue<number>;
  setPageIndex: (idx: number) => void;
}

export const StoryContext = createContext<StoryContextType | null>(null);

export interface StoryFlatListContextType {
  activeItemIndex: SharedValue<number>;
  maxItemIndex: SharedValue<number>;
  handleSkipItemOnPress: (e: GestureResponderEvent) => void;
  // TODO: pause & resume header animation
}

export const StoryFlatListContext =
  createContext<StoryFlatListContextType | null>(null);
