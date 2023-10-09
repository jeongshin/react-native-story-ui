import React, { useCallback, useRef, type ReactElement, useMemo } from 'react';
import type { FlatListProps } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native';
// import { useStoryContext } from '../../../hooks/useStoryContext';
import { View } from 'react-native';
import {
  StoryFlatListContext,
  type StoryFlatListContextType,
} from '../../../context';
import type { GestureResponderEvent } from 'react-native';
import { useStoryContext } from '../../../hooks/useStoryContext';

interface StoryFlatListProps<T> extends FlatListProps<T> {
  pageIndex: number;
  PageHeaderElement?: ReactElement;
}

function StoryFlatList<T>({
  data = [],
  renderItem,
  pageIndex,
  PageHeaderElement,
  initialScrollIndex,
}: StoryFlatListProps<T>) {
  const { width, height } = useWindowDimensions();

  const maxItemIndex = data ? data.length - 1 : 0;

  const { setPageIndex } = useStoryContext();

  const ref = useRef<FlatList<T> | null>(null);

  const activeIndex = useRef<number>(initialScrollIndex ?? 0);

  const onPressItem = useCallback(
    (e: GestureResponderEvent) => {
      const pageX = e.nativeEvent.locationX;
      console.log('pageX', pageX);
      // to left
      if (pageX < width / 3) {
        if (activeIndex.current - 1 < 0) {
          setPageIndex(pageIndex - 1);
          return;
        }

        activeIndex.current -= 1;
      }

      // to right
      if (pageX > (width * 2) / 3) {
        if (activeIndex.current + 1 > maxItemIndex) {
          setPageIndex(pageIndex + 1);
          return;
        }

        activeIndex.current += 1;
      }

      ref.current?.scrollToIndex({
        index: activeIndex.current,
        animated: false,
      });
    },
    [width, setPageIndex, pageIndex, maxItemIndex]
  );

  const context = useMemo<StoryFlatListContextType>(
    () => ({
      onPressItem,
    }),
    [onPressItem]
  );

  // const context

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
      <View style={{ width, height }}>
        {PageHeaderElement}
        <FlatList
          ref={ref}
          data={data}
          getItemLayout={getItemLayout}
          renderItem={renderItem}
          snapToInterval={width}
          pagingEnabled
          horizontal
          windowSize={2}
          initialNumToRender={3}
          initialScrollIndex={initialScrollIndex}
          style={{ width, flex: 1 }}
          scrollEnabled={false}
        />
      </View>
    </StoryFlatListContext.Provider>
  );
}

export default StoryFlatList;
