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
import { StyleSheet } from 'react-native';
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
  const { width, height } = useWindowDimensions();

  const maxItemIndex = useDerivedValue(() => {
    return data ? data.length - 1 : 0;
  }, [data?.length]);

  const { setPageIndex } = useStoryContext();

  const ref = useRef<FlatList<T> | null>(null);

  const activeItemIndex = useSharedValue<number>(initialScrollIndex ?? 0);

  const onPressItem = useCallback(
    (e: GestureResponderEvent) => {
      'worklet';
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

      console.log('scroll to index', nextItemIndex);

      ref.current.scrollToIndex({
        index: nextItemIndex,
        animated: false,
      });

      activeItemIndex.value = nextItemIndex;
    },
    [width, setPageIndex, pageIndex, maxItemIndex, activeItemIndex]
  );

  const context = useMemo<StoryFlatListContextType>(
    () => ({
      maxItemIndex,
      handleSkipItemOnPress: onPressItem,
      activeItemIndex,
    }),
    [onPressItem, maxItemIndex, activeItemIndex]
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
      <View style={{ width, height }}>
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
          initialScrollIndex={initialScrollIndex}
          style={StyleSheet.flatten([style, { width, flex: 1 }])}
          scrollEnabled={false}
        />
        {PageFooterElement}
      </View>
    </StoryFlatListContext.Provider>
  );
}

export default StoryFlatList;
