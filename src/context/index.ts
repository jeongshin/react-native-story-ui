import { createContext } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { LongPressGesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';

export interface StoryContextType {
  activePageIndex: SharedValue<number>;
  setPageIndex: (idx: number) => void;
  longPressGesture: LongPressGesture;
  rootTouchState: SharedValue<TouchState>;
  rootPressState: SharedValue<PressState>;
}

export type TouchState = 'up' | 'down' | 'move';

export type PressState = 'pressIn' | 'pressOut' | 'longPress';

export const StoryContext = createContext<StoryContextType | null>(null);

export interface StoryFlatListContextType {
  activeItemIndex: SharedValue<number>;
  maxItemIndex: SharedValue<number>;
  skipToNextItem: () => void;
  onPressItem: (e: GestureResponderEvent) => void;
}

export const StoryFlatListContext =
  createContext<StoryFlatListContextType | null>(null);
