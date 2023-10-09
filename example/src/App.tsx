import * as React from 'react';

import { Image, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Story } from 'react-native-story-ui';
import type { StoryRenderItem } from 'react-native-story-ui';

type Item = {
  backgroundImage: string;
};

export default function App() {
  const pages: Item[][] = [
    [
      {
        backgroundImage:
          'https://i.namu.wiki/i/R0AhIJhNi8fkU2Al72pglkrT8QenAaCJd1as-d_iY6MC8nub1iI5VzIqzJlLa-1uzZm--TkB-KHFiT-P-t7bEg.webp',
      },
    ],
    [
      {
        backgroundImage:
          'https://talkimg.imbc.com/TVianUpload/tvian/TViews/image/2022/09/18/1e586277-48ba-4e8a-9b98-d8cdbe075d86.jpg',
      },
    ],
    [
      {
        backgroundImage:
          'https://img.hankyung.com/photo/202303/BF.32882728.1.jpg',
      },
    ],
  ];

  const { width, height } = useWindowDimensions();

  const renderItem: StoryRenderItem<Item> = ({ item }) => {
    return (
      <Image
        source={{ uri: item.backgroundImage }}
        style={{ width, height, backgroundColor: 'black' }}
        resizeMode="contain"
        key={item.backgroundImage}
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Story
        stories={pages}
        renderItem={renderItem}
        style={{ backgroundColor: 'black' }}
      />
    </GestureHandlerRootView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   box: {
//     width: 60,
//     height: 60,
//     marginVertical: 20,
//   },
// });
