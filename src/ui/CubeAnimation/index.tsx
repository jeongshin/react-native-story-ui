import React from 'react';
import { StyleSheet } from 'react-native';
import { Platform, useWindowDimensions } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface CubeAnimationProps {
  children: React.ReactNode;
  scrollX: SharedValue<number>;
  index: number;
  isActive: boolean;
}

const CubeAnimation: React.FC<CubeAnimationProps> = ({
  children,
  scrollX,
  index,
  isActive,
}) => {
  const { width } = useWindowDimensions();

  const ratio = Platform.OS === 'ios' ? 2 : 1.23;
  const offset = width * index;
  const angle = Math.atan(width / (width / 2));
  const inputRange = [offset - width, offset + width];

  const animatedStyle = useAnimatedStyle(() => {
    const translate = interpolate(
      scrollX.value,
      inputRange,
      [width / ratio, -width / ratio],
      Extrapolation.CLAMP
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [angle, -angle],
      Extrapolation.CLAMP
    );

    const translate1 = interpolate(
      scrollX.value,
      inputRange,
      [width / 2, -width / 2],
      Extrapolation.CLAMP
    );

    const extra = width / ratio / Math.cos(angle / 2) - width / ratio;

    const translate2 = interpolate(
      scrollX.value,
      inputRange,
      [-extra, extra],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: width },
        { translateX: translate },
        { rotateY: `${rotateY}rad` },
        { translateX: translate1 },
        { translateX: translate2 },
      ],
      opacity: interpolate(
        scrollX.value,
        [
          offset - width,
          offset - width * 0.8,
          offset,
          offset + width * 0.8,
          offset + width,
        ],
        [0, 0.5, 1, 0.5, 0],
        Extrapolation.CLAMP
      ),
    };
  }, []);

  return (
    <Animated.View
      pointerEvents={isActive ? 'auto' : 'none'}
      style={[{ width }, StyleSheet.absoluteFill, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
};

export { CubeAnimation };
