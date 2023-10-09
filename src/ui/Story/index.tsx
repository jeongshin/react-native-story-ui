import React, { useCallback, type ReactNode, useState, useMemo } from 'react';
import type { NativeScrollEvent } from 'react-native';

import { useWindowDimensions, View } from 'react-native';
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
import type { StyleProp } from 'react-native';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export type StoryRenderItem<T> = (info: {
  item: T;
  index: number;
}) => ReactNode;

export interface StoryGestureConfig {
  minDistance?: number;
}

export interface StoryProps<T> {
  stories: T[][];
  renderItem: StoryRenderItem<T>;
  renderStory?: StoryRenderItem<T[]>;
  initialPageIndex?: number;
  onChangePageIndex?: (i: number) => void;
  onScroll?: (e: NativeScrollEvent) => void;
  gestureConfig?: StoryGestureConfig;
  springConfig?: Partial<WithSpringConfig>;
  minFlingVelocity?: number;
  style?: StyleProp<ViewStyle>;
  bounceThreshold?: number;
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
  // onScroll,
  // renderStory: givenRenderPage,
  renderItem,
  initialPageIndex = 0,
  onChangePageIndex,
  gestureConfig,
  springConfig,
  minFlingVelocity = 300,
  bounceThreshold = 0.4,
  style,
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

  // const scrollToPage = useCallback(
  //   (index: number) => {
  //     scrollX.value = withSpring(index * width * -1, savedSpringConfig);
  //   },
  //   [width, scrollX, savedSpringConfig]
  // );

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

  console.log('rerender', activePageIndex);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      console.log('begin', e.translationX);

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
        console.log('cannot scroll over min or max index');
        return;
      }

      scrollX.value = translateX;
      // const nextPageIndex = translateX / width;
      // console.log(nextPageIndex);
    })
    .onTouchesDown((_) => {
      console.log('touch down');
    })
    .onTouchesUp((_) => {
      console.log('touch up');
    })
    // .onTouchesMove((e) => {
    //   const [mainTouch] = e.changedTouches;
    //   if (!mainTouch) return;
    //   console.log('touch');
    // })
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
    .onFinalize(() => {
      'worklet';
      console.log('finalize', scrollX.value, scrollX.value / width);
    })
    .minDistance(gestureConfig?.minDistance ?? 10);

  return (
    <GestureDetector gesture={gesture}>
      <View style={StyleSheet.flatten([style, { width, height }])}>
        {stories.map((items, i) => (
          <CubeAnimation
            isActive={activePageIndex === i}
            scrollX={pageAnimation}
            index={i}
            key={`cube-${i}`}
          >
            {items.map((item, index) => renderItem({ item, index }))}
          </CubeAnimation>
        ))}
      </View>
    </GestureDetector>
  );
}

export { Story };
