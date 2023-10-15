import {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useStoryContext } from './useStoryContext';
import { useStoryFlatListContext } from './useStoryFlatListContext';
import { useCallback } from 'react';

export interface UseStoryPageHeaderAnimationProps {
  duration: number;
  pageIndex: number;
  shouldAutoPlayOnActiveItemChanged: boolean;
  shouldPauseResumeOnLongPressed: boolean;
  shouldPauseResumeOnPanGesture: boolean;
}

export function useStoryPageHeaderAnimation({
  duration,
  pageIndex,
  shouldPauseResumeOnPanGesture,
  shouldAutoPlayOnActiveItemChanged,
  shouldPauseResumeOnLongPressed,
}: UseStoryPageHeaderAnimationProps) {
  const { activeItemIndex, skipToNextItem } = useStoryFlatListContext();

  const { activePageIndex, rootPressState, rootTouchState } = useStoryContext();

  const animation = useSharedValue<number>(0);

  const pausedAnimation = useSharedValue<number>(0);

  const pausedActivePageIndex = useSharedValue<number>(activePageIndex.value);

  // use reacted value to fix flickering since activeItemIndex value changes faster than animation value
  const reactedActiveItemIndex = useSharedValue<number>(activeItemIndex.value);

  const animationCallback = useCallback(
    (done: boolean | undefined) => {
      'worklet';
      if (activePageIndex.value !== pageIndex) return;

      if (!done) {
        return;
      }

      runOnJS(skipToNextItem)();
      animation.value = 0;
    },
    [skipToNextItem, pageIndex, activePageIndex, animation]
  );

  // case 1. animate when active item index changes via cube animation with pan gesture
  // TODO: start animation when focused image loaded

  useAnimatedReaction(
    () => `${activeItemIndex.value}-${activePageIndex.value}`,
    () => {
      if (!shouldAutoPlayOnActiveItemChanged) return;

      if (activePageIndex.value !== pageIndex) return;

      animation.value = 0;

      reactedActiveItemIndex.value = activeItemIndex.value;

      cancelAnimation(animation);

      animation.value = withTiming(
        1,
        { duration, easing: Easing.linear },
        animationCallback
      );
    },
    [duration, pageIndex, animationCallback, shouldAutoPlayOnActiveItemChanged]
  );

  // case 2. pause & resume animation when long press detected
  useAnimatedReaction(
    () => rootPressState.value,
    (next, prev) => {
      if (!shouldPauseResumeOnLongPressed) return;

      if (
        activePageIndex.value !== pageIndex ||
        next === null ||
        prev === null
      ) {
        return;
      }

      if (next === 'longPress' && prev === 'pressIn') {
        pausedAnimation.value = animation.value;
        pausedActivePageIndex.value = activePageIndex.value;
        cancelAnimation(animation);
        return;
      }

      if (
        next === 'pressOut' &&
        prev === 'longPress' &&
        activePageIndex.value === pausedActivePageIndex.value
      ) {
        animation.value = withTiming(
          1,
          {
            duration: (1 - pausedAnimation.value) * duration,
            easing: Easing.linear,
          },
          animationCallback
        );
      }
    },
    [animationCallback, pageIndex, duration, shouldPauseResumeOnLongPressed]
  );

  // case 3. pause & resume animation when cube animation detected
  useAnimatedReaction(
    () => rootTouchState.value,
    (next, prev) => {
      if (!shouldPauseResumeOnPanGesture) {
        return;
      }

      if (prev === null) {
        return;
      }

      if (next === 'move') {
        pausedAnimation.value = animation.value;
        pausedActivePageIndex.value = activePageIndex.value;
        cancelAnimation(animation);
        return;
      }

      if (
        next === 'up' &&
        prev === 'move' &&
        activePageIndex.value === pausedActivePageIndex.value &&
        pageIndex === activePageIndex.value
      ) {
        animation.value = withTiming(
          1,
          {
            duration: (1 - pausedAnimation.value) * duration,
            easing: Easing.linear,
          },
          animationCallback
        );
      }
    },
    [shouldPauseResumeOnPanGesture]
  );

  return { animation, activeItemIndex: reactedActiveItemIndex };
}
