import React, { useCallback, useRef, type ReactElement, useMemo } from 'react';
import type { FlatListProps, GestureResponderEvent } from 'react-native';
import { View, FlatList, useWindowDimensions, StyleSheet } from 'react-native';

import {
  StoryFlatListContext,
  type StoryFlatListContextType,
} from '../../../context';
import { useStoryContext } from '../../../hooks/useStoryContext';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

interface StoryFlatListProps<T> extends FlatListProps<T> {
  pageIndex: number;
  PageHeaderElement?: ReactElement;
  PageFooterElement?: ReactElement;
}

function StoryFlatList<T>({
  data = [],
  renderItem,
  pageIndex,
  PageHeaderElement,
  initialScrollIndex,
  PageFooterElement,
  style,
  ...props
}: StoryFlatListProps<T>) {
  const { width } = useWindowDimensions();

  const maxItemIndex = useDerivedValue(() => {
    return data ? data.length - 1 : 0;
  }, [data?.length]);

  const { setPageIndex, rootPressState } = useStoryContext();

  const ref = useRef<FlatList<T> | null>(null);

  const activeItemIndex = useSharedValue<number>(initialScrollIndex ?? 0);

  const setActiveItem = useCallback(
    (index: number) => {
      activeItemIndex.value = index;

      ref.current?.scrollToIndex({
        index: index,
        animated: false,
      });
    },
    [activeItemIndex]
  );

  const skipToNextItem = useCallback(() => {
    const nextItemIndex = activeItemIndex.value + 1;
    if (nextItemIndex > maxItemIndex.value) {
      return setPageIndex(pageIndex + 1);
    }

    setActiveItem(nextItemIndex);
  }, [activeItemIndex, maxItemIndex, pageIndex, setActiveItem, setPageIndex]);

  const handleSkipItemOnPress = useCallback(
    (e: GestureResponderEvent) => {
      'worklet';
      if (rootPressState.value === 'longPress') return;

      const pageX = e.nativeEvent.pageX;
      let nextItemIndex = activeItemIndex.value;

      // to left
      if (pageX < width / 3) {
        if (activeItemIndex.value <= 0) {
          setPageIndex(pageIndex - 1);
          return;
        }

        nextItemIndex -= 1;
      } else if (pageX > (width * 2) / 3) {
        if (activeItemIndex.value >= maxItemIndex.value) {
          setPageIndex(pageIndex + 1);
          return;
        }

        nextItemIndex += 1;
      } else {
        return;
      }

      if (!ref.current) return;

      setActiveItem(nextItemIndex);
    },
    [
      activeItemIndex,
      width,
      setActiveItem,
      setPageIndex,
      pageIndex,
      maxItemIndex,
      rootPressState,
    ]
  );

  const context = useMemo<StoryFlatListContextType>(
    () => ({
      maxItemIndex,
      onPressItem: handleSkipItemOnPress,
      activeItemIndex,
      skipToNextItem,
    }),
    [maxItemIndex, handleSkipItemOnPress, activeItemIndex, skipToNextItem]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<T> | undefined | null, index: number) => {
      return {
        length: width,
        offset: width * index,
        index: index,
      };
    },
    [width]
  );

  return (
    <StoryFlatListContext.Provider value={context}>
      {PageHeaderElement}
      <FlatList
        ref={ref}
        {...props}
        data={data}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        snapToInterval={width}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialScrollIndex}
        style={style}
        scrollEnabled={false}
      />
      {PageFooterElement}
    </StoryFlatListContext.Provider>
  );
}

export default StoryFlatList;
