import * as React from 'react';

import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Story, useStoryFlatListContext } from 'react-native-story-ui';
import type { StoryRenderItem } from 'react-native-story-ui';

type Item = {
  backgroundImage: string;
};

export default function App() {
  const stories: Item[][] = [
    [
      {
        backgroundImage:
          'https://i.namu.wiki/i/R0AhIJhNi8fkU2Al72pglkrT8QenAaCJd1as-d_iY6MC8nub1iI5VzIqzJlLa-1uzZm--TkB-KHFiT-P-t7bEg.webp',
      },
      {
        backgroundImage:
          'https://img.hankyung.com/photo/202306/03.33458954.1.jpg',
      },
      {
        backgroundImage:
          'https://img.hankyung.com/photo/202211/03.31930237.1.jpg',
      },
      {
        backgroundImage:
          'https://i.namu.wiki/i/4Mlxj6PmC-VGpH89-MVlhAEezBnrd5vMiYjF6HOEWEyIPeui5oSLYgRyqaOlMKy4Ss0jSz1LZBxkP549NvOsWA.webp',
      },
    ],
    [
      {
        backgroundImage:
          'https://talkimg.imbc.com/TVianUpload/tvian/TViews/image/2022/09/18/1e586277-48ba-4e8a-9b98-d8cdbe075d86.jpg',
      },
      {
        backgroundImage:
          'https://thumb.mtstarnews.com/06/2023/05/2023052417255985870_1.jpg/dims/optimize',
      },
      {
        backgroundImage:
          'https://file.sportsseoul.com/news/cms/2023/05/25/news-p.v1.20230525.c2fb938fcdad47a38f9db3b3e3064861_P1.jpg',
      },
    ],
    [
      {
        backgroundImage:
          'https://img.hankyung.com/photo/202303/BF.32882728.1.jpg',
      },
    ],
    [
      {
        backgroundImage:
          'https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/202310/01/bb0f0717-576f-4f54-87d2-64772ca9938a.jpg',
      },
    ],
  ];

  const { top } = useSafeAreaInsets();

  const renderStory: StoryRenderItem<Item[]> = ({ item: items, index }) => {
    return (
      <Story.FlatList
        data={items}
        pageIndex={index}
        renderItem={({ item }) => <Item item={item} />}
        PageFooterElement={
          <Story.PageHeader
            data={items}
            pageIndex={index}
            duration={5 * 1000}
            topInset={top + 8}
          />
        }
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Story
        stories={stories}
        renderStory={renderStory}
        style={{ backgroundColor: 'black' }}
      />
    </GestureHandlerRootView>
  );
}

const Item = ({ item }: { item: Item }) => {
  const { width } = useWindowDimensions();

  const { onPressItem } = useStoryFlatListContext();

  return (
    <Pressable onPress={onPressItem} style={{ width, flex: 1 }}>
      <Image
        source={{ uri: item.backgroundImage }}
        style={StyleSheet.absoluteFill}
        key={item.backgroundImage}
        resizeMode="cover"
      />
    </Pressable>
  );
};

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
