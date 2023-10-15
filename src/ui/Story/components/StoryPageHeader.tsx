import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import {
  useStoryPageHeaderAnimation,
  type UseStoryPageHeaderAnimationProps,
} from '../../../hooks/useStoryPageHeaderContext';

interface StoryPageHeaderProps<T>
  extends Partial<UseStoryPageHeaderAnimationProps> {
  data: T[];
  paddingHorizontal?: number;
  gap?: number;
  inactiveColor?: string;
  activeColor?: string;
  pageIndex: number;
  topInset?: number;
  style?: StyleProp<ViewStyle>;
}

function StoryPageHeader<T>({
  duration = 4000,
  data,
  paddingHorizontal = 10,
  gap = 4,
  inactiveColor = '#ffffff44',
  activeColor = '#ffffff',
  pageIndex,
  topInset = 54,
  style,
  shouldAutoPlayOnActiveItemChanged = true,
  shouldPauseResumeOnLongPressed = true,
  shouldPauseResumeOnPanGesture = true,
}: StoryPageHeaderProps<T>) {
  const { width } = useWindowDimensions();

  const itemSize =
    (width - paddingHorizontal * 2 - gap * (data.length - 1)) / data.length;

  const { activeItemIndex, animation } = useStoryPageHeaderAnimation({
    duration,
    pageIndex,
    shouldAutoPlayOnActiveItemChanged,
    shouldPauseResumeOnLongPressed,
    shouldPauseResumeOnPanGesture,
  });

  return (
    <View
      style={StyleSheet.flatten([
        {
          width,
          position: 'absolute',
          left: 0,
          top: topInset,
          flexDirection: 'row',
          paddingHorizontal,
          justifyContent: 'space-evenly',
        },
        style,
      ])}
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
            activeItemIndex={activeItemIndex}
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
