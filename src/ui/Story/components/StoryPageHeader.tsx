import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useStoryFlatListContext } from '../../../hooks/useStoryFlatListContext';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useStoryContext } from '../../../hooks/useStoryContext';
import type { StyleProp, ViewStyle } from 'react-native';

interface StoryPageHeaderProps<T> {
  data: T[];
  duration?: number;
  paddingHorizontal?: number;
  gap?: number;
  inactiveColor?: string;
  activeColor?: string;
  pageIndex: number;

  // TODO: add props below
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
}

function StoryPageHeader<T>({
  duration = 3000,
  data,
  paddingHorizontal = 10,
  gap = 4,
  inactiveColor = '#ffffff44',
  activeColor = '#ffffff',
  pageIndex,
}: StoryPageHeaderProps<T>) {
  const { width } = useWindowDimensions();

  const { activeItemIndex } = useStoryFlatListContext();

  const { activePageIndex } = useStoryContext();

  const animation = useSharedValue<number>(0);

  // use reacted value to fix flickering since activeItemIndex value changes faster than animation value
  const reactedActiveItemIndex = useSharedValue<number>(activeItemIndex.value);

  const itemSize =
    (width - paddingHorizontal * 2 - gap * (data.length - 1)) / data.length;

  // TODO: start animation when focused image loaded
  useAnimatedReaction(
    () => [activeItemIndex.value, activePageIndex.value],
    () => {
      // console.log('active index changed', prev, next);

      if (activePageIndex.value !== pageIndex) return;

      animation.value = 0;

      reactedActiveItemIndex.value = activeItemIndex.value;

      cancelAnimation(animation);

      animation.value = withTiming(
        1,
        { duration, easing: Easing.linear },
        () => {
          // TODO: add auto next page feature
          // console.log('done animation', done, maxItemIndex);
        }
      );
    },
    [duration, pageIndex]
  );

  return (
    <View
      style={{
        width,
        height: 58,
        position: 'absolute',
        left: 0,
        top: 58,
        flexDirection: 'row',
        paddingHorizontal,
        justifyContent: 'space-evenly',
      }}
    >
      {data.map((_, index) => (
        <View
          style={{
            backgroundColor: inactiveColor,
            width: itemSize,
            height: 4,
            borderRadius: 4,
          }}
          key={index}
        >
          <AnimatedBar
            itemSize={itemSize}
            animation={animation}
            itemIndex={index}
            activeColor={activeColor}
            activeItemIndex={reactedActiveItemIndex}
          />
        </View>
      ))}
    </View>
  );
}

interface AnimatedBarProps {
  activeColor: string;
  itemSize: number;
  animation: Animated.SharedValue<number>;
  activeItemIndex: Animated.SharedValue<number>;
  itemIndex: number;
}

function AnimatedBar({
  activeColor,
  animation,
  itemSize,
  itemIndex,
  activeItemIndex,
}: AnimatedBarProps) {
  const style = useAnimatedStyle(() => {
    if (itemIndex > activeItemIndex.value) {
      return {
        width: 0,
      };
    }

    return {
      width:
        itemIndex === activeItemIndex.value
          ? interpolate(animation.value, [0, 1], [0, itemSize])
          : itemSize,
    };
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: activeColor,
          height: 4,
          borderRadius: 4,
          position: 'absolute',
          left: 0,
          top: 0,
        },
      ]}
    />
  );
}

export default StoryPageHeader;
