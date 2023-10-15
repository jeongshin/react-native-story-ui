import React, { type ReactNode, useCallback, useState, useMemo } from 'react';

import type { StyleProp, ViewStyle } from 'react-native';

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
import {
  StoryContext,
  type PressState,
  type StoryContextType,
  type TouchState,
} from '../../context';
import StoryPageHeader from './components/StoryPageHeader';
import StoryFlatList from './components/StoryFlatList';

export type StoryRenderItem<T> = (info: {
  item: T;
  index: number;
}) => ReactNode;

export interface StoryPanGestureConfig {
  minDistance?: number;
  minFlingVelocity?: number;
  springConfig?: Partial<WithSpringConfig>;
  bounceThreshold?: number;
}

export interface StoryLongPressGestureConfig {
  minDuration?: number;
  maxDistance?: number;
  enabled?: boolean;
}

export interface StoryProps<T> {
  stories: T[][];
  renderStory: StoryRenderItem<T[]>;
  initialPageIndex?: number;
  onChangePageIndex?: (i: number) => void;
  panGestureConfig?: StoryPanGestureConfig;
  longPressGestureConfig?: StoryPanGestureConfig;
  style?: StyleProp<ViewStyle>;
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

const DEFAULT_PAN_GESTURE_CONFIG: Required<StoryPanGestureConfig> = {
  springConfig: SPRING_CONFIG,
  minDistance: 10,
  minFlingVelocity: 300,
  bounceThreshold: 0.4,
};

const DEFAULT_LONG_PRESS_GESTURE_CONFIG: Required<StoryLongPressGestureConfig> =
  {
    minDuration: 200,
    maxDistance: 10,
    enabled: true,
  };

function Story<T>({
  stories,
  initialPageIndex = 0,
  panGestureConfig: _panGestureConfig,
  longPressGestureConfig: _longPressGestureConfig,
  onChangePageIndex,
  renderStory,
  style,
  onReachedFirstPage,
  onReachedLastPage,
}: StoryProps<T>) {
  const { width } = useWindowDimensions();

  const scrollX = useSharedValue(initialPageIndex * width);

  const pageIndex = useSharedValue(initialPageIndex);

  const savedScrollX = useSharedValue(0);

  const pageAnimation = useSharedValue(0);

  const rootTouchState = useSharedValue<TouchState>('up');

  const rootPressState = useSharedValue<PressState>('pressOut');

  const panGestureConfig = useMemo<Required<StoryPanGestureConfig>>(
    () => ({
      ...DEFAULT_PAN_GESTURE_CONFIG,
      ..._panGestureConfig,
    }),
    [_panGestureConfig]
  );

  const longPressGestureConfig = useMemo<Required<StoryLongPressGestureConfig>>(
    () => ({
      ...DEFAULT_LONG_PRESS_GESTURE_CONFIG,
      ..._longPressGestureConfig,
    }),
    [_longPressGestureConfig]
  );

  const [activePageIndex, setActivePageIndex] = useState(initialPageIndex);

  const maxPageIndex = useDerivedValue(
    () => stories.length - 1,
    [stories.length]
  );

  const savedSpringConfig = useMemo<WithSpringConfig>(
    () => ({ ...SPRING_CONFIG }),
    []
  );

  const handleChangePageIndex = useCallback(
    (index: number) => {
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

  const panGesture = useMemo(
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
            translateX > width * panGestureConfig.bounceThreshold ||
            // page over max index
            Math.abs(translateX) >
              width * maxPageIndex.value +
                width * panGestureConfig.bounceThreshold
          ) {
            // console.log(
            //   '[react-native-story-ui] cannot scroll over min or max index'
            // );
            return;
          }

          scrollX.value = translateX;
        })
        .onEnd((e) => {
          'worklet';
          const velocity = e.velocityX;
          const isFling =
            Math.abs(velocity) > panGestureConfig.minFlingVelocity;
          const sign = Math.sign(velocity);
          const flingMomentum = isFling ? (width / 2) * sign : 0;

          let nextPage = -Math.round((scrollX.value + flingMomentum) / width);

          if (nextPage < 0) {
            nextPage = 0;
          }

          if (nextPage > maxPageIndex.value) {
            nextPage = maxPageIndex.value;
          }

          scrollX.value = withSpring(
            -nextPage * width,
            savedSpringConfig,
            () => {
              pageIndex.value = nextPage;
            }
          );
        })
        .onTouchesDown(() => {
          rootTouchState.value = 'down';
        })
        .onTouchesMove((e) => {
          if (e.state !== 4) return;
          rootTouchState.value = 'move';
        })
        .onTouchesUp(() => {
          rootTouchState.value = 'up';
        })
        .minDistance(panGestureConfig.minDistance)
        .minPointers(1)
        .maxPointers(1),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, panGestureConfig]
  );

  const longPressGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(longPressGestureConfig.minDuration)
        .maxDistance(longPressGestureConfig.maxDistance)
        .enabled(longPressGestureConfig.enabled)
        .onBegin(() => {
          rootPressState.value = 'pressIn';
        })
        .onStart(() => {
          rootPressState.value = 'longPress';
        })
        .onEnd(() => {
          rootPressState.value = 'pressOut';
        }),
    [longPressGestureConfig, rootPressState]
  );

  const context: StoryContextType = useMemo(
    () => ({
      setPageIndex,
      activePageIndex: pageIndex,
      rootTouchState,
      rootPressState,
      longPressGesture,
    }),
    [setPageIndex, pageIndex, rootTouchState, rootPressState, longPressGesture]
  );

  const gesture = useMemo(
    () => Gesture.Simultaneous(longPressGesture, panGesture),
    [longPressGesture, panGesture]
  );

  return (
    <GestureDetector gesture={gesture}>
      <StoryContext.Provider value={context}>
        <View style={StyleSheet.flatten([{ width, flex: 1 }, style])}>
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
