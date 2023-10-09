import React, { type ReactNode, useCallback, useState, useMemo } from 'react';

import type { NativeScrollEvent, StyleProp, ViewStyle } from 'react-native';

import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from 'react-native-reanimated';
import { CubeAnimation } from '../CubeAnimation';
import { StoryContext, type StoryContextType } from '../../context';
import StoryPageHeader from './components/StoryPageHeader';
import StoryFlatList from './components/StoryFlatList';

export type StoryRenderItem<T> = (info: {
  item: T;
  index: number;
}) => ReactNode;

export interface StoryGestureConfig {
  minDistance?: number;
}

export interface StoryProps<T> {
  stories: T[][];
  renderStory: StoryRenderItem<T[]>;
  initialPageIndex?: number;
  onChangePageIndex?: (i: number) => void;
  onScroll?: (e: NativeScrollEvent) => void;
  gestureConfig?: StoryGestureConfig;
  springConfig?: Partial<WithSpringConfig>;
  minFlingVelocity?: number;
  style?: StyleProp<ViewStyle>;
  bounceThreshold?: number;
  onReachedFirstPage?: () => void;
  onReachedLastPage?: () => void;
}

const SPRING_CONFIG: WithSpringConfig = {
  damping: 20,
  mass: 0.2,
  stiffness: 100,
  overshootClamping: false,
  restSpeedThreshold: 0.2,
  restDisplacementThreshold: 0.2,
};

function Story<T>({
  stories,
  initialPageIndex = 0,
  onChangePageIndex,
  gestureConfig,
  springConfig,
  minFlingVelocity = 300,
  bounceThreshold = 0.4,
  renderStory,
  style,
  onReachedFirstPage,
  onReachedLastPage,
}: StoryProps<T>) {
  const { width, height } = useWindowDimensions();

  const scrollX = useSharedValue(initialPageIndex * width);

  const pageIndex = useSharedValue(initialPageIndex);

  const savedScrollX = useSharedValue(0);

  const pageAnimation = useSharedValue(0);

  const [activePageIndex, setActivePageIndex] = useState(initialPageIndex);

  const maxPageIndex = useDerivedValue(
    () => stories.length - 1,
    [stories.length]
  );

  console.log('activePageIndex', activePageIndex);

  const savedSpringConfig = useMemo<WithSpringConfig>(
    () => ({ ...SPRING_CONFIG, springConfig }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChangePageIndex = useCallback(
    (index: number) => {
      console.log('=======PAGE CHANGED======', index);
      setActivePageIndex(index);
      onChangePageIndex?.(index);
    },
    [onChangePageIndex]
  );

  const setPageIndex = useCallback(
    (index: number) => {
      if (index < 0) {
        return onReachedFirstPage?.();
      }

      if (index > maxPageIndex.value) {
        return onReachedLastPage?.();
      }

      scrollX.value = withSpring(index * width * -1, savedSpringConfig);
      pageIndex.value = index;
      handleChangePageIndex(index);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, handleChangePageIndex]
  );

  useAnimatedReaction(
    () => Math.round(pageIndex.value),
    (next, prev) => {
      if (next === prev) return;
      runOnJS(handleChangePageIndex)(next);
    },
    [handleChangePageIndex]
  );

  useDerivedValue(() => {
    pageAnimation.value = scrollX.value * -1;
  }, [pageAnimation, scrollX]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          savedScrollX.value = scrollX.value;
        })
        .onUpdate((e) => {
          'worklet';
          const translateX = e.translationX + savedScrollX.value;

          if (
            // page over min index
            translateX > width * bounceThreshold ||
            // page over max index
            Math.abs(translateX) >
              width * maxPageIndex.value + width * bounceThreshold
          ) {
            console.log(
              '[react-native-story-ui] cannot scroll over min or max index'
            );
            return;
          }

          scrollX.value = translateX;
        })
        .onEnd((e) => {
          'worklet';
          const velocity = e.velocityX;
          const isFling = Math.abs(velocity) > minFlingVelocity;
          const sign = Math.sign(velocity);
          const flingMomentum = isFling ? (width / 2) * sign : 0;
          let page = -Math.round((scrollX.value + flingMomentum) / width);

          if (page < 0) {
            page = 0;
          }

          if (page > maxPageIndex.value) {
            page = maxPageIndex.value;
          }

          scrollX.value = withSpring(-page * width, savedSpringConfig);

          pageIndex.value = page;
        })
        .minDistance(gestureConfig?.minDistance ?? 10),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bounceThreshold, gestureConfig?.minDistance, minFlingVelocity, width]
  );

  const context: StoryContextType = useMemo(
    () => ({
      setPageIndex,
      activePageIndex: pageIndex,
    }),
    [setPageIndex, pageIndex]
  );

  return (
    <GestureDetector gesture={gesture}>
      <StoryContext.Provider value={context}>
        <View style={StyleSheet.flatten([style, { width, height }])}>
          {stories.map((items, i) => (
            <CubeAnimation
              isActive={activePageIndex === i}
              scrollX={pageAnimation}
              index={i}
              key={`cube-${i}`}
            >
              {renderStory?.({ item: items, index: i })}
            </CubeAnimation>
          ))}
        </View>
      </StoryContext.Provider>
    </GestureDetector>
  );
}

Story.PageHeader = StoryPageHeader;
Story.FlatList = StoryFlatList;

export { Story };
