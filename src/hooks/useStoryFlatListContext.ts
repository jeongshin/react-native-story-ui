import { useContext } from 'react';
import { StoryFlatListContext } from '../context';

export function useStoryFlatListContext() {
  const context = useContext(StoryFlatListContext);

  if (!context) {
    throw new Error(
      '[react-native-story-ui] You must use useStoryFlatListContext inside a <Story.FlatList>'
    );
  }

  return context;
}
